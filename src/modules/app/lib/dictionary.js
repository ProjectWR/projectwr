import * as Y from "yjs";
import persistenceManagerForSubdocs from "./persistenceSubDocs";
import nspell from "nspell";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";

let instance;

class DictionaryManager {
  constructor() {
    if (instance) {
      throw new Error(
        "Use DictionaryManager.getInstance() to get the singleton instance.",
      );
    }

    /** @type {Y.Doc} */
    this.dictionaryYDoc = null;

    this.aff = null;
  }

  static getInstance() {
    if (!instance) {
      throw new Error(
        "FontManager instance not initialized. Call init() first.",
      );
    }
    return instance;
  }

  async init() {
    if (this.dictionaryYDoc) {
      console.log("Dictionary Y Doc already initiated ");
      return;
    }

    const ydoc = new Y.Doc({ guid: "dictionary" });

    await persistenceManagerForSubdocs.initLocalPersistenceForYDoc(ydoc);

    this.dictionaryYDoc = ydoc;

    console.log("Dictionary manager ydoc: ", ydoc.toJSON());

    return () => {
      this.dictionaryYDoc.destroy();
    };
  }

  getWord(word) {
    if (!this.dictionaryYDoc) {
      console.log("Dictionary Y Doc not initiated ");
      return;
    }
    const wordList = this.dictionaryYDoc.getArray("wordList");

    return wordList.toArray().find((w) => w.word === word);
  }

  addOrUpdateWord(word, definition, synonyms) {
    if (!this.dictionaryYDoc) {
      console.log("Dictionary Y Doc not initiated ");
      return;
    }
    const wordList = this.dictionaryYDoc.getArray("wordList");

    const existingIndex = wordList.toArray().findIndex((w) => w.word === word);

    const newWordObj = {
      word: word,
      definition: definition,
      synonyms: synonyms,
    };

    if (existingIndex !== -1) {
      this.dictionaryYDoc.transact(() => {
        wordList.delete(existingIndex, 1);
        wordList.insert(existingIndex, [newWordObj]);
      });
    } else {
      wordList.push([newWordObj]);
    }
  }

  removeWord(word) {
    if (!this.dictionaryYDoc) {
      console.log("Dictionary Y Doc not initiated ");
      return;
    }

    const wordList = this.dictionaryYDoc.getArray("wordList");
    const index = wordList.toArray().findIndex((w) => w.word === word);

    if (index !== -1) {
      wordList.delete(index, 1);
    }
  }

  getWordArray() {
    if (!this.dictionaryYDoc) {
      console.log("Dictionary Y Doc not initiated ");
      return;
    }

    const wordList = this.dictionaryYDoc.getArray("wordList");

    console.log("Getting Word List: ", wordList.toJSON());

    return wordList.toArray().map((value) => value.word);
  }
}

const dictionaryManager = new DictionaryManager();

export default dictionaryManager;
