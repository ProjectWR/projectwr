import { useEffect } from "react";
import { loadDefaultSettings, loadSettings } from "../lib/settings";
import { settingsStore } from "../stores/settingsStore";
import dataManager from "../lib/data";
import persistenceManagerForSubdocs from "../lib/persistenceSubDocs";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Library from "./Library/Library";
import { ThemeProvider } from "./ThemeProvider";

function WritingApp() {
  const setDefaultSettings = settingsStore((state) => state.setDefaultSettings);
  const setSettings = settingsStore((state) => state.setSettings);

  useEffect(() => {
    // Code to run when the component initiates
    loadSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
    });

    loadDefaultSettings().then((defaultSettings) => {
      setDefaultSettings(defaultSettings);
    });

    dataManager.fetchOrInitLibraries();

    //  persistenceManagerForSubdocs.clearAllPersistence();

    persistenceManagerForSubdocs.initLocalPersistenceForYDoc(
      dataManager.getYDoc()
    );

    dataManager.getYDoc().on("subdocs", ({ loaded, added, removed }) => {
      if (loaded) {
        loaded.forEach((subdoc) =>
          console.log("subdoc loaded", subdoc.toJSON())
        );
      }

      if (added) {
        added.forEach((subdoc) =>
          console.log("subdoc added", subdoc.toJSON())
        );
      }

      if (removed) {
        removed.forEach((subdoc) =>
          console.log("subdoc removed", subdoc.toJSON())
        );
      }
    });

    persistenceManagerForSubdocs.indexeddbProviderMap
      .get(dataManager.getYDoc().guid)
      .on("synced", () => {
        const allSubdocs = dataManager.getYDoc().getSubdocs();

        allSubdocs.forEach((yDoc) => {
          yDoc.load();

          console.log("loaded ydoc: ", yDoc);
          persistenceManagerForSubdocs.initLocalPersistenceForYDoc(yDoc);
        });

        
      });
  }, [setSettings, setDefaultSettings]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DndProvider backend={HTML5Backend}>
        <div
          id="AppContainer"
          className="dark border  h-screen max-h-screen w-screen font-serif font-normal "
        >
          <Library />
        </div>
      </DndProvider>
    </ThemeProvider>
  );
}

// export default WritingApp;
