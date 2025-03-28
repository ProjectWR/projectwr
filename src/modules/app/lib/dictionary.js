import { load } from "@tauri-apps/plugin-store";
import * as Y from "yjs";
import persistenceManagerForSubdocs from "./persistenceSubDocs";
import nspell from "nspell";
import { resolveResource } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { word } from "lib0/prng";

let instance;

class DictionaryManager {
    constructor() {
        if (instance) {
            throw new Error('Use DictionaryManager.getInstance() to get the singleton instance.');
        }

        /** @type {Y.Doc} */
        this.dictionaryYDoc = null;

        /** @type {nspell} */
        this.userSpellchecker = null;

        this.aff = null
    }

    static getInstance() {
        if (!instance) {
            throw new Error('FontManager instance not initialized. Call init() first.');
        }
        return instance;
    }

    async init() {
        if (this.dictionaryYDoc) {
            console.log("Dictionary Y Doc already initiated ");
            return;
        }

        const ydoc = new Y.Doc({ guid: "dictionary" });

        const wordMap = ydoc.getMap("wordMap");

        await persistenceManagerForSubdocs.initLocalPersistenceForYDoc(ydoc);

        this.dictionaryYDoc = ydoc;

        const aff = await readTextFile(await resolveResource('resources/index.aff'));
        const dic = await readTextFile(await resolveResource("resources/index.dic"));

        this.aff = aff;

        this.userSpellchecker = nspell({ aff: aff, dic: dic });

        const words = [];

        for (const value of wordMap.values()) {
            words.push(value.word);
        }

        this.userSpellchecker.personal(words.join('\n'));

        const callbackFn = (event) => {
            event.changes.keys.forEach((change, key) => {
                if (change.action === 'add') {
                    this.userSpellchecker.add(wordMap.get(key).word)
                } else if (change.action === 'delete') {
                    this.userSpellchecker.remove(wordMap.get(key).word)
                }
            })
        }

        wordMap.observe(callbackFn)

        console.log("Dictionary manager ydoc: ", ydoc.toJSON());

        return () => {
            this.dictionaryYDoc.destroy();
            wordMap.unobserve(callbackFn);
        }
    }

    getWord(word) {
        if (!this.dictionaryYDoc) {
            console.log("Dictionary Y Doc not initiated ");
            return;
        }
        const wordMap = this.dictionaryYDoc.getMap("wordMap");

        return wordMap.get(word);
    }

    addOrUpdateWord(word, definition, synonyms) {
        if (!this.dictionaryYDoc) {
            console.log("Dictionary Y Doc not initiated ");
            return;
        }
        const wordMap = this.dictionaryYDoc.getMap("wordMap");

        wordMap.set(word, {
            word: word,
            definition: definition,
            synonyms: synonyms
        });
    }

    removeWord(word) {
        if (!this.dictionaryYDoc) {
            console.log("Dictionary Y Doc not initiated ");
            return;
        }

        const wordMap = this.dictionaryYDoc.getMap("wordMap");

        wordMap.delete(word);
    }

    getWordArray() {
        if (!this.dictionaryYDoc) {
            console.log("Dictionary Y Doc not initiated ");
            return;
        }

        const wordMap = this.dictionaryYDoc.getMap("wordMap");

        console.log("Getting Word Map: ", wordMap.toJSON());

        return Object.values(wordMap.toJSON()).map((value, index) => value.word);
    }

}

const dictionaryManager = new DictionaryManager();

export default dictionaryManager;