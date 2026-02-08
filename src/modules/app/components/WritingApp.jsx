import { useEffect, useMemo, useState } from "react";
import { type } from "@tauri-apps/plugin-os";
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
import Footer from "./LayoutComponents/Footer";
import MainPanel from "./LayoutComponents/MainPanel";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import firebaseApp from "../lib/Firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import syncManager from "../lib/sync";
import { getCurrentWindow } from "@tauri-apps/api/window";
import fontManager from "../lib/font";
import { setupSearchForLibrary, destroySearchForLibrary } from "../lib/search";
import dictionaryManager from "../lib/dictionary";
import linterManager from "../lib/linterManager";
import useRefreshableTimer from "../hooks/useRefreshableTimer";
import templateManager from "../lib/templates";
import imageManager from "../lib/image";
import videoManager from "../lib/video";
import { DetailsPanelNotesPanel } from "./LayoutComponents/DetailsPanel/DetailsPanelNotesPanel";
import {
  ActionBarLeftSide,
  ActionBarRightSide,
} from "./LayoutComponents/ActionBar";
import { TabsBar } from "./LayoutComponents/TabsBar";
import { SidePanelContainer } from "./LayoutComponents/SidePanelContainer";
import driveOrchestrator from "../lib/drive/driveOrchestrator";
import { listen_for_auth_code } from "../lib/auth/eventlisteners";
import MobileDockBar from "./LayoutComponents/MobileDockBar";
import MobileSidePanelDrawer from "./LayoutComponents/MobileSidePanelDrawer";
import {
  getAccessToken,
  handleInitialLogin,
  handleLoadFrom,
  saveAuthCode,
} from "../lib/auth/auth";
import { MainPanelFrame } from "./LayoutComponents/MainPanelFrame";
import { useAppThemesList } from "../hooks/useAppThemes";
import useApplyTheme from "../hooks/useApplyTheme";
import { darkTheme, lightTheme } from "../lib/appThemeHardcoded";
import { useTheme } from "../ConfigProviders/ThemeProvider";
import localStateManager from "../lib/localState";
import ContextMenuWrapper from "./LayoutComponents/ContextMenuWrapper";

const firebaseFlag = false;
const googleDriveFlag = true;

