import { motion, AnimatePresence } from "motion/react";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { useMemo, useState } from "react";
import { checkForYTree, YTree } from "yjs-orderedtree";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import useStoreHistory from "../../hooks/useStoreHistory";
import useMainPanel from "../../hooks/useMainPanel";
import { useAllLocalState } from "../../hooks/useLocalState";
import localStateManager from "../../lib/localState";
import PropTypes from "prop-types";

const RecentlyOpenedItemButton = ({ onClick, name, itemId, props, type }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      id={itemId}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="px-3 py-1 w-full h-fit flex items-center justify-between rounded-md  text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted hover:text-appLayoutText"
    >
      <span className="h-fit flex items-center gap-2">
        <motion.span transition={{ duration: 0.2 }}>{name}</motion.span>
        <span className="text-recentlyOpenedDateFontSize w-fit pt-1 text-nowrap">
          {type}
        </span>
      </span>
      <span className="text-libraryDirectoryBookNodeFontSize">
        {new Date(props.lastOpened).toLocaleString()}
      </span>
    </button>
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

  const latestItems = useMemo(() => {
    return Object.entries(allLocalState)
      .filter(([, val]) => val.lastOpenedDtm)
      .sort(
        (a, b) =>
          new Date(b[1].lastOpenedDtm).getTime() -
          new Date(a[1].lastOpenedDtm).getTime(),
      )
      .slice(0, 10)
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
              Sylvanite
            </motion.h1>
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
                      <div className="h-fit w-full text-xl px-6 pb-2 flex items-center justify-between">
                        <span>Recently Opened</span>
                        <span className="text-appLayoutTextMuted text-actionBarResultDateFontSize"></span>
                      </div>
                      <div className="divider w-full px-3">
                        <div className="w-full h-px bg-appLayoutBorder"></div>
                      </div>{" "}
                      {latestItems.map(({ itemIdLibraryId, props }) => {
                        const itemId = itemIdLibraryId.split("::")[1];
                        const libraryId = itemIdLibraryId.split("::")[0];

                        let name = "";

                        let type = itemId === libraryId ? "library" : "unknown";

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
