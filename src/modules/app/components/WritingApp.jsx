import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
import {
  AnimatePresence,
  motion,
  useAnimate,
  useMotionValue,
} from "motion/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import firebaseApp from "../lib/Firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import syncManager from "../lib/sync";
import { max, min } from "lib0/math";
import { getCurrentWindow } from "@tauri-apps/api/window";
import fontManager from "../lib/font";
import useZoom from "../hooks/useZoom";
import useComputedCssVar from "../hooks/useComputedCssVar";
import { destroySearchForLibrary, setupSearchForLibrary } from "../lib/search";
import { setupEnDictionary } from "../../editor/EnDictionary";
import dictionaryManager from "../lib/dictionary";
import useRefreshableTimer from "../hooks/useRefreshableTimer";
import { useDebouncedCallback } from "@mantine/hooks";
import templateManager from "../lib/templates";
import useMainPanel from "../hooks/useMainPanel";
import imageManager from "../lib/image";
import { mainPanelStore } from "../stores/mainPanelStore";
import { equalityDeep } from "lib0/function";
import { DetailsPanelNotesPanel } from "./LayoutComponents/DetailsPanel/DetailsPanelNotesPanel";
import {
  ActionBarLeftSide,
  ActionBarRightSide,
} from "./LayoutComponents/ActionBar";
import { TabsBar } from "./LayoutComponents/TabsBar";
import { SidePanelContainer } from "./LayoutComponents/SidePanelContainer";

