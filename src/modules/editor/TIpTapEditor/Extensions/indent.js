import { Extension } from '@tiptap/core';
import { AllSelection, TextSelection, Transaction } from 'prosemirror-state';


export const Indent = Extension.create({
    name: 'indent',

    addOptions: {
        types: ['listItem', 'paragraph'],
        minLevel: 0,
        maxLevel: 8,
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        renderHTML: attributes => {
                            return attributes?.indent > this.options.minLevel ? { 'data-indent': attributes.indent } : null;
                        },
                        parseHTML: element => {
                            const level = Number(element.getAttribute('data-indent'));
                            return level && level > this.options.minLevel ? level : null;
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        const setNodeIndentMarkup = (tr, pos, delta) => {
            const node = tr?.doc?.nodeAt(pos);

            if (node) {
                const nextLevel = (node.attrs.indent || 0) + delta;
                const { minLevel, maxLevel } = this.options;
                const indent = nextLevel < minLevel ? minLevel : nextLevel > maxLevel ? maxLevel : nextLevel;


                if (indent !== node.attrs.indent) {
                    const { indent: oldIndent, ...currentAttrs } = node.attrs;
                    const nodeAttrs = indent > minLevel ? { ...currentAttrs, indent } : currentAttrs;

                    return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
                }
            }
            return tr;
        };

        const updateIndentLevel = (tr, delta) => {
            const { doc, selection } = tr;


            if (doc && selection && (selection instanceof TextSelection || selection instanceof AllSelection)) {
                const { from, to } = selection;

                doc.nodesBetween(from, to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        tr = setNodeIndentMarkup(tr, pos, delta);
                        return false;
                    }

                    return true;
                });
            }

            return tr;
        };
        const applyIndent =
            direction =>
                () =>
                    ({ tr, state, dispatch }) => {
                        const { selection } = state;
                        tr = tr.setSelection(selection);
                        tr = updateIndentLevel(tr, direction);

                        if (tr.docChanged) {
                            dispatch?.(tr);
                            return true;
                        }

                        return false;
                    };

        return {
            indent: applyIndent(1),
            outdent: applyIndent(-1),
        };
    },

    addKeyboardShortcuts() {    
        return {
            'Ctrl-Tab': () => {
                this.editor.commands.indent()
            },
            'Ctrl-Shift-Tab': () => {
                this.editor.commands.outdent();
                return true;
            },
        };
    },
});