import { useEffect, useState } from "react";
import { settingsStore } from "../stores/settingsStore";
import { useDeviceType } from "../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../stores/appStore";
import {
  fillInDefaultSettings,
  loadDefaultSettings,
  loadSettings,
} from "../lib/settings";
import { fetchUserLibraryListStore } from "../lib/libraries";
import dataManagerSubdocs from "../lib/dataSubDoc";
import persistenceManagerForSubdocs from "../lib/persistenceSubDocs";
import { ThemeProvider } from "../ConfigProviders/ThemeProvider";
import Footer from "./LayoutComponents/Footer";
import MainPanel from "./LayoutComponents/MainPanel";
import SidePanel from "./LayoutComponents/SidePanel";
import ActivityBar from "./LayoutComponents/ActivityBar";
import ActionBar from "./LayoutComponents/ActionBar";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { SizingProvider } from "../ConfigProviders/SizingThemeProvider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const WritingApp = () => {
  const [loading, setLoading] = useState(true);

  const { deviceType } = useDeviceType();

  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const setDefaultSettings = settingsStore((state) => state.setDefaultSettings);
  const setSettings = settingsStore((state) => state.setSettings);
  const setLibraryListStore = appStore((state) => state.setLibraryListStore);
  const settings = settingsStore((state) => state.settings);

  const [sidePanelScope, sidePanelAnimate] = useAnimate();

  useEffect(() => {
    if (sidePanelScope.current) {
      sidePanelAnimate(
        sidePanelScope.current,
        { x: panelOpened ? 0 : -500 },
        { ease: "circInOut" },
        { duration: 0.2 }
      );
    }
  }, [panelOpened, sidePanelAnimate, sidePanelScope]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load settings
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);

        await fillInDefaultSettings();

        const defaultSettings = await loadDefaultSettings();
        setDefaultSettings(defaultSettings);

        // Fetch user library store
        const userLibraryStore = await fetchUserLibraryListStore();
        setLibraryListStore(userLibraryStore);

        const databases = await indexedDB.databases();

        for (const db of databases) {
          const libraryId = db.name;
          console.log("Database: ", libraryId);
          const exists = await userLibraryStore.has(libraryId);
          if (!exists) {
            await userLibraryStore.set(libraryId, "");
          }

          dataManagerSubdocs.initLibrary(libraryId);
          const ydoc = dataManagerSubdocs.getLibrary(libraryId);

          console.log("ydoc", ydoc);

          console.log("Before persistence: ", ydoc.guid, ydoc);
          await persistenceManagerForSubdocs.initLocalPersistenceForYDoc(ydoc);
          console.log(ydoc.guid, ydoc);
        }

        const libraries = await userLibraryStore.entries();

        console.log("libraries: ", libraries);

        // Set loading to false once everything is loaded
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setLoading(false); // Ensure loading is false even if there's an error
      }
    };

    initializeApp();
  }, [setDefaultSettings, setSettings, setLibraryListStore]);

  useEffect(() => {
    
  }, [settings]);

  // Render loading screen if loading is true
  return (
    <DndProvider backend={HTML5Backend}>
          {loading ? (
            <div className="flex justify-center items-center h-screen max-h-screen w-screen max-w-screen bg-appBackground text-appLayoutText">
              <div>Loading...</div>
              {/* Add a spinner or animation here */}
            </div>
          ) : (
            <motion.div
              id="AppContainer"
              className="dark border-appLayoutBorder bg-appBackground h-screen max-h-screen w-screen max-w-screen flex flex-col text-appLayoutText"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {deviceType !== "mobile" && <ActionBar />}

              <div
                id="AppBodyContainer"
                className={`w-full flex-grow min-h-0 flex ${
                  deviceType === "mobile" ? "flex-col" : "flex-row"
                }`}
              >
                <ActivityBar />
                {deviceType !== "mobile" ? (
                  <>
                    <SidePanel />
                    <MainPanel />
                  </>
                ) : (
                  <div
                    id="MobileAppBodyContainer"
                    className="relative flex-grow"
                  >
                    <motion.div
                      id="SidePanelContainer"
                      className="absolute h-full order-2 w-full bg-appBackground z-50"
                      drag="x"
                      ref={sidePanelScope}
                      dragConstraints={{ left: -Infinity, right: 0 }}
                      dragSnapToOrigin={false}
                      dragElastic={0}
                      style={{
                        boxShadow: "0 0 15px hsl(var(--appLayoutShadow))", // Right shadow
                        clipPath: "inset(0 -15px 0 0)", // Clip the shadow on the bottom
                      }}
                      onDragEnd={(event, info) => {
                        console.log("X: ", info.point.x);

                        // Use a threshold. In this example, if the final x is greater than -250 (closer to 0),
                        // we consider that an “open” gesture.
                        if (info.point.x > 200) {
                          setPanelOpened(true);
                          sidePanelAnimate(sidePanelScope.current, { x: 0 });
                        } else {
                          setPanelOpened(false);
                          sidePanelAnimate(sidePanelScope.current, { x: -500 });
                        }
                      }}
                      initial={{ x: -500 }}
                      transition={{ type: "circ", duration: 0.2 }}
                    >
                      <SidePanel />
                    </motion.div>
                    <MainPanel />
                  </div>
                )}
              </div>
              <Footer />
            </motion.div>
          )}
        </DndProvider>
     
  );
};

export default WritingApp;
