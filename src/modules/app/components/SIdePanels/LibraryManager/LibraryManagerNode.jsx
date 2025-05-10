import React, {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import {
  getNextOrderIndex,
  getPreviousOrderIndex,
  insertBetween,
} from "../../../utils/orderUtil";
import useYMap from "../../../hooks/useYMap";
import dataManagerSubdocs, {
  getArrayFromYDocMap,
} from "../../../lib/dataSubDoc";
import { appStore } from "../../../stores/appStore";
import { AnimatePresence, motion } from "motion/react";
import { max, min } from "lib0/math";
import useOuterClick from "../../../../design-system/useOuterClick";
import persistenceManagerForSubdocs from "../../../lib/persistenceSubDocs";
import syncManager from "../../../lib/sync";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import useComputedCssVar from "../../../hooks/useComputedCssVar";
import { createDebouncer } from "lib0/eventloop";
import { ContextMenu } from "radix-ui";
import itemLocalStateManager from "../../../lib/itemLocalState";
import useStoreHistory from "../../../hooks/useStoreHistory";
import ContextMenuWrapper from "../../LayoutComponents/ContextMenuWrapper";
import useMainPanel from "../../../hooks/useMainPanel";
/**
 *
 * @param {{libraryId: string, className: string}} param0
 * @returns
 */
const LibraryManagerNode = ({ libraryId, className }) => {
  console.log("library node rendered: ", libraryId);

  const { deviceType } = useDeviceType();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const [loading, setLoading] = useState(false);

  const setLibraryId = appStore((state) => state.setLibraryId);
  const appStoreLibraryId = appStore((state) => state.libraryId);

  const setItemId = appStore((state) => state.setItemId);
  const appStoreItemId = appStore((state) => state.itemId);

  const setActivity = appStore((state) => state.setActivity);

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const appStorePanelOpened = appStore((state) => state.panelOpened);

  const { activatePanel } = useMainPanel();

  const libraryPropsMapRef = useRef(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );

  const ref = useRef(null);

  const textContainerRef = useRef(null);
  const textRef = useRef(null);

  const computedLibraryManagerNodeTextSize = useComputedCssVar(
    "--libraryManagerNodeText"
  );

  const libraryPropsMapState = useYMap(libraryPropsMapRef.current);

  const [isTopSelected, setIsTopSelected] = useState(false);
  const [isSelfSelected, setIsSelfSelected] = useState(false);

  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "LIBRARY",
    item: {
      id: libraryId,
      type: "library",
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "LIBRARY",
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }

      if (draggedItem.id === libraryId) {
        setIsSelfSelected(true);
        return;
      }

      setIsSelfSelected(false);

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (hoverClientY < hoverMiddleY) {
        setIsTopSelected(true);
      } else {
        setIsTopSelected(false);
      }
    },
    drop: (draggedItem, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }

      console.log("ITEM DROPPED: ", draggedItem);

      if (draggedItem.id === libraryId) {
        setIsSelfSelected(true);
        return;
      }

      setIsSelfSelected(false);

      if (draggedItem.type !== "library") return;

      console.log("SETTING POSITION: ");
      if (isTopSelected) {
        const previousOrderIndex = getPreviousOrderIndex(
          libraryId,
          getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap)
        );

        const orderIndex = insertBetween(
          previousOrderIndex,
          libraryPropsMapRef.current.get("order_index")
        );

        dataManagerSubdocs
          .getLibrary(draggedItem.id)
          .getMap("library_props")
          .set("order_index", orderIndex);
      }

      if (!isTopSelected) {
        const nextOrderIndex = getNextOrderIndex(
          libraryId,
          getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap)
        );

        const orderIndex = insertBetween(
          libraryPropsMapRef.current.get("order_index"),
          nextOrderIndex
        );

        dataManagerSubdocs
          .getLibrary(draggedItem.id)
          .getMap("library_props")
          .set("order_index", orderIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });
  drag(drop(ref));

  const options = useMemo(() => {
    return [
      {
        label: "Open",
        icon: (
          <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          if (
            !(
              appStoreLibraryId === libraryId &&
              appStoreItemId === "unselected" &&
              appStorePanelOpened
            )
          ) {
            setLibraryId(libraryId);
            setItemId("unselected");

            itemLocalStateManager.setItemOpened(libraryId, true, libraryId);

            setPanelOpened(true);
            activatePanel("libraries", "details", [libraryId]);

          }
        },
      },

      {
        label: "Save to device",
        icon: (
          <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          console.log("Saving Archive");
          persistenceManagerForSubdocs.saveArchive(
            dataManagerSubdocs.getLibrary(libraryId)
          );
        },
      },

      {
        label: "Load from device",
        icon: (
          <span className="icon-[ph--upload-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          console.log("Loading Archive");
          setLoading(true);
          await persistenceManagerForSubdocs.loadArchive(
            dataManagerSubdocs.getLibrary(libraryId)
          );
          setLoading(false);
        },
      },
    ];
  }, [
    appStoreLibraryId,
    appStoreItemId,
    appStorePanelOpened,
    clearFuture,
    libraryId,
    saveStateInHistory,
    setItemId,
    setLibraryId,
    setPanelOpened,
  ]);

  return (
    <ContextMenuWrapper triggerClassname={`w-full h-full`} options={options}>
      <div
        ref={ref}
        className={`
        w-full h-full
        library-${libraryId}  

        transition-colors ease-in-out duration-200

        ${isDragging ? "opacity-20" : ""} 
        
        ${(() => {
          if (!isSelfSelected && isOverCurrent) {
            return isTopSelected
              ? "border-t border-b border-b-transparent border-t-neutral-200"
              : "border-b border-t border-t-transparent border-b-neutral-200";
          } else {
            return "border-y border-transparent";
          }
        })()}

        ${className}
      `}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key={`libraryManagerNodeSpinner-${libraryId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.05 }}
              className="flex flex-col justify-center rounded-lg overflow-hidden items-center h-full w-full bg-appBackground text-appLayoutText"
            >
              <div
                className={`relative w-libraryManagerNodeEditButtonWidth h-libraryManagerNodeEditButtonWidth`}
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
              key={`libraryManagerNode-${libraryId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.05 }}
              className="w-full max-w-full h-full rounded-lg flex flex-row items-center justify-between hover:bg-appLayoutHover transition-colors duration-0 ease-out"
            >
              <button
                className={
                  "grow min-w-0 h-full rounded-l-lg flex justify-start items-center pl-3 hover:text-appLayoutHighlight hover:bg-appLayoutHover transition-colors duration-0"
                }
                onClick={() => {
                  if (
                    !(
                      appStoreLibraryId === libraryId &&
                      appStoreItemId === "unselected" &&
                      appStorePanelOpened
                    )
                  ) {
                    setLibraryId(libraryId);
                    setItemId("unselected");

                    itemLocalStateManager.setItemOpened(libraryId, true, libraryId);

                    setPanelOpened(true);

                    activatePanel("libraries", "details", [libraryId]);
                  }
                }}
                onMouseEnter={() => {
                  setIsDoorOpen(true);
                }}
                onMouseLeave={() => {
                  setIsDoorOpen(false);
                }}
              >
                <div className="relative h-libraryManagerNodeIconSize w-libraryManagerNodeIconSize min-w-libraryManagerNodeIconSize">
                  <AnimatePresence mode="sync">
                    {isDoorOpen && (
                      <motion.span
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.05 }}
                        key="doorOpen"
                        className="icon-[ion--enter] h-full w-full absolute top-0 left-0 transition-colors duration-0"
                      ></motion.span>
                    )}

                    {!isDoorOpen && (
                      <motion.span
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.05 }}
                        key="doorClose"
                        className="icon-[ion--enter-outline] h-full w-full absolute top-0 left-0 transition-colors duration-0"
                      ></motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  ref={textContainerRef}
                  className="grow text-libraryManagerNodeText min-w-0 flex justify-start items-center  transition-colors duration-0 pt-px ml-3"
                >
                  <p
                    className="w-fit max-w-full overflow-hidden text-nowrap text-ellipsis"
                    ref={textRef}
                  >
                    {libraryPropsMapState.library_name}
                  </p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContextMenuWrapper>
  );
};

LibraryManagerNode.propTypes = {
  libraryId: PropTypes.string.isRequired,
  libraryPropsMap: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default React.memo(LibraryManagerNode);