const WritingApp = () => {
  console.log("rendering writing app");

  const setZoom = appStore((state) => state.setZoom);

  const [isMaximized, setIsMaximized] = useState(false);
  const panelOpened = appStore((state) => state.panelOpened);

  // FOR DEV ONLY

  const [wasLocalSetup, setWasLocalSetup] = useState(false);

  const loading = appStore((state) => state.loading);
  const setLoading = appStore((state) => state.setLoading);
  const [loadingStage, setLoadingStage] = useState("Loading App");

  const { deviceType } = useDeviceType();

  const zoom = appStore((state) => state.zoom);

  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const isMd = appStore((state) => state.isMd);
  const setIsMd = appStore((state) => state.setIsMd);

  const notesPanelWidth = appStore((state) => state.notesPanelWidth);
  const setNotesPanelWidth = appStore((state) => state.setNotesPanelWidth);

  const notesPanelOpened = appStore((state) => state.notesPanelOpened);
  const setNotesPanelOpened = appStore((state) => state.setNotesPanelOpened);

  const setDefaultSettings = settingsStore((state) => state.setDefaultSettings);
  const setSettings = settingsStore((state) => state.setSettings);

  const [sidePanelScope, sidePanelAnimate] = useAnimate();

  const [isNotesPanelAwake, refreshNotesPanel, keepNotesPanelAwake] =
    useRefreshableTimer({ time: 1000 });

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

  useEffect(() => {
    const initializeWritingApp = async () => {
      console.log("Initialize Writing App has been run!");
      setLoading(true);
      setLoadingStage("Loading App");

      try {
        setLoadingStage("Loading previous session");

        // if (
        //   tabs.findIndex((a) =>
        //     equalityDeep(a, { panelType: "home", mode: null, breadcrumbs: [] })
        //   ) === -1
        // ) {
        //   const newTabs = JSON.parse(JSON.stringify(tabs));

        //   newTabs.push({ panelType: "home", mode: null, breadcrumbs: [] });

        //   setTabs(newTabs);
        // }

        setLoadingStage("Loading settings");

        // Load settings
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);

        await fillInDefaultSettings();

        const defaultSettings = await loadDefaultSettings();
        setDefaultSettings(defaultSettings);

        const settings = await loadSettings();
        setZoom(settings["ui_scale"]);

        setLoadingStage("Loading dictionaries and spellchecker");

        await dictionaryManager.init();

        // await setupEnDictionary();

        setLoadingStage("Loading fonts");

        await fontManager.init();

        await imageManager.init();

        setLoadingStage("Loading templates");

        await templateManager.initialize();

        setLoadingStage("Fetching local storage");

        const databases = await indexedDB.databases();

        const localLibraries = [];

        dataManagerSubdocs.destroyAll();
        persistenceManagerForSubdocs.closeAllConnections();

        const searchCallback = (action, key, value) => {
          console.log("In search callback: ", action, key);
          if (action === "set") {
            setupSearchForLibrary(key);
          }

          if (action === "delete") {
            destroySearchForLibrary(key);
          }
        };

        dataManagerSubdocs.addLibraryYDocMapCallback(searchCallback);

        setLoadingStage("Initializing Local Storage");

        for (const db of databases) {
          const libraryId = db.name;
          if (
            [
              "firebase-heartbeat-database",
              "firebase-installations-database",
              "firebaseLocalStorageDb",
              "keyval-store",
              "level-js-index",
              "validate-browser-context-for-indexeddb-analytics-module",
              "dictionary",
            ].find((value) => value === libraryId)
          ) {
            continue;
          }
          console.log("Database: ", libraryId);

          localLibraries.push(libraryId);

          await dataManagerSubdocs.initLibrary(libraryId);
          const ydoc = dataManagerSubdocs.getLibrary(libraryId);

          console.log(ydoc.guid, ydoc);
        }

        console.log("Local Libraries: ", localLibraries);

        if (false) {
          setLoadingStage("Fetching cloud storage");

          console.log("path: ", `users/${user.uid}/docs/`);

          const querySnapshot = await getDocs(
            collection(getFirestore(firebaseApp), `users/${user.uid}/docs/`)
          );

          const documentNames = querySnapshot.docs.map((doc) => doc.id);

          console.log("firebase document names: ", documentNames);

          for (const guid of documentNames) {
            let ydoc = dataManagerSubdocs.getLibrary(guid);

            if (!ydoc) {
              await dataManagerSubdocs.initLibrary(guid);
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

        // await wait(1000);
        setLoadingStage("Finished Loading");

        return () => {};
      } catch (error) {
        console.error("Failed to initialize app:", error);
        // setLoading(false); // Ensure loading is false even if there's an error
      } finally {
        setLoading(false);
      }
    };

    if (!wasLocalSetup) {
      initializeWritingApp();
      setWasLocalSetup(true);
    }
  }, [
    setDefaultSettings,
    setSettings,
    setLoading,
    setZoom,
    user,
    wasLocalSetup,
  ]);

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
    const unlisten = getCurrentWindow().listen("tauri://resize", async () => {
      const x = await getCurrentWindow().isMaximized();

      setIsMaximized(x);
    });

    const checkScreenSize = () => {
      if (window.innerWidth >= 1280) {
        setIsMd(true);
      } else {
        setIsMd(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return async () => {
      (await unlisten)();
    };
  }, [setIsMd]);

  // Render loading screen if loading is true
  return (
    <DndProvider backend={HTML5Backend}>
      <AnimatePresence mode="wait">
        <motion.div
          id="Layout"
          className={`h-full max-h-full w-full max-w-full bg-appBackground font-serif ${
            !isMaximized && "border"
          } border-appLayoutBorder overflow-hidden text-appLayoutText`}
        >
          {loading && (
            <motion.div
              key="WritingAppLoading"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
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
                      stroke={`#a3a3a3`}
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
          )}

          {!loading && (
            <motion.div
              key="WritingApp"
              id="AppContainer"
              className="dark border-appLayoutBorder bg-appBackground h-full max-h-full w-full max-w-full overflow-hidden flex flex-col text-appLayoutText"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.2 }}
            >
              {/* {deviceType === "desktop" && (<ActionBar />)} */}
              <div className="w-full h-actionBarHeight min-h-actionBarHeight basis-actionBarHeight flex">
                <ActionBarLeftSide />
                <TabsBar isNotesPanelAwake={isNotesPanelAwake} refreshNotesPanel={refreshNotesPanel} />
                <ActionBarRightSide />
              </div>

              <div
                id="AppBodyContainer"
                className={`w-full grow min-h-0 overflow-hidden basis-0 flex relative
                ${deviceType === "desktop" && "flex-row"}
                ${deviceType === "mobile" && "flex-col"}
              `}
              >
                {deviceType === "desktop" && (
                  <>
                    <SidePanelContainer loading={loading} />

                    <MainPanel />

                    <DetailsPanelNotesPanel
                      isNotesPanelAwake={isNotesPanelAwake}
                      refreshNotesPanel={refreshNotesPanel}
                      keepNotesPanelAwake={keepNotesPanelAwake}
                    />
                  </>
                )}

                {deviceType === "mobile" && (
                  <>
                    <ActivityBar />
                    <div id="MobileAppBodyContainer" className="relative grow">
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
                          // Use a threshold. In this example, if the final x is greater than -250 (closer to 0),
                          // we consider that an “open” gesture.
                          if (info.point.x > 200) {
                            setPanelOpened(true);
                            sidePanelAnimate(sidePanelScope.current, { x: 0 });
                          } else {
                            setPanelOpened(false);
                            sidePanelAnimate(sidePanelScope.current, {
                              x: -500,
                            });
                          }
                        }}
                        initial={{ x: -500 }}
                        transition={{ type: "circ", duration: 0.2 }}
                      >
                        <SidePanel />
                      </motion.div>
                      <MainPanel />
                    </div>
                  </>
                )}
              </div>
              <Footer />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </DndProvider>
  );
};

export default WritingApp;
