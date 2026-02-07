import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../../stores/appStore";
import { motion, AnimatePresence } from "motion/react";
import { queryData } from "../../lib/search";
import { useEffect, useRef, useState } from "react";
import { max, min } from "lib0/math";
import useStoreHistory from "../../hooks/useStoreHistory";
import {
  HoverListBody,
  HoverListButton,
  HoverListDivider,
  HoverListFooter,
  HoverListHeader,
  HoverListItem,
  HoverListShell,
} from "./HoverListShell";
import useMainPanel from "../../hooks/useMainPanel";
import { YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { StyledTooltip } from "./StyledTooltip";
import { oauthStore } from "../../stores/oauthStore";
import LibraryDirectoryHeader from "../SIdePanels/LibraryDirectory/LibraryDirectoryHeader";

const ActionBar = () => {
  const { deviceType } = useDeviceType();
  const appWindow = getCurrentWindow();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const sideBarOpened = appStore((state) => state.sideBarOpened);
  const setSideBarOpened = appStore((state) => state.setSideBarOpened);

  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const activity = appStore((state) => state.activity);
  const setActivity = appStore((state) => state.setActivity);

  const { activatePanel } = useMainPanel();

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const unlisten = getCurrentWindow().listen("tauri://resize", async () => {
      const x = await getCurrentWindow().isMaximized();

      setIsMaximized(x);
    });

    return () => {
      unlisten.then((unlistenFn) => unlistenFn());
    };
  }, []);

  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      className="border-b z-1000 border-appLayoutBorder w-full h-actionBarHeight min-h-actionBarHeight bg-appBackgroundAccent text-appLayoutText "
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-between gap-4 items-center relative"
      >
        <div className="h-full w-fit flex items-center gap-1">
          <div className="h-full w-activityBarWidth flex items-center justify-center">
            <div className="h-actionBarLogoSize w-actionBarLogoSize">
              <span
                key="logoButtonDisabled"
                className="icon-[mingcute--quill-pen-line] w-full h-full  bg-appLayoutText"
              ></span>
            </div>
          </div>

          <ActionButton data-tauri-drag-region onClick={() => setSideBarOpened(!sideBarOpened)}>
            <StyledTooltip label="Toggle Sidebar">
              <div className="h-full w-actionBarButtonIconSize relative">
                <AnimatePresence mode="sync">
                  {sideBarOpened && (
                    <motion.span
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.05 }}
                      key="sideBarOpened"
                      className="icon-[tabler--layout-sidebar-left-collapse-filled] w-full h-full top-0 left-0 absolute bg-appLayoutTextMuted"
                    ></motion.span>
                  )}
                  {!sideBarOpened && (
                    <motion.span
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.05 }}
                      key="sideBarClosed"
                      className="icon-[tabler--layout-sidebar-left-expand] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                    ></motion.span>
                  )}
                </AnimatePresence>
              </div>
            </StyledTooltip>
          </ActionButton>

          <ActionButton
            onClick={() => {
              activatePanel("home", null, []);
            }}
            className={`${false && "bg-appLayoutPressed"}`}
          >
            <StyledTooltip label="Home">
              <div className={`h-full w-actionBarButtonIconSize relative`}>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key="homeButton"
                  className="icon-[material-symbols-light--home] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                ></motion.span>
              </div>
            </StyledTooltip>
          </ActionButton>
        </div>

        <div className="h-full w-fit flex">
          <ActionButton
            onClick={() => {
              if (canGoBack) {
                goBack();
              }
            }}
            disabled={!canGoBack}
          >
            <StyledTooltip label="Go Back">
              <div className="h-full w-actionBarButtonIconSize relative">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: canGoBack ? 1 : 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key="historyGoBack"
                  className="icon-[material-symbols-light--arrow-back-rounded] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                ></motion.span>
              </div>
            </StyledTooltip>
          </ActionButton>
          <ActionButton
            onClick={() => {
              if (canGoForward) {
                goForward();
              }
            }}
            disabled={!canGoForward}
          >
            <StyledTooltip label="Go Forward">
              <div className="h-full w-actionBarButtonIconSize relative">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: canGoForward ? 1 : 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key="historyGoForward"
                  className="icon-[material-symbols-light--arrow-forward-rounded] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                ></motion.span>
              </div>
            </StyledTooltip>
          </ActionButton>
          <SearchBar />
        </div>

        <div className="h-full w-fit flex items-center gap-1">
          <div className="h-full w-fit pl-1 flex items-center gap-1">
            <StyledTooltip label="Settings">
              <ActionButton
                onClick={() => {
                  activatePanel("settings", null, []);
                }}
                className={`${false && "bg-appLayoutPressed"}`}
              >
                <div className={`h-full w-actionBarButtonIconSize relative`}>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    key="settingsButton"
                    className="icon-[material-symbols-light--settings] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                  ></motion.span>
                </div>
              </ActionButton>
            </StyledTooltip>
          </div>

          <WindowButton
            className={``}
            buttonContent={
              <StyledTooltip label="Minimize">
                <span className="icon-[fluent--minimize-16-regular] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize"></span>
              </StyledTooltip>
            }
            onClick={() => {
              appWindow.minimize();
            }}
          />
          <WindowButton
            className={``}
            buttonContent={
              <StyledTooltip label={isMaximized ? "Restore" : "Maximize"}>
                {isMaximized ? (
                  <span className="icon-[clarity--window-restore-line] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize"></span>
                ) : (
                  <span className="icon-[fluent--maximize-16-regular] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize"></span>
                )}
              </StyledTooltip>
            }
            onClick={() => {
              appWindow.toggleMaximize();
            }}
          />
          <WindowButton
            destructive={true}
            className={``}
            buttonContent={
              <StyledTooltip label="Close">
                <span className="icon-[material-symbols-light--close-rounded] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize"></span>
              </StyledTooltip>
            }
            onClick={() => {
              appWindow.close();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const ActionButton = ({
  onClick,
  className,
  children,
  disabled = false,
}) => {
  return (
    <div className="h-full py-1 w-fit">
      <button
        className={`h-full px-1 w-fit ${!disabled && "hover:bg-appLayoutInverseHover"
          } rounded-md flex items-center justify-center ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </div>
  );
};

const WindowButton = ({
  onClick,
  className,
  buttonContent,
  destructive = false,
}) => {
  return (
    <button
      className={`h-full flex items-center justify-center w-fit px-3 text-appLayoutHighlight ${destructive
          ? "hover:bg-appLayoutDestruct"
          : "hover:bg-appLayoutInverseHover"
        } ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};

export const ActionBarLeftSide = ({ }) => {
  const zoom = appStore((state) => state.zoom);
  const isMd = appStore((state) => state.isMd);

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const sideBarOpened = appStore((state) => state.sideBarOpened);
  const setSideBarOpened = appStore((state) => state.setSideBarOpened);

  const { activatePanel } = useMainPanel();

  const [barWidth, setBarWidth] = useState(zoom * 240);

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const target = document.getElementById("ActivityBarAndSidePanelContainer");

    const syncWidths = () => {
      const targetWidth = target.offsetWidth;

      const copierWidth = max(zoom * 240, targetWidth);

      setBarWidth(copierWidth);
    };

    syncWidths();

    let ro = new ResizeObserver(() => {
      syncWidths();
    });

    ro.observe(target);

    return () => {
      ro.unobserve(target);
    };
  }, [zoom]);

  useEffect(() => {
    const updateMaximized = async () => {
      const x = await getCurrentWindow().isMaximized();

      setIsMaximized(x);
    };

    const unlisten = getCurrentWindow().listen("tauri://resize", async () => {
      updateMaximized();
    });

    updateMaximized();

    return () => {
      unlisten.then((unlistenFn) => unlistenFn());
    };
  }, []);

  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      style={{
        width: isMd ? `${barWidth}px` : 0,
        minWidth: `fit-content`,
      }}
      className={`border-b z-1000 border-appLayoutBorder h-full min-h-full bg-appBackgroundAccent text-appLayoutText 
        `}
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-start gap-1 items-center relative"
      >
        <div className="h-full w-fit flex items-center">
          <div
            style={{
              width: `calc(var(--activityBarWidth) - 1px)`,
            }}
            className="h-full z-[2] flex items-center justify-center"
          >
            <ActionButton onClick={() => setSideBarOpened(!sideBarOpened)}>
              <StyledTooltip label="Toggle Sidebar">
                <div className="h-full w-actionBarButtonIconSize relative">
                  <AnimatePresence mode="sync">
                    {sideBarOpened && (
                      <motion.span
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.05 }}
                        key="sideBarOpened"
                        className="icon-[tabler--layout-sidebar-left-collapse-filled] w-full h-full top-0 left-0 absolute bg-appLayoutTextMuted"
                      ></motion.span>
                    )}
                    {!sideBarOpened && (
                      <motion.span
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.05 }}
                        key="sideBarClosed"
                        className="icon-[tabler--layout-sidebar-left-expand] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                      ></motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </StyledTooltip>
            </ActionButton>
          </div>

          <div className="w-px h-full py-2">
            <div className={`w-full h-full bg-appLayoutBorder`}></div>
          </div>
        </div>

        <div
          id="LibraryDirectoryHeaderContainer"
          className="grow w-librarySelectorWidth basis-0 relative"
        >
          <LibraryDirectoryHeader />
        </div>

        <div className="w-[0.5px] min-w-[0.5px] basis-[0.5px] h-full py-2">
          <div className={`w-full h-full bg-appLayoutBorder`}></div>
        </div>
      </div>
    </div>
  );
};