const WritingApp = () => {
  console.log("rendering writing app");

  const setZoom = appStore((state) => state.setZoom);

  const [isMaximized, setIsMaximized] = useState(false);
  const panelOpened = appStore((state) => state.panelOpened);

  const appThemeId = appStore((state) => state.appThemeId);
  const appThemesList = useAppThemesList();
  const { theme: activeSystemTheme } = useTheme();

  const currentAppThemeData = useMemo(() => {
    if (appThemeId === "light") return lightTheme;
    if (appThemeId === "dark") return darkTheme;
    if (appThemeId === "system") {
      return activeSystemTheme === "dark" ? darkTheme : lightTheme;
    }
    if (appThemeId === "unselected") return null;

    return appThemesList[appThemeId];
  }, [appThemesList, appThemeId, activeSystemTheme]);

  useApplyTheme(currentAppThemeData);

  // FOR DEV ONLY

  const [wasLocalSetup, setWasLocalSetup] = useState(false);

  const loading = appStore((state) => state.loading);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const setLoading = appStore((state) => state.setLoading);
  const [loadingStage, setLoadingStage] = useState("Loading App");

  const { deviceType, setDeviceType } = useDeviceType();

  const isDesktop = deviceType === "desktop";

  const setIsMd = appStore((state) => state.setIsMd);

  const setDefaultSettings = settingsStore((state) => state.setDefaultSettings);
  const setSettings = settingsStore((state) => state.setSettings);

  const [sidePanelScope, sidePanelAnimate] = useAnimate();

  const [isNotesPanelAwake, refreshNotesPanel, keepNotesPanelAwake] =
    useRefreshableTimer({ time: 1000 });

  const user = appStore((state) => state.user);
  const setUser = appStore((state) => state.setUser);

  const setDriveSyncLoading = appStore((state) => state.setDriveSyncLoading);

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
      setLoadingStage("Detecting Device");

      try {
        const osType = await type();
        console.log("Detected OS:", osType);

        let newDeviceType = "desktop";

        if (osType === "android") {
          newDeviceType = "android";
        } else if (osType === "ios") {
          newDeviceType = "iPhone";
        } else if (["windows", "macos", "linux"].includes(osType)) {
          newDeviceType = "desktop";
        }

        setDeviceType(newDeviceType);
      } catch (error) {
        console.warn("Failed to detect OS via Tauri:", error);
        setDeviceType("desktop");
      }

      setLoadingStage("Loading App");

      try {
        setLoadingStage("Loading settings");

        // Load settings
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);

        await fillInDefaultSettings();

        const defaultSettings = await loadDefaultSettings();
        setDefaultSettings(defaultSettings);

        const settings = await loadSettings();
        setZoom(settings["ui_scale"]);

        setLoadingStage("Loading Local State");

        await localStateManager.init();

        setLoadingStage("Loading dictionaries and spellchecker");

        await dictionaryManager.init();

        setLoadingStage("Initializing linter");

        await linterManager.init();

        // await setupEnDictionary();

        setLoadingStage("Loading fonts");

        await fontManager.init();

        await imageManager.init();

        await videoManager.init();

        setLoadingStage("Loading templates");

        await templateManager.initialize();

        setLoadingStage("Fetching local storage");

        const databases = await indexedDB.databases();

        const localLibraries = [];

        dataManagerSubdocs.destroyAll();
        persistenceManagerForSubdocs.closeAllConnections();

        const searchCallback = (action, key) => {
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
          //  console.log("Initiated in data layer: ", ydoc.guid, ydoc);
        }

        console.log("Local Libraries: ", localLibraries);

        handleInitialLogin()
          .then(async () => {
            if (googleDriveFlag) {
              setDriveSyncLoading(true);

              const googleDriveManager =
                driveOrchestrator.getManager("googleDrive");

              if (await googleDriveManager.initDriveSync()) {
                dataManagerSubdocs.addLibraryYDocMapCallback(
                  async (action, key) => {
                    if (action === "set") {
                      await googleDriveManager.addDocument(
                        key,
                        dataManagerSubdocs.getLibrary(key),
                        dataManagerSubdocs.getLibrary(key)?.clientID,
                        key,
                      );

                      driveOrchestrator.startSync("googleDrive", key, 20000);
                    }
                  },
                );

                console.log("INITIATED GOOGLE DRIVE SYNC!");

                // start sync for all local ydocs
                for (const localLibraryId of localLibraries) {
                  await googleDriveManager.addDocument(
                    localLibraryId,
                    dataManagerSubdocs.getLibrary(localLibraryId),
                    dataManagerSubdocs.getLibrary(localLibraryId)?.clientID,
                    localLibraryId,
                  );
                  await driveOrchestrator.startSync(
                    "googleDrive",
                    localLibraryId,
                    20000,
                  );
                }

                await driveOrchestrator.startSyncForAllDriveDocs(
                  "googleDrive",
                  20000,
                );

                setDriveSyncLoading(false);
              }
            }
          })
          .catch((err) => {
            console.log(err);
          });

        listen_for_auth_code({
          onSucess: async (code) => {
            console.log(code, "code generated");
            if (code) {
              saveAuthCode(code).then(() => {
                console.log("code saved");
              });
              getAccessToken(code).then((accessTokenBody) => {
                handleLoadFrom(accessTokenBody);
              });

              if (googleDriveFlag) {
                setDriveSyncLoading(true);
                const googleDriveManager =
                  driveOrchestrator.getManager("googleDrive");

                if (await googleDriveManager.initDriveSync()) {
                  console.log("INITIATED GOOGLE DRIVE SYNC!");

                  dataManagerSubdocs.addLibraryYDocMapCallback(
                    async (action, key) => {
                      if (action === "set") {
                        await googleDriveManager.addDocument(
                          key,
                          dataManagerSubdocs.getLibrary(key),
                          dataManagerSubdocs.getLibrary(key)?.clientID,
                          key,
                        );

                        driveOrchestrator.startSync("googleDrive", key, 20000);
                      }
                    },
                  );

                  // start sync for all local ydocs
                  for (const localLibraryId of localLibraries) {
                    await googleDriveManager.addDocument(
                      localLibraryId,
                      dataManagerSubdocs.getLibrary(localLibraryId),
                      dataManagerSubdocs.getLibrary(localLibraryId)?.clientID,
                      localLibraryId,
                    );
                    await driveOrchestrator.startSync(
                      "googleDrive",
                      localLibraryId,
                      20000,
                    );
                  }

                  await driveOrchestrator.startSyncForAllDriveDocs(
                    "googleDrive",
                    20000,
                  );
                }

                setDriveSyncLoading(false);
              }
            }
          },
          onError: (err) => {
            console.log(err);
          },
        });

        if (firebaseFlag) {
          setLoadingStage("Fetching cloud storage");

          console.log("path: ", `users/${user.uid}/docs/`);

          const querySnapshot = await getDocs(
            collection(getFirestore(firebaseApp), `users/${user.uid}/docs/`),
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
                ydoc,
              );
            }

            console.log("firesync lib: ", ydoc.guid, ydoc);

            await syncManager.initFireSync(ydoc);
          }
        }

        setLoadingStage("Loading previous session");

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

    return () => {};
  }, [
    setDefaultSettings,
    setSettings,
    setLoading,
    setZoom,
    wasLocalSetup,
    setDeviceType,
    setLibraryId,
    user,
    setDriveSyncLoading,
  ]);

  useEffect(() => {
    if (sidePanelScope.current) {
      console.log("triggering side panel");
      sidePanelAnimate(
        sidePanelScope.current,
        { x: panelOpened ? 0 : -500 },
        { ease: "circInOut" },
        { duration: 0.2 },
      );
    }
  }, [panelOpened, sidePanelAnimate, sidePanelScope, loading]);

  useEffect(() => {
    const checkMaximized = async () => {
      const x = await getCurrentWindow().isMaximized();
      setIsMaximized(x);
    };

    checkMaximized();
    const unlisten = getCurrentWindow().listen(
      "tauri://resize",
      checkMaximized,
    );

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
  }, [setIsMd, setIsMaximized]);

  useEffect(() => {
    getCurrentWindow().setDecorations(false);
    const callback = async () => {
      if (!document.fullscreenElement) {
        await getCurrentWindow().setDecorations(false);
      }
    };

    document.addEventListener("fullscreenchange", callback);

    return () => {
      document.removeEventListener("fullscreenchange", callback);
    };
  }, []);

  const windowOptions = useMemo(() => {
    const appWindow = getCurrentWindow();
    return [
      {
        label: "Minimize",
        icon: (
          <span className="icon-[fluent--minimize-16-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => appWindow.minimize(),
      },
      {
        label: isMaximized ? "Restore" : "Maximize",
        icon: isMaximized ? (
          <span className="icon-[clarity--window-restore-line] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ) : (
          <span className="icon-[fluent--maximize-16-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => appWindow.toggleMaximize(),
      },
      {
        isDivider: true,
      },
      {
        label: "Reload App",
        icon: (
          <span className="icon-[ion--refresh-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => appWindow.forceReload(),
      },
      {
        isDivider: true,
      },
      {
        label: "Close",
        icon: (
          <span className="icon-[material-symbols-light--close-rounded] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => appWindow.close(),
      },
    ];
  }, [isMaximized]);

  // Render loading screen if loading is true
  return (
    <DndProvider backend={HTML5Backend}>
      <AnimatePresence mode="wait">
        <ContextMenuWrapper options={windowOptions}>
          <motion.div
            id="Layout"
            className={`h-screen w-screen max-w-screen min-w-screen max-h-screen min-h-screen bg-transparent overflow-hidden font-[NotoSans] w400  border-appLayoutBorder text-appLayoutText
            ${!isMaximized ? "border border-r-2 border-appLayoutInverseHover border-b-2 rounded-2xl" : "rounded-none"}
            `}
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
                    <span className="icon-[mingcute--quill-pen-line] h-full w-full"></span>
                  </motion.div>
                </div>
                <div className="mt-4 text-appLayoutTextMuted text-sm font-medium animate-pulse">
                  {loadingStage}
                </div>
                {/* Add a spinner or animation here */}
              </motion.div>
            )}

            {!loading && isDesktop && (
              <motion.div
                key="WritingApp"
                id="AppContainer"
                className="border-none bg-transparent h-full max-h-full w-full max-w-full overflow-hidden flex flex-col text-appLayoutText"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.2 }}
              >
                {/* {deviceType === "desktop" && (<ActionBar />)} */}
                <div className="w-full bg-transparent h-actionBarHeight min-h-actionBarHeight basis-actionBarHeight flex">
                  <ActionBarLeftSide />
                  <TabsBar
                    isNotesPanelAwake={isNotesPanelAwake}
                    refreshNotesPanel={refreshNotesPanel}
                  />
                  <ActionBarRightSide />
                </div>

                <div
                  id="AppBodyContainer"
                  className={`w-full grow min-h-0 bg-appBackgroundAccent overflow-hidden basis-0 flex relative
                ${deviceType === "desktop" && "flex-row"}
              `}
                >
                  {deviceType === "desktop" && (
                    <>
                      <SidePanelContainer loading={loading} />

                      <MainPanelFrame />

                      <DetailsPanelNotesPanel
                        isNotesPanelAwake={isNotesPanelAwake}
                        refreshNotesPanel={refreshNotesPanel}
                        keepNotesPanelAwake={keepNotesPanelAwake}
                      />
                    </>
                  )}
                </div>
                <Footer />
              </motion.div>
            )}

            {!loading && !isDesktop && (
              <motion.div
                key="WritingApp"
                id="AppContainer"
                className="border-appLayoutBorder bg-appBackground h-full max-h-full w-full max-w-full overflow-hidden flex flex-col text-appLayoutText"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  id="MainPanelContainer"
                  className="relative grow overflow-hidden relative"
                >
                  <MainPanel />
                  <MobileSidePanelDrawer />
                </div>
                <MobileDockBar />
              </motion.div>
            )}
          </motion.div>
        </ContextMenuWrapper>
      </AnimatePresence>
    </DndProvider>
  );
};

export default WritingApp;
