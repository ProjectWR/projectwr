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

  const prevLatestItemsRef = useRef(null);

  const latestItems = useSyncExternalStore(
    (callback) => {
      itemLocalStateManager.onAll(callback);

      return () => {
        itemLocalStateManager.offAll(callback);
      };
    },
    () => {
      const latestItems = itemLocalStateManager.fetchLatestOpenedItems(5);
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

  console.log("Latest ITems: ", latestItems);

  return (
    <AnimatePresence mode="wait">
      <div
        id="HomeContainer"
        className={`h-full flex flex-col items-start justify-start mr-auto
        ${deviceType === "mobile" && "w-full"}   
        ${deviceType === "desktop" && "mt-0 pb-20 px-8 pt-8"}       
      `}
        style={
          deviceType === "desktop" && {
            width: `100%`,
            minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
          }
        }
      >
        <div
          id="HomeHeader"
          className={`h-fit min-h-fit w-full flex flex-col items-start
            ${deviceType === "desktop" && "px-6"}
          `}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ bounce: 0 }}
            className="text-homePanelHeaderFontSize select-none pointer-events-none"
          >
            Tulip Writer
          </motion.h1>
          {latestItems.length === 0 && (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, bounce: 0 }}
                className="text-homePanelSubtitleFontSize text-appLayoutTextMuted pl-1"
              >
                &nbsp;
                <q>
                  The problems of the human heart in conflict with itself… alone
                  can make good writing because only that is worth writing
                  about, worth the agony and the sweat.
                </q>
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, bounce: 0 }}
                className="text-homePanelSubtitleFontSize text-appLayoutText flex flex-row w-full"
              >
                <span className="flex-grow"></span>
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
          )}
        </div>

        <div
          id="HomeBody"
          className="h-fit min-h-fit w-full flex flex-col items-center justify-start mt-6"
        >
          <AnimatePresence>
            {latestItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "fit-content" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full overflow-hidden rounded-lg"
              >
                <div className={`h-fit w-full`}>
                  <div className="w-full h-full flex flex-col items-center justify-start pt-6 pb-5 gap-1">
                    <div className="h-fit w-full text-3xl px-6 pb-2 flex items-center justify-between">
                      <span>Recently Opened</span>
                      <span className="text-appLayoutTextMuted text-actionBarResultDateFontSize"></span>
                    </div>
                    <div className="divider w-full px-3">
                      <div className="w-full h-px bg-appLayoutBorder"></div>
                    </div>{" "}
                    {latestItems.map(({ itemId, props, type }) => {
                      let name = "";
                      if (type !== "library") {
                        if (
                          !dataManagerSubdocs.getLibrary(props.libraryId) ||
                          !checkForYTree(
                            dataManagerSubdocs
                              .getLibrary(props.libraryId)
                              .getMap("library_directory")
                          )
                        ) {
                          return null;
                        }

                        const ytree = new YTree(
                          dataManagerSubdocs
                            .getLibrary(props.libraryId)
                            .getMap("library_directory")
                        );

                        console.log(ytree._ymap.toJSON());

                        name = ytree
                          .getNodeValueFromKey(itemId)
                          .get("item_title");
                      } else {
                        if (!dataManagerSubdocs.getLibrary(props.libraryId)) {
                          return null;
                        }
                        name = dataManagerSubdocs
                          .getLibrary(props.libraryId)
                          .getMap("library_props")
                          .get("library_name");
                      }

                      return (
                        <div key={itemId} className="w-full h-fit px-3">
                          <RecentlyOpenedItemButton
                            name={name}
                            itemId={itemId}
                            props={props}
                            type={type}
                            onClick={() => {
                              if (type === "library") {
                                itemLocalStateManager.setItemOpened(
                                  itemId,
                                  true
                                );
                                setLibraryId(itemId);
                                setItemId("unselected");
                                if (deviceType === "mobile") {
                                  setPanelOpened(false);
                                }
                                setPanelOpened(true);
                                saveStateInHistory();
                                clearFuture();
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
                                console.log(
                                  "Opening from Recently Opened: ",
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
                                saveStateInHistory();
                                clearFuture();
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
  );
};

export default HomePanel;

const RecentlyOpenedItemButton = ({ onClick, name, itemId, props, type }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="px-3 py-3 w-full h-fit flex items-center justify-between rounded-md font-sans text-recentlyOpenedNodeFontSize"
    >
      <span className="h-fit flex items-center gap-2">
        <motion.span
          animate={{
            textShadow: hover ? `0 0 10px hsl(var(--appLayoutText))` : "none",
          }}
          transition={{ duration: 0.2 }}
        >
          {name}
        </motion.span>
        <span className="text-appLayoutTextMuted text-recentlyOpenedDateFontSize w-fit pt-1">
          {type}
        </span>
      </span>
      <span className="text-appLayoutTextMuted text-recentlyOpenedDateFontSize">
        {new Date(props.lastOpened).toLocaleString()}
      </span>
    </button>
  );
};
