import * as Y from "yjs";
import persistenceManagerForSubdocs from "./persistenceSubDocs";
import dictionaryManager from "./dictionary";
import { binaryInlined, Dialect, WorkerLinter } from "harper.js";

let instance;

class LinterManager {
  constructor() {
    if (instance) {
      throw new Error(
        "Use LinterManager.getInstance() to get the singleton instance.",
      );
    }

    /** @type {WorkerLinter} */
    this.linter = null;

    /** @type {Y.Doc} */
    this.ignoredPhrasesYDoc = null;

    this.isInitialized = false;
  }

  static getInstance() {
    if (!instance) {
      throw new Error(
        "LinterManager instance not initialized. Call init() first.",
      );
    }
    return instance;
  }

  async init() {
    if (this.isInitialized) {
      console.log("LinterManager already initialized");
      return;
    }

    console.log("Initializing LinterManager...");

    // 1. Create WorkerLinter instance
    this.linter = new WorkerLinter({
      binary: binaryInlined,
      dialect: Dialect.British,
    });

    // 2. Initialize Y.Doc for ignored phrases
    const ydoc = new Y.Doc({ guid: "linter-ignored-phrases" });
    await persistenceManagerForSubdocs.initLocalPersistenceForYDoc(ydoc);
    this.ignoredPhrasesYDoc = ydoc;

    // 3. Load ignored phrases from Y.Doc and import into linter
    await this.loadIgnoredPhrases();

    // 4. Sync dictionary words from dictionaryManager
    await this.syncDictionaryWords();

    // 5. Subscribe to dictionary changes
    this.setupDictionarySync();

    this.isInitialized = true;
    console.log("LinterManager initialized successfully");

    return () => {
      this.ignoredPhrasesYDoc.destroy();
    };
  }

  /**
   * Load ignored phrases from Y.Doc and import into linter
   */
  async loadIgnoredPhrases() {
    const ignoredArray = this.ignoredPhrasesYDoc.getArray("ignoredLints");
    const hashes = ignoredArray.toArray();

    if (hashes.length === 0) {
      console.log("No ignored phrases to load");
      return;
    }

    console.log(`Loading ${hashes.length} ignored hashes`);

    for (const hashStr of hashes) {
      try {
        // Validation: skip objects or invalid types from previous broken saves
        if (
          typeof hashStr === "object" ||
          hashStr === null ||
          hashStr === undefined
        ) {
          console.warn(
            "Skipping invalid stored ignore item (legacy/polluted data):",
            hashStr,
          );
          continue;
        }

        // We store as strings to ensure BigInt safe serialization
        const hash = BigInt(hashStr);
        await this.linter.ignoreLintHash(hash);
      } catch (e) {
        console.error(`Error loading ignored hash ${hashStr}:`, e);
      }
    }

    console.log("Finished loading ignored hashes");
  }

  /**
   * Sync all dictionary words to linter
   */
  async syncDictionaryWords() {
    if (!dictionaryManager.dictionaryYDoc) {
      console.warn("Dictionary not initialized, skipping word sync");
      return;
    }

    const words = dictionaryManager.getWordArray();
    if (words && words.length > 0) {
      console.log(`Syncing ${words.length} dictionary words to linter`);
      await this.linter.importWords(words);
    }
  }

  /**
   * Setup real-time sync with dictionary changes
   */
  setupDictionarySync() {
    if (!dictionaryManager.dictionaryYDoc) {
      console.warn("Dictionary not initialized, skipping sync setup");
      return;
    }

    const wordList = dictionaryManager.dictionaryYDoc.getArray("wordList");

    const callbackFn = async () => {
      // For arrays, it's safer/easier to just re-sync the whole list or diff it.
      // Since harper doesn't support fine-grained "remove", full re-sync is cleanest for now.
      console.log("Dictionary (Array) changed, re-syncing words to linter");
      const allWords = dictionaryManager.getWordArray();
      await this.linter.clearWords();
      if (allWords && allWords.length > 0) {
        await this.linter.importWords(allWords);
      }
    };

    wordList.observe(callbackFn);

    // Store cleanup function
    this._dictionaryCleanup = () => {
      wordList.unobserve(callbackFn);
    };
  }

  /**
   * Lint text using the WorkerLinter
   * @param {string} text - Text to lint
   * @returns {Promise<Array>} Array of lint objects
   */
  async lint(text) {
    if (!this.linter) {
      throw new Error("Linter not initialized");
    }
    return await this.linter.lint(text);
  }

  /**
   * Ignore a specific lint error
   * @param {string} source - The source text
   * @param {Object} lint - The lint object from harper.js
   */
  async ignoreLint(source, lint) {
    if (!this.linter) {
      throw new Error("Linter not initialized");
    }

    // 1. Ignore in harper.js (local session)
    await this.linter.ignoreLint(source, lint);

    try {
      // 2. Get stable hash for persistence
      const hash = await this.linter.contextHash(source, lint);
      const hashStr = hash.toString();

      // 3. Sync with Y.Array
      const ignoredArray = this.ignoredPhrasesYDoc.getArray("ignoredLints");

      // Efficient check to avoid duplicates
      if (!ignoredArray.toArray().includes(hashStr)) {
        console.log(`Persisting new ignored lint hash: ${hashStr}`);
        this.ignoredPhrasesYDoc.transact(() => {
          ignoredArray.push([hashStr]);
        });
      } else {
        console.log(`Ignored lint hash ${hashStr} already persisted`);
      }
    } catch (e) {
      console.error("Error persisting ignored lint:", e);
    }
  }

  /**
   * Get the WorkerLinter instance
   * @returns {WorkerLinter}
   */
  getLinter() {
    return this.linter;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this._dictionaryCleanup) {
      this._dictionaryCleanup();
    }
    if (this.linter) {
      this.linter.dispose();
    }
    if (this.ignoredPhrasesYDoc) {
      // Close persistence connection properly
      persistenceManagerForSubdocs.closeConnectionForYDoc(
        this.ignoredPhrasesYDoc.guid,
      );
      this.ignoredPhrasesYDoc.destroy();
    }
    this.isInitialized = false;
  }
}

const linterManager = new LinterManager();
instance = linterManager;

export default linterManager;
