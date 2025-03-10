import React, { use, useCallback, useEffect, useRef, useState } from "react";
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
import { libraryStore } from "../../../stores/libraryStore";
import { appStore } from "../../../stores/appStore";
import { AnimatePresence, motion } from "motion/react";
import { max, min } from "lib0/math";
import useOuterClick from "../../../../design-system/useOuterClick";
import persistenceManagerForSubdocs from "../../../lib/persistenceSubDocs";
import syncManager from "../../../lib/sync";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import useComputedCssVar from "../../../hooks/useComputedCssVar";
import { createDebouncer } from "lib0/eventloop";

/**
 *
 * @param {{libraryId: string, className: string}} param0
 * @returns
 */
const LibraryManagerNode = ({ libraryId, className }) => {
  console.log("library node rendered: ", libraryId);

  const { deviceType } = useDeviceType();

  const [loading, setLoading] = useState(false);

  const setLibraryId = libraryStore((state) => state.setLibraryId);
  const setItemId = libraryStore((state) => state.setItemId);
  const setActivity = appStore((state) => state.setActivity);

  const setPanelOpened = appStore((state) => state.setPanelOpened);

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


  return (
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
            return "border-y border-black border-opacity-0";
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
                "flex-grow min-w-0 h-full rounded-l-lg flex justify-start items-center pl-3 hover:text-appLayoutHighlight hover:bg-appLayoutHover transition-colors duration-0"
              }
              onClick={() => {
                console.log(
                  "Library Entry when clicked: ",
                  libraryPropsMapState
                );
                setLibraryId(libraryId);
                setItemId("unselected");
                setPanelOpened(true);
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
                className="flex-grow text-libraryManagerNodeText min-w-0 flex justify-start items-center  transition-colors duration-0 pt-px ml-3"
              >
                <p
                  className="w-fit max-w-full overflow-hidden text-nowrap overflow-ellipsis"
                  ref={textRef}
                >
                  {libraryPropsMapState.library_name}
                </p>
              </div>
            </button>

            <OptionsButton
              className={`h-libraryManagerNodeEditButtonWidth w-libraryManagerNodeEditButtonWidth min-w-libraryManagerNodeEditButtonWidth px-2 rounded-full ml-1 mr-2 
                          text-appLayoutTextMuted hover:text-appLayoutHighlight hover:bg-appLayoutInverseHover transition-colors duration-0 ease-out`}
              buttonIcon={
                <span className="icon-[solar--menu-dots-bold] h-full w-full"></span>
              }
              options={[
                {
                  label: "Details",
                  icon: (
                    <span className="icon-[bitcoin-icons--edit-outline] h-full w-full transition-colors duration-0"></span>
                  ),
                  callback: () => {
                    setLibraryId(libraryId);
                    setItemId("unselected");
                    if (deviceType === "mobile") {
                      setPanelOpened(false);
                    }

                    setPanelOpened(true);
                  },
                },
                {
                  label: "Save",
                  icon: (
                    <span className="icon-[ph--download-thin] h-full w-full transition-colors duration-0"></span>
                  ),
                  callback: () => {
                    console.log("Saving Archive");
                    persistenceManagerForSubdocs.saveArchive(
                      dataManagerSubdocs.getLibrary(libraryId)
                    );
                  },
                },
                {
                  label: "Load",
                  icon: (
                    <span className="icon-[ph--upload-thin] h-full w-full transition-colors duration-0"></span>
                  ),
                  callback: async () => {
                    console.log("Loading Archive");
                    setLoading(true);
                    await persistenceManagerForSubdocs.loadArchive(
                      dataManagerSubdocs.getLibrary(libraryId)
                    );
                    setLoading(false);
                  },
                  // },
                  // {
                  //   label: "Sync",
                  //   icon: (
                  //     <span className="icon-[iconamoon--cloud-upload-thin] h-full w-full transition-colors duration-200"></span>
                  //   ),
                  //   callback: async () => {
                  //     setLoading(true);

                  //     await syncManager.initFireSync(
                  //       dataManagerSubdocs.getLibrary(libraryId)
                  //     );

                  //     setLoading(false);
                  //   },
                  // },
                },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

LibraryManagerNode.propTypes = {
  libraryId: PropTypes.string.isRequired,
  libraryPropsMap: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default React.memo(LibraryManagerNode);

const OptionsButton = ({
  options,
  className,
  buttonIcon,
  origin = "topRight",
}) => {
  const [isOpened, setIsOpened] = useState(false);

  const buttonContainerRef = useOuterClick(() => {
    setIsOpened(false);
  });

  const buttonRef = useRef(null);

  const [shouldDropdownGoUp, setShouldDropdownGoUp] = useState(false);
  const [top, setTop] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpened) {
      if (dropdownRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const containerRect = document
          .querySelector("#LibraryManagerBody")
          .getBoundingClientRect();

        console.log("all rects: ", buttonRect, dropdownRect, containerRect);

        console.log("button rect something: ", buttonRect.top + window.scrollY);

        const bottomLimit = containerRect.bottom;
        const bottomOfDropdown =
          buttonRect.top + window.scrollY + dropdownRect.height * 2 + 3;

        const distanceOverflowed = bottomOfDropdown - bottomLimit;

        console.log("values: ", bottomLimit, bottomOfDropdown);

        if (distanceOverflowed > 0) {
          setShouldDropdownGoUp(true);
          setTop(0 - distanceOverflowed);
        } else {
          setShouldDropdownGoUp(false);
          setTop(3);
        }
      }
    }
  }, [isOpened]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      ref={buttonContainerRef}
      className={`relative w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200
                  text-appLayoutText
                  ${
                    isOpened
                      ? "bg-appLayoutPressed text-appLayoutHighlight shadow-inner shadow-appLayoutShadow"
                      : "hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight"
                  }

                  flex items-center justify-center
                  ${className}
      `}
    >
      <button
        ref={buttonRef}
        className="w-full h-full"
        onClick={() => {
          setIsOpened(!isOpened);
        }}
      >
        {buttonIcon}
      </button>
      <AnimatePresence>
        {isOpened && (
          <motion.div
            ref={dropdownRef}
            style={{ top: `${top}px` }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.05 }}
            className={`z-50 absolute h-fit w-optionsDropdownWidth max-w-optionsDropdownWidth overflow-hidden flex flex-col items-center 
                       rounded-lg bg-appBackground border border-appLayoutBorder shadow-md shadow-appLayoutGentleShadow p-1
                       ${
                         shouldDropdownGoUp
                           ? `                      
                              ${
                                origin === "topRight" &&
                                "origin-bottom-right right-0"
                              } 
                              ${origin === "topMiddle" && "origin-bottom"}`
                           : `                       
                              ${
                                origin === "topRight" &&
                                "origin-top-right right-0"
                              } 
                              ${origin === "topMiddle" && "origin-top"}`
                       }

                       `}
          >
            {options?.map((option) => (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={option.label}
                onClick={() => {
                  setIsOpened(false);
                  option.callback();
                }}
                className="flex items-center justify-start w-full h-optionsDropdownOptionHeight py-1 gap-2 px-2
                           hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight text-appLayoutText transition-colors duration-200 rounded-lg"
              >
                <span className="h-optionsDropdownOptionHeight w-optionsDropdownOptionHeight min-w-optionsDropdownOptionHeight p-1">
                  {option.icon}
                </span>
                <span className="flex-grow h-full text-optionsDropdownOptionFont flex pt-px items-center justify-start">
                  {option.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
