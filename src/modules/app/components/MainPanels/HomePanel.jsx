import { motion, AnimatePresence } from "motion/react";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { checkForYTree, YTree } from "yjs-orderedtree";
import dataManagerSubdocs, { getArrayFromYDocMap } from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import useStoreHistory from "../../hooks/useStoreHistory";
import useMainPanel from "../../hooks/useMainPanel";
import { useAllLocalState } from "../../hooks/useLocalState";
import localStateManager from "../../lib/localState";
import PropTypes from "prop-types";
import { sortArrayWithPropsByOrder } from "../../utils/orderUtil";
import { equalityDeep } from "lib0/function";
import { openUrl } from "@tauri-apps/plugin-opener";
import { StyledTooltip } from "../LayoutComponents/StyledTooltip";

const RecentlyOpenedItemButton = ({ onClick, name, itemId, props, type }) => {
  const [hover, setHover] = useState(false);
  return (
    <StyledTooltip label={type} position="bottom">
      <button
        id={itemId}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onClick}
        className="w-fit h-fit text-libraryDirectoryBookNodeFontSize px-2 py-1 border rounded-md border-appLayoutBorder hover:bg-appLayoutInverseHover"
      >
        {name}
      </button>
    </StyledTooltip>
  );
};

RecentlyOpenedItemButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  name: PropTypes.string,
  itemId: PropTypes.string.isRequired,
  props: PropTypes.shape({
    lastOpened: PropTypes.string,
    libraryId: PropTypes.string,
  }).isRequired,
  type: PropTypes.string.isRequired,
};

