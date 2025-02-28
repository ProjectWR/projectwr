import { FireProvider } from "y-fire";
import firebaseApp from "./Firebase";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


let instance;

class SyncManager {
  constructor() {
    if (instance) {
      throw new Error(
        "SyncManager is a singleton class. Use getInstance() instead."
      );
    }

    /***
     *
     * @type {Map<string, FireProvider>}
     */
    this.fireProviderMap = new Map();
    instance = this;
  }

  getProviderMap() {
    if (!this.fireProviderMap) {
      throw new Error("No providerMap initialized");
    }

    return this.fireProviderMap;
  }

  async initFireSync(ydoc) {
    if (!ydoc) {
      throw new Error("Yjs document is required to initialize persistence");
    }

    const path = `users/${getAuth(firebaseApp).currentUser.uid}/docs/${ydoc.guid}`;
    console.log("path: ", path);

    const yFireProvider = new FireProvider({
      firebaseApp,
      ydoc,
      path: `users/${getAuth(firebaseApp).currentUser.uid}/docs/${ydoc.guid}`,
      maxUpdatesThreshold: 1,
      maxWaitTime: 1,
      maxWaitFirestoreTime: 1
    });

    // Wait until the provider's `uid` is set (indicating initialization is complete)
    await new Promise((resolve) => {
      const checkInitialization = () => {
        if (yFireProvider.uid !== undefined) {
          resolve(true);
        } else {
          setTimeout(checkInitialization, 100); // Check again after a short delay
        }
      };
      checkInitialization();
    });

    ydoc.getMap("library_props").set("yfire_sync_init_datetime", new Date().toISOString());

    this.fireProviderMap.set(
      ydoc.guid,
      yFireProvider
    );
  }
}

const syncManager = Object.freeze(
  new SyncManager()
);

export default syncManager;