export const ActionBarRightSide = ({ }) => {
  const zoom = appStore((state) => state.zoom);
  const driveSyncLoading = appStore((state) => state.driveSyncLoading);
  const userProfile = oauthStore((state) => state.userProfile);

  // console.log("userProfile: ", userProfile);``

  const { deviceType } = useDeviceType();
  const appWindow = getCurrentWindow();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const { activatePanel } = useMainPanel();

  const [barWidth, setBarWidth] = useState(zoom * 240);

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const target = document.getElementById("NotesPanelContainer");

    const syncWidths = () => {
      const targetWidth = target.offsetWidth;

      const copierWidth = max(zoom * 240, targetWidth);

      setBarWidth(copierWidth);
    };

    syncWidths();

    let ro = new ResizeObserver(() => {
      syncWidths();
    });

    ro.observe(target);

    return () => {
      ro.unobserve(target);
    };
  }, [zoom]);

  useEffect(() => {
    const updateMaximized = async () => {
      const x = await getCurrentWindow().isMaximized();

      setIsMaximized(x);
    };

    const unlisten = getCurrentWindow().listen("tauri://resize", async () => {
      updateMaximized();
    });

    updateMaximized();

    return () => {
      unlisten.then((unlistenFn) => unlistenFn());
    };
  }, []);

  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      style={{
        width: `${barWidth}px`,
      }}
      className={`border-b z-1000 border-appLayoutBorder h-actionBarHeight overflow-hidden bg-appBackgroundAccent min-h-actionBarHeight text-appLayoutText 
        `}
    >
      <div
        data-tauri-drag-region
        id="actionBarRightSide"
        className="w-full h-full flex justify-end gap-1 items-center relative"
      >
        <div className="w-px min-w-px h-full py-2">
          <div className={`w-full h-full bg-appLayoutBorder`}></div>
        </div>
        <div className="grow"></div>
        <div className="h-full w-fit flex items-center gap-1">
          <div className="h-full w-fit pl-1 flex items-center gap-1">
            {userProfile && (
              <ActionButton
                onClick={() => {
                  activatePanel("settings", null, []);
                }}
                className={`${false && "bg-appLayoutPressed"}  ${driveSyncLoading ? "bg-yellow-800/20" : "bg-green-800/20"
                  }`}
                disabled={true}
              >
                <StyledTooltip
                  label={driveSyncLoading ? "Initializing..." : "Active"}
                  position="bottom"
                >
                  <div className={`h-full w-actionBarButtonIconSize relative`}>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      key="settingsButton"
                      className={`icon-[logos--google-drive] w-[75%] h-[75%] ${driveSyncLoading
                          ? "left-[50%] -translate-x-1/2 top-px"
                          : "left-[50%] -translate-x-1/2 top-[50%] -translate-y-1/2"
                        } absolute`}
                    ></motion.span>
                    {driveSyncLoading && (
                      <span className="icon-[eos-icons--three-dots-loading] absolute w-full h-full bottom-1 translate-y-1/2 left-[50%] -translate-x-1/2"></span>
                    )}
                  </div>
                </StyledTooltip>
              </ActionButton>
            )}
            <ActionButton
              onClick={() => {
                activatePanel("settings", null, []);
              }}
              className={`${false && "bg-appLayoutPressed"}`}
            >
              <StyledTooltip label="Settings" position="bottom">
                <div className={`h-full w-actionBarButtonIconSize relative`}>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    key="settingsButton"
                    className="icon-[material-symbols-light--settings] w-full h-full top-0 left-0 absolute bg-appLayoutText"
                  ></motion.span>
                </div>
              </StyledTooltip>
            </ActionButton>
          </div>

          <WindowButton
            className={``}
            buttonContent={
              <StyledTooltip label="Minimize" position="bottom">
                <span className="icon-[fluent--minimize-16-regular] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted"></span>
              </StyledTooltip>
            }
            onClick={() => {
              appWindow.minimize();
            }}
          />
          <WindowButton
            className={``}
            buttonContent={
              <StyledTooltip
                label={isMaximized ? "Restore" : "Maximize"}
                position="bottom"
              >
                {isMaximized ? (
                  <span className="icon-[clarity--window-restore-line] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted"></span>
                ) : (
                  <span className="icon-[fluent--maximize-16-regular] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted"></span>
                )}
              </StyledTooltip>
            }
            onClick={() => {
              appWindow.toggleMaximize();
            }}
          />
          <WindowButton
            destructive={true}
            className={``}
            buttonContent={
              <StyledTooltip label="Close" position="bottom">
                <span className="icon-[material-symbols-light--close-rounded] w-actionBarWindowButtonIconSize h-actionBarWindowButtonIconSize text-appLayoutTextMuted"></span>
              </StyledTooltip>
            }
            onClick={() => {
              appWindow.close();
            }}
          />
        </div>
      </div>
    </div>
  );
};