const HomePanel = () => {
  const { deviceType } = useDeviceType();

  useStoreHistory();

  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const setActivity = appStore((state) => state.setActivity);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const { activatePanel } = useMainPanel();

  const allLocalState = useAllLocalState();

  const prevLibraryIdsWithPropsRef = useRef(null);

  // Get all libraries with props
  const libraryIdsWithProps = useSyncExternalStore(
    (callback) => {
      dataManagerSubdocs.addLibraryYDocMapCallback(callback);
      const libraryIds = getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap);
      for (const [libraryId] of libraryIds.values()) {
        dataManagerSubdocs
          .getLibrary(libraryId)
          .getMap("library_props")
          .observe(callback);
      }

      return () => {
        const newLibraryIds = getArrayFromYDocMap(
          dataManagerSubdocs.libraryYDocMap,
        );
        for (const [libraryId] of newLibraryIds.values()) {
          dataManagerSubdocs
            .getLibrary(libraryId)
            .getMap("library_props")
            .unobserve(callback);
        }
        dataManagerSubdocs.removeLibraryYDocMapCallback(callback);
      };
    },
    () => {
      const libraryIds = getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap);

      const libraryIdsWithProps = [];
      for (const [libraryId] of libraryIds) {
        libraryIdsWithProps.push([
          libraryId,
          dataManagerSubdocs
            .getLibrary(libraryId)
            .getMap("library_props")
            .toJSON(),
        ]);
      }

      if (
        prevLibraryIdsWithPropsRef.current !== null &&
        prevLibraryIdsWithPropsRef.current !== undefined &&
        equalityDeep(prevLibraryIdsWithPropsRef.current, libraryIdsWithProps)
      ) {
        return prevLibraryIdsWithPropsRef.current;
      } else {
        prevLibraryIdsWithPropsRef.current = libraryIdsWithProps;
        return prevLibraryIdsWithPropsRef.current;
      }
    },
  );

  const sortedLibraryIds = useMemo(
    () => sortArrayWithPropsByOrder([...libraryIdsWithProps]),
    [libraryIdsWithProps],
  );

  const handleLibrarySelect = useCallback(
    (libraryId) => {
      setLibraryId(libraryId);
      setItemId("unselected");
      if (deviceType === "mobile") {
        setPanelOpened(false);
      }
      setPanelOpened(true);
      setActivity("libraries");
      activatePanel("libraries", "details", [libraryId]);
    },
    [
      setLibraryId,
      setItemId,
      deviceType,
      setPanelOpened,
      setActivity,
      activatePanel,
    ],
  );

  const latestItems = useMemo(() => {
    return Object.entries(allLocalState)
      .filter(([, val]) => val.lastOpenedDtm)
      .sort(
        (a, b) =>
          new Date(b[1].lastOpenedDtm).getTime() -
          new Date(a[1].lastOpenedDtm).getTime(),
      )
      .slice(0, 20)
      .map(([itemIdLibraryId, val]) => {
        const [libraryId] = itemIdLibraryId.split("::");

        return {
          itemIdLibraryId,
          props: { ...val, lastOpened: val.lastOpenedDtm, libraryId },
        };
      });
  }, [allLocalState]);

  return (
    <main className="w-full h-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        <div
          id="HomeContainer"
          className={`h-full w-full flex flex-col items-start justify-start
            ${deviceType === "mobile" && "w-full"}   
            ${deviceType === "desktop" && "mt-0 pb-20 px-8 pt-8"}       
          `}
          style={{
            width: `var(--detailsPanelWidth)`,
            maxWidth: `100%`,
            minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
          }}
        >
          <StyledTooltip label={"Open Website"}>
            <button
              onClick={() => {
                openUrl("https://www.sylvanite.app");
              }}
              id="HomeHeader"
              className={`h-fit min-h-fit w-fit flex items-center justify-start gap-4 cursor-pointer
            ${deviceType === "desktop" && "px-6"}
          `}
            >
              <img
                src="/src/assets/pen.svg"
                width={400}
                height={400}
                className="w-homePanelHeaderHeight h-homePanelHeaderHeight stroke-appLayoutText"
              />
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ bounce: 0 }}
                className="text-homePanelHeaderFontSize select-none pointer-events-none w100"
              >
                Sylvanite
              </motion.h1>
            </button>
          </StyledTooltip>

          <div
            id="HomeBody"
            className="h-fit min-h-fit w-full flex items-start justify-start mt-6"
          >
            <AnimatePresence>
              {
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grow min-w-0 basis-0 h-fit overflow-hidden rounded-lg"
                >
                  <div className={`h-fit w-full`}>
                    <div className="w-full h-full flex flex-col items-center justify-start">
                      <div className="h-fit w-full text-libraryDirectoryBookNodeFontSize px-5 py-1 flex items-center justify-between">
                        <span>Your Libraries</span>
                        <span className="text-appLayoutTextMuted text-actionBarResultDateFontSize"></span>
                      </div>
                      <div className="divider w-full px-4">
                        <div className="w-full h-px bg-appLayoutBorder"></div>
                      </div>
                      <div
                        id="HomePanelLibraryList"
                        className="w-full flex flex-wrap px-4 mt-1 gap-1"
                      >
                        {sortedLibraryIds.map(([libraryId, props]) => (
                          <button
                            key={libraryId}
                            onClick={() => handleLibrarySelect(libraryId)}
                            className="w-fit h-fit text-libraryDirectoryBookNodeFontSize px-2 py-1 border rounded-md border-appLayoutBorder hover:bg-appLayoutInverseHover"
                          >
                            {props?.item_properties?.item_title ||
                              "Untitled Library"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
            <AnimatePresence>
              {latestItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grow min-w-0 basis-0 h-fit overflow-hidden rounded-lg"
                >
                  <div className={`h-fit w-full`}>
                    <div className="w-full h-full flex flex-col items-center justify-start">
                      <div className="h-fit w-full text-libraryDirectoryBookNodeFontSize px-5 py-1 flex items-center justify-between">
                        <span>Recently opened</span>
                        <span className="text-appLayoutTextMuted text-actionBarResultDateFontSize"></span>
                      </div>
                      <div className="divider w-full px-4">
                        <div className="w-full h-px bg-appLayoutBorder"></div>
                      </div>
                      <div
                        id="RecentlyOpenedItemsList"
                        className="w-full flex flex-wrap px-4 mt-1 gap-1"
                      >
                        {latestItems.map(({ itemIdLibraryId, props }) => {
                          const itemId = itemIdLibraryId.split("::")[1];
                          const libraryId = itemIdLibraryId.split("::")[0];

                          let name = "";

                          let type =
                            itemId === libraryId ? "library" : "unknown";

                          try {
                            /**
                             * @type {YTree}
                             */
                            let ytree;

                            if (type != "library") {
                              if (
                                !dataManagerSubdocs.getLibrary(libraryId) ||
                                !checkForYTree(
                                  dataManagerSubdocs
                                    .getLibrary(libraryId)
                                    .getMap("library_directory"),
                                )
                              ) {
                                return null;
                              }

                              ytree = new YTree(
                                dataManagerSubdocs
                                  .getLibrary(libraryId)
                                  .getMap("library_directory"),
                              );

                              name = ytree
                                .getNodeValueFromKey(itemId)
                                .get("item_properties")["item_title"];

                              type = ytree
                                .getNodeValueFromKey(itemId)
                                .get("type");
                            } else {
                              if (!dataManagerSubdocs.getLibrary(libraryId)) {
                                return null;
                              }
                              name = dataManagerSubdocs
                                .getLibrary(libraryId)
                                .getMap("library_props")
                                .get("item_properties")["item_title"];
                            }
                          } catch (error) {
                            console.error(error);
                            return null;
                          }

                          return (
                            <div key={itemIdLibraryId} className="w-fit h-fit">
                              <RecentlyOpenedItemButton
                                name={name}
                                itemId={itemId}
                                props={props}
                                type={type}
                                onClick={() => {
                                  localStateManager.updateLastOpened(
                                    libraryId,
                                    itemId,
                                  );

                                  if (type === "library") {
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
