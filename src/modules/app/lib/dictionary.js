import { load } from "@tauri-apps/plugin-store";
import * as Y from "yjs";
import persistenceManagerForSubdocs from "./persistenceSubDocs";


let instance;

class DictionaryManager {
    constructor() {
        if (instance) {
            throw new Error('Use DictionaryManager.getInstance() to get the singleton instance.');
        }

        /** @type {Y.Doc} */
        this.dictionaryYDoc = null;
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
        ydoc.getArray("wordArray");

        await persistenceManagerForSubdocs.initLocalPersistenceForYDoc(ydoc);

        this.dictionaryYDoc = ydoc;

        console.log(ydoc.toJSON());
    }

    destroy() {
        if (!this.dictionaryYDoc) {
            console.log("Dictionary Y Doc not initiated ");
            return;
        }

        this.dictionaryYDoc.destroy();
    }

    addWord(word, definition, synonyms) {
        if (!this.dictionaryYDoc) {
            console.log("Dictionary Y Doc not initiated ");
            return;
        }
        const wordArray = this.dictionaryYDoc.getArray("wordArray");

        wordArray.push({
            word: word,
            definition: definition,
            synonyms: synonyms
        });
    }

    removeWord(index) {
        if (!this.dictionaryYDoc) {
            console.log("Dictionary Y Doc not initiated ");
            return;
        }

        const wordArray = this.dictionaryYDoc.getArray("wordArray");

        if (wordArray.length <= index) {
            throw new Error("[DictionaryManager] invalid index")
        }

        wordArray.delete(index);
    }

    getWordArray() {
        if (!this.dictionaryYDoc) {
            console.log("Dictionary Y Doc not initiated ");
            return;
        }

        const wordArray = this.dictionaryYDoc.getArray("wordArray");

        return wordArray.toArray().map(([value, index]) => {
            return { index: index, word: value }
        });
    }
}

const dictionaryManager = new DictionaryManager();

export default dictionaryManager;