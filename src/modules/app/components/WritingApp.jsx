import { useEffect, useState, useSyncExternalStore } from "react";
import { settingsStore } from "../stores/settingsStore";
import { useDeviceType } from "../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../stores/appStore";
import {
  fillInDefaultSettings,
  loadDefaultSettings,
  loadSettings,
} from "../lib/settings";
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
import firebaseApp from "../lib/Firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, getDocsFromServer } from "firebase/firestore";
import syncManager from "../lib/sync";

const WritingApp = () => {
  console.log("rendering writing app");
  const loading = appStore((state) => state.loading);
  const setLoading = appStore((state) => state.setLoading);

  const { deviceType } = useDeviceType();

  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const setDefaultSettings = settingsStore((state) => state.setDefaultSettings);
  const setSettings = settingsStore((state) => state.setSettings);
  const setLibraryListStore = appStore((state) => state.setLibraryListStore);
  const settings = settingsStore((state) => state.settings);

  const user = appStore((state) => state.user);
  const setUser = appStore((state) => state.setUser);
  useEffect(() => {
    onAuthStateChanged(getAuth(firebaseApp), (user) => {
      if (user) {
        console.log("User logged in: ", user);
        setUser(user);
      } else {
        console.log("User not logged in");
        setUser(null);
      }
    });
  }, [setUser]);

  const [sidePanelScope, sidePanelAnimate] = useAnimate();

  useEffect(() => {
    if (sidePanelScope.current) {
      console.log("triggering side panel");
      sidePanelAnimate(
        sidePanelScope.current,
        { x: panelOpened ? 0 : -500 },
        { ease: "circInOut" },
        { duration: 0.2 }
      );
    }
  }, [panelOpened, sidePanelAnimate, sidePanelScope, loading]);

  useEffect(() => {
    const initializeWritingApp = async () => {
      try {
        // Load settings
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);

        await fillInDefaultSettings();

        const defaultSettings = await loadDefaultSettings();
        setDefaultSettings(defaultSettings);

        const databases = await indexedDB.databases();

        const localLibraries = [];

        for (const db of databases) {
          const libraryId = db.name;
          if (
            [
              "firebase-heartbeat-database",
              "firebase-installations-database",
              "firebaseLocalStorageDb",
              "keyval-store",
            ].find((value) => value === libraryId)
          ) {
            continue;
          }
          console.log("Database: ", libraryId);

          localLibraries.push(libraryId);

          dataManagerSubdocs.initLibrary(libraryId);
          const ydoc = dataManagerSubdocs.getLibrary(libraryId);

          console.log("ydoc", ydoc);

          console.log("Before persistence: ", ydoc.guid, ydoc);
          await persistenceManagerForSubdocs.initLocalPersistenceForYDoc(ydoc);
          console.log(ydoc.guid, ydoc);
        }

        console.log("Local Libraries: ", localLibraries);

        if (user) {
          console.log("path: ", `users/${user.uid}/docs/`);

          const querySnapshot = await getDocsFromServer(
            collection(getFirestore(firebaseApp), `users/${user.uid}/docs/`)
          );

          const documentNames = querySnapshot.docs.map((doc) => doc.id);

          console.log("firebase document names: ", documentNames);

          for await (const guid of documentNames) {

            let ydoc = dataManagerSubdocs.getLibrary(guid);

            if (!ydoc) {
              dataManagerSubdocs.initLibrary(guid);
              ydoc = dataManagerSubdocs.getLibrary(guid);

              console.log("ydoc", ydoc);

              await persistenceManagerForSubdocs.initLocalPersistenceForYDoc(
                ydoc
              );
            }

            console.log("firesync lib: ", ydoc.guid, ydoc);

            await syncManager.initFireSync(ydoc);
          }
        }
        // Set loading to false once everything is loaded
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        // setLoading(false); // Ensure loading is false even if there's an error
      }
    };

    initializeWritingApp();
  }, [setDefaultSettings, setSettings, setLibraryListStore, setLoading, user]);

  // Render loading screen if loading is true
  return (
    <DndProvider backend={HTML5Backend}>
      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col justify-center items-center h-screen max-h-screen w-screen max-w-screen bg-appBackground text-appLayoutText"
          >
            <div
              className={`relative w-loadingSpinnerSize h-loadingSpinnerSize`}
            >
              <span
                className="w-full h-full"
                // animate={{ rotate: 360 }}
                // transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={"100%"}
                  height={"100%"}
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={0.3}
                  >
                    <path
                      strokeDasharray={16}
                      strokeDashoffset={16}
                      d="M12 3c4.97 0 9 4.03 9 9"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="16;0"
                      ></animate>
                      <animateTransform
                        attributeName="transform"
                        dur="1.5s"
                        repeatCount="indefinite"
                        type="rotate"
                        values="0 12 12;360 12 12"
                      ></animateTransform>
                    </path>
                    <path
                      strokeDasharray={64}
                      strokeDashoffset={64}
                      strokeOpacity={0.3}
                      d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="1.2s"
                        values="64;0"
                      ></animate>
                    </path>
                  </g>
                </svg>
              </span>
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.2,
                  ease: "linear",
                }}
                className="absolute w-full h-full p-[20%] top-0 left-0"
              >
                <span className="icon-[ph--flower-tulip-thin] h-full w-full"></span>
              </motion.div>
            </div>

            {/* Add a spinner or animation here */}
          </motion.div>
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
                <div id="MobileAppBodyContainer" className="relative flex-grow">
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
      </AnimatePresence>
    </DndProvider>
  );
};

export default WritingApp;
