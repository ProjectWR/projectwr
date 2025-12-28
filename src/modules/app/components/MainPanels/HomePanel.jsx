import {
  useMotionTemplate,
  useMotionValue,
  motion,
  useSpring,
  AnimatePresence,
} from "motion/react";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import itemLocalStateManager from "../../lib/itemLocalState";
import { equalityDeep, equalityFlat } from "lib0/function";
import GrainyDiv from "../../../design-system/GrainyDiv";
import GrainyButton from "../../../design-system/GrainyButton";
import { checkForYTree, YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import useStoreHistory from "../../hooks/useStoreHistory";
import useMainPanel from "../../hooks/useMainPanel";

const HomePanel = () => {
  const { deviceType } = useDeviceType();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const setActivity = appStore((state) => state.setActivity);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const { activatePanel } = useMainPanel();

  const prevLatestItemsRef = useRef(null);

  const latestItems = useSyncExternalStore(
    (callback) => {
      itemLocalStateManager.onAll(callback);

      return () => {
        itemLocalStateManager.offAll(callback);
      };
    },
    () => {
      const latestItems = itemLocalStateManager.fetchLatestOpenedItems(10);
      if (
        prevLatestItemsRef.current === null ||
        prevLatestItemsRef.current === undefined ||
        !equalityDeep(latestItems, prevLatestItemsRef.current)
      ) {
        prevLatestItemsRef.current = latestItems;
        return prevLatestItemsRef.current;
      } else {
        return prevLatestItemsRef.current;
      }
    }
  );

  return (
    <main className="w-full h-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        <div
          id="HomeContainer"
          className={`h-full w-full flex flex-col items-center justify-start
            ${deviceType === "mobile" && "w-full"}   
            ${deviceType === "desktop" && "mt-0 pb-20 px-8 pt-8"}       
          `}
          style={{
            width: `var(--detailsPanelWidth)`,
            maxWidth: `100%`,
            minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
          }}
        >
          <div
            id="HomeHeader"
            className={`h-fit min-h-fit w-full flex flex-col items-center
            ${deviceType === "desktop" && "px-6"}
          `}
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ bounce: 0 }}
              className="text-homePanelHeaderFontSize select-none pointer-events-none w100"
            >
              Aethel Writer
            </motion.h1>
            {/* {latestItems.length === 0 && (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, bounce: 0 }}
                  className="text-homePanelSubtitleFontSize text-appLayoutTextMuted pl-1"
                >
                  &nbsp;
                  <q>
                    The problems of the human heart in conflict with itself…
                    alone can make good writing because only that is worth
                    writing about, worth the agony and the sweat.
                  </q>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, bounce: 0 }}
                  className="text-homePanelSubtitleFontSize text-appLayoutText flex flex-row w-full"
                >
                  <span className="grow"></span>
                  <span className="w-fit">- Rohit Kottamasu</span>
                </motion.p>
              </>
            )}

            {latestItems.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, bounce: 0 }}
                className="text-homePanelSubtitleFontSize text-appLayoutTextMuted pl-1"
              >
                &nbsp;
                <q>A subtitle goes here</q>
              </motion.p>
            )} */}
          </div>

          <div
            id="HomeBody"
            className="h-fit min-h-fit w-full  flex flex-col items-center justify-start mt-6"
          >
            <AnimatePresence>
              {latestItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full h-fit overflow-hidden rounded-lg"
                >
                  <div className={`h-fit w-full`}>
                    <div className="w-full h-full flex flex-col items-center justify-start pt-3 pb-2 gap-1">
                      <div className="h-f it w-full text-xl px-6 pb-2 flex items-center justify-between">
                        <span>Recently Opened</span>
                        <span className="text-appLayoutTextMuted text-actionBarResultDateFontSize"></span>
                      </div>
                      <div className="divider w-full px-3">
                        <div className="w-full h-px bg-appLayoutBorder"></div>
                      </div>{" "}
                      {latestItems.map(({ itemIdLibraryId, props, type }) => {
                        const itemId = itemIdLibraryId.split("::")[1];
                        const libraryId = itemIdLibraryId.split("::")[0];

                        let name = "";

                        try {
                          /**
                           * @type {YTree}
                           */
                          let ytree;

                          if (type !== "library") {
                            if (
                              !dataManagerSubdocs.getLibrary(libraryId) ||
                              !checkForYTree(
                                dataManagerSubdocs
                                  .getLibrary(libraryId)
                                  .getMap("library_directory")
                              )
                            ) {
                              return null;
                            }

                            ytree = new YTree(
                              dataManagerSubdocs
                                .getLibrary(libraryId)
                                .getMap("library_directory")
                            );

                            name = ytree
                              .getNodeValueFromKey(itemId)
                              .get("item_properties")["item_title"];
                          } else {
                            if (!dataManagerSubdocs.getLibrary(libraryId)) {
                              return null;
                            }
                            name = dataManagerSubdocs
                              .getLibrary(libraryId)
                              .getMap("library_props")
                              .get("item_properties")["item_title"];
                          }
                        } catch (e) {
                          return null;
                        }

                        return (
                          <div
                            key={itemIdLibraryId}
                            className="w-full h-fit px-3"
                          >
                            <RecentlyOpenedItemButton
                              name={name}
                              itemId={itemId}
                              props={props}
                              type={type}
                              onClick={() => {
                                if (type === "library") {
                                  itemLocalStateManager.setItemOpened(
                                    itemId,
                                    itemId,
                                    true
                                  );
                                  setLibraryId(itemId);
                                  setItemId("unselected");
                                  if (deviceType === "mobile") {
                                    setPanelOpened(false);
                                  }
                                  setPanelOpened(true);

                                  activatePanel("libraries", "details", [
                                    itemId,
                                  ]);
                                }

                                if (
                                  type === "book" ||
                                  type === "paper" ||
                                  type === "section"
                                ) {
                                  itemLocalStateManager.setItemAndParentsOpened(
                                    props.libraryId,
                                    itemId
                                  );

                                  setLibraryId(props.libraryId);
                                  setItemId(itemId);
                                  setItemMode("details");
                                  if (deviceType === "mobile") {
                                    setPanelOpened(false);
                                  }
                                  setPanelOpened(true);

                                  activatePanel("libraries", "details", [
                                    props.libraryId,
                                    itemId,
                                  ]);
                                }

                                setActivity("libraries");
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AnimatePresence>
    </main>
  );
};

export default HomePanel;

const RecentlyOpenedItemButton = ({ onClick, name, itemId, props, type }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      id={itemId}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="px-3 py-1 w-full h-fit flex items-center justify-between rounded-md  text-recentlyOpenedNodeFontSize text-appLayoutTextMuted hover:text-appLayoutText"
    >
      <span className="h-fit flex items-center gap-2">
        <motion.span transition={{ duration: 0.2 }}>{name}</motion.span>
        <span className="text-recentlyOpenedDateFontSize w-fit pt-1">
          {type}
        </span>
      </span>
      <span className="text-recentlyOpenedDateFontSize">
        {new Date(props.lastOpened).toLocaleString()}
      </span>
    </button>
  );
};
