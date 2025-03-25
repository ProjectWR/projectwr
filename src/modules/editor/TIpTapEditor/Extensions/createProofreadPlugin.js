/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import hash from 'object-hash';
import { ChangeSet } from 'prosemirror-changeset';
import { wait } from 'lib0/promise';

function debounce(func, wait) {
    let timeout;

    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}


function generateNodeKey(node) {
    return hash({
        content: node.textContent
    });
}

function generateErrorKey(error) {
    const keyContent = `${error.from}-${error.to}-${hash(error.msg)}`;
    return keyContent;
}

const spellcheckkey = new PluginKey('proofreadPlugin');

export function createProofreadPlugin(
    debounceTimeMS,
    generateProofreadErrors,
    getSpellCheckEnabled,
    getCustomText
) {
    const debouncedCheck = debounce(check, debounceTimeMS);
    let editorview;

    function containsOnlyTextNodes(node) {
        let onlyText = true;
        node.forEach((child) => {
            if (!child.isText && child.type.name !== 'inline_math') {
                onlyText = false;
                return false;
            }
        });
        return onlyText;
    }

    async function proofread(text) {
        const response = await generateProofreadErrors(text);
        const data = response;
        const errors = data.matches;
        const problems = [];
        if (!Array.isArray(errors)) {
            return [];
        }
        for (const error of errors) {
            problems.push({
                from: error.offset,
                to: error.offset + error.length,
                msg: error.message,
                shortmsg: error.shortMessage,
                type: error.type.typeName,
                replacements: error.replacements
            });
        }
        return problems;
    }

    async function check(doc, pluginState, editorView) {
        const decorations = [];
        const processErrors = (errors, offset, ignoredErrors) => {
            errors.forEach((error) => {
                const errorKey = generateErrorKey(error);
                if (!ignoredErrors.has(errorKey)) {
                    const classname = error.type === 'UnknownWord' ? 'spelling-error' : 'spelling-warning';
                    decorations.push(
                        Decoration.inline(
                            error.from + offset,
                            error.to + offset,
                            { class: classname },
                            { error, key: errorKey }
                        )
                    );
                }
            });
        };

        const tasks = [];
        doc.descendants((node, pos) => {
            if (!containsOnlyTextNodes(node)) {
                return true;
            }
            tasks.push(async () => {
                if (node.textContent && node.textContent.length > 1) {
                    const nodeKey = generateNodeKey(node);
                    if (!pluginState.cacheMap.has(nodeKey)) {
                        const errors = await proofread(getCustomText ? getCustomText(node) : getDefaultCustomText(node));
                        pluginState.cacheMap.set(nodeKey, { problems: errors, text: node.textContent });
                    }
                    const offset = pos + 1;
                    processErrors(
                        pluginState.cacheMap.get(nodeKey)?.problems || [],
                        offset,
                        pluginState.ignoredErrors
                    );
                }
            });
            return false;
        });

        for (const task of tasks) {
            await task();
        }
        pluginState.decor = DecorationSet.create(doc, decorations);
        const tr = editorView.state.tr;
        tr.setMeta('proofread', pluginState);
        editorView.dispatch(tr);
    }

    return new Plugin({
        key: spellcheckkey,
        view(view) {
            editorview = view;
            console.log(getSpellCheckEnabled.get());
            setTimeout(() => {
                const tr = view.state.tr;
                tr.setMeta('forceProofread', true);
                console.log("forcing proofread");
                view.dispatch(tr);
            }, 100);


            const unsubscribe = getSpellCheckEnabled.subscribe(async (value) => {
                const spellcheckEnabled = value;
                const tr = view.state.tr;
                tr.setMeta('updateSpellcheckEnabled', spellcheckEnabled);
                view.dispatch(tr);
            });
            return {
                destroy() {
                    unsubscribe();
                }
            };
        },
        state: {
            init() {
                return {
                    cacheMap: new Map(),
                    ignoredErrors: new Map(),
                    decor: DecorationSet.empty,
                    spellcheckEnabled: getSpellCheckEnabled.get()
                };
            },
            apply(tr, old, oldState, newState) {
                const spellcheckEnabledMeta = tr.getMeta('updateSpellcheckEnabled');
                let spellcheckEnabled = old.spellcheckEnabled;
                if (typeof spellcheckEnabledMeta !== 'undefined') {
                    spellcheckEnabled = spellcheckEnabledMeta;
                }
                if (spellcheckEnabled === false) {
                    return {
                        ...old,
                        spellcheckEnabled,
                        decor: DecorationSet.empty
                    };
                }
                const asyncDecros = tr.getMeta('proofread');
                if (asyncDecros) {
                    return asyncDecros;
                }
                const forceProofread = tr.getMeta('forceProofread');
                if (!tr.docChanged && spellcheckEnabled === old.spellcheckEnabled && !forceProofread) return old;
                getOldNodes([tr], oldState).forEach((changednode) => {
                    old.cacheMap.delete(generateNodeKey(changednode.node));
                });
                const newIgnoredErrors = new Map();
                old.ignoredErrors.forEach((value, key) => {
                    const [from, to, msgHash] = key.split('-');
                    const mappedFrom = tr.mapping.map(parseInt(from));
                    const mappedTo = tr.mapping.map(parseInt(to));
                    const newKey = `${mappedFrom}-${mappedTo}-${msgHash}`;
                    newIgnoredErrors.set(newKey, true);
                });
                const newDeco = old.decor.map(tr.mapping, tr.doc);
                debouncedCheck(
                    newState.doc,
                    {
                        cacheMap: old.cacheMap,
                        decor: newDeco,
                        ignoredErrors: newIgnoredErrors,
                        spellcheckEnabled: spellcheckEnabled
                    },
                    editorview
                );
                return {
                    cacheMap: old.cacheMap,
                    decor: newDeco,
                    ignoredErrors: newIgnoredErrors,
                    spellcheckEnabled
                };
            }
        },
        props: {
            decorations(state) {
                return this.getState(state)?.decor;
            }
        }
    });
}

function getOldNodes(transactions, prevState) {
    let changeSet = ChangeSet.create(prevState.doc);
    for (const txn of transactions.filter((txn) => txn.docChanged)) {
        changeSet = changeSet.addSteps(
            changeSet.startDoc,
            txn.steps.map((step) => step.getMap()),
            []
        );
    }
    const oldNodes = [];
    for (const change of changeSet.changes) {
        const start = change.fromA;
        const end = change.toA;
        prevState.doc.nodesBetween(start, end, (node, pos) => {
            oldNodes.push({
                node,
                pos
            });
            return false;
        });
    }
    return oldNodes;
}

function getDefaultCustomText(node) {
    let textContent = '';
    node.content.forEach((child) => {
        if (child.isText) {
            textContent += child.text;
        } else if (child.isInline) {
            textContent += `$${getDefaultCustomText(child)}$`;
        } else {
            textContent += getDefaultCustomText(child);
        }
    });
    return textContent;
}

export default createProofreadPlugin;