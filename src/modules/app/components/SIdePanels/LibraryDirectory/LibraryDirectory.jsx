import PropTypes from "prop-types";
import DirectoryItemNode from "./DirectoryItemNode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { checkForYTree, YTree } from "yjs-orderedtree";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import useYMap from "../../../hooks/useYMap";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../../stores/appStore";
import useOuterClick from "../../../../design-system/useOuterClick";
import { max, min } from "lib0/math";
import useComputedCssVar from "../../../hooks/useComputedCssVar";
import itemLocalStateManager from "../../../lib/itemLocalState";
import useStoreHistory from "../../../hooks/useStoreHistory";
import useMainPanel from "../../../hooks/useMainPanel";

const LibraryDirectory = ({ libraryId }) => {
  console.log("Library Directory was rendered: ", libraryId);
  const { deviceType } = useDeviceType();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const libraryDirectoryBodyRef = useRef(null);

  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);

  const { activatePanel } = useMainPanel();

  const focusedItem = appStore((state) => state.focusedItem);

  const [focusedItemId, setFocusedItemId] = useState(null);

  useEffect(() => {
    if (
      focusedItem?.type === "libraries" &&
      focusedItem.libraryId === libraryId
    ) {
      setFocusedItemId(focusedItem.itemId);
    }
  }, [focusedItem, libraryId]);

  useEffect(() => {
    console.log("Focused Item: ", focusedItemId);
  }, [focusedItemId]);

  const libraryPropsMapRef = useRef(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );
  const libraryPropsMapState = useYMap(libraryPropsMapRef.current);

  /** @type {{current: YTree}} */
  const libraryYTreeRef = useRef(libraryId);

  /**
   * @type {[Array<String>, function]}
   */
  const [sortedChildrenState, setSortedChildrenState] = useState(null);

  const updateChildrenState = useCallback(() => {
    setSortedChildrenState(
      libraryYTreeRef.current.sortChildrenByOrder(
        libraryYTreeRef.current.getNodeChildrenFromKey("root"),
        "root"
      )
    );
  }, []);

  useEffect(() => {
    if (
      !checkForYTree(
        dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
      )
    ) {
      throw new Error("Tried to access uninitialized directory");
    }

    libraryYTreeRef.current = new YTree(
      dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
    );

    setSortedChildrenState(
      libraryYTreeRef.current.sortChildrenByOrder(
        libraryYTreeRef.current.getNodeChildrenFromKey("root"),
        "root"
      )
    );

    libraryYTreeRef.current.observe(updateChildrenState);

    return () => {
      libraryYTreeRef.current.unobserve(updateChildrenState);
    };
  }, [libraryId, updateChildrenState]);

  return (
    <div
      id="LibraryDirectoryContainer"
      className={`h-full w-full flex flex-col items-center`}
    >
      {deviceType === "desktop" && (
        <button
          onClick={() => {
            setFocusedItemId(null);
          }}
          id="LibraryDirectoryHeader"
          className={`flex items-center justify-start w-full overflow-x-hidden overflow-ellipsis gap-2 px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-appLayoutBorder  `}
        >
          <div className="h-fit min-h-fit max-h-full py-3 w-full flex items-center justify-start order-2">
            <h1
              className={`h-fit w-full grow pt-1 px-3 text-libraryManagerHeaderText text-appLayoutText order-2 ${
                deviceType === "mobile" ? "ml-3" : ""
              }
                ${
                  focusedItem === null &&
                  "text-shadow-md text-shadow-appLayoutHighlight"
                }
              `}
            >
              <motion.p
                animate={{
                  textShadow:
                    focusedItemId === null
                      ? `0 0 10px hsl(var(--appLayoutTextMuted))`
                      : "none",
                }}
                className="max-w-full w-full h-fit text-nowrap overflow-hidden text-ellipsis"
              >
                {libraryPropsMapState.item_properties.item_title}
              </motion.p>
            </h1>
          </div>
        </button>
      )}
      {deviceType === "mobile" && (
        <div
          id="LibraryDirectoryHeader"
          className={`flex items-center justify-between px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-appLayoutBorder  z-1`}
        >
          <OptionsButton
            className={`order-5`}
            container={libraryDirectoryBodyRef.current}
            buttonIcon={
              <span className="icon-[line-md--menu] h-full w-full"></span>
            }
            options={[
              {
                label: "Edit Properties",
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
                label: "Create Book",
                icon: (
                  <span className="icon-[fluent--book-add-24-regular] hover:text-appLayoutHighlight rounded-full h-full w-full"></span>
                ),
                callback: () => {
                  console.log("Create Book!");
                  const bookId = dataManagerSubdocs.createEmptyBook(
                    libraryYTreeRef.current
                  );
                  setItemId(bookId);
                  if (deviceType === "mobile") {
                    setPanelOpened(false);
                  }

                  setPanelOpened(true);
                },
              },
              {
                label: "Create Section",
                icon: (
                  <span className="icon-[uiw--folder-add] h-full w-full"></span>
                ),
                callback: () => {
                  console.log("create section button");
                  const sectionId = dataManagerSubdocs.createEmptySection(
                    libraryYTreeRef.current,
                    "root"
                  );

                  setItemId(sectionId);
                  if (deviceType === "mobile") {
                    setPanelOpened(false);
                  }

                  setPanelOpened(true);
                },
              },
              {
                label: "Create Paper",
                icon: (
                  <span className="icon-[fluent--document-one-page-add-24-regular] h-full w-full"></span>
                ),
                callback: () => {
                  console.log("create paper button");
                  const paperId = dataManagerSubdocs.createEmptyPaper(
                    libraryYTreeRef.current,
                    "root"
                  );

                  setItemId(paperId);
                  if (deviceType === "mobile") {
                    setPanelOpened(false);
                  }

                  setPanelOpened(true);
                },
              },
            ]}
          />

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-1 mx-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
             order-1
          `}
            onClick={() => {
              setLibraryId("unselected");
            }}
          >
            <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
        </div>
      )}

      <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div>

      <div
        id="LibraryDirectoryHeader"
        className={`flex flex-col items-center justify-between h-fit min-h-fit mt-1 border-appLayoutBorder   z-1`}
      >
        <div className="h-fit min-h-fit py-1 px-1 w-full flex flex-row gap-2 items-center order-2">
          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                          order-3
                        `}
            onClick={() => {
              setLibraryId(libraryId);
              setItemId("unselected");
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              activatePanel("libraries", "details", [libraryId]);

              setPanelOpened(true);
            }}
          >
            <span className="icon-[bitcoin-icons--edit-outline] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                          order-4
                        `}
            onClick={() => {
              console.log("Create Book!");
              const bookId = dataManagerSubdocs.createEmptyBook(
                libraryYTreeRef.current
              );

              setItemId(bookId);
              setFocusedItemId(bookId);
              activatePanel("libraries", "details", [libraryId]);
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              setPanelOpened(true);
              itemLocalStateManager.setItemOpened(bookId, true, libraryId);
            }}
          >
            <span className="icon-[fluent--book-add-20-regular] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                        order-5
                        `}
            onClick={() => {
              console.log("create section button");
              let sectionId;

              if (focusedItemId) {
                const focusedItemType = libraryYTreeRef.current
                  ?.getNodeValueFromKey(focusedItemId)
                  ?.get("type");

                if (
                  focusedItemType === "book" ||
                  focusedItemType === "section"
                ) {
                  sectionId = dataManagerSubdocs.createEmptySection(
                    libraryYTreeRef.current,
                    focusedItemId || "root"
                  );
                } else if (
                  focusedItemType === "paper" ||
                  focusedItemType === "note"
                ) {
                  sectionId = dataManagerSubdocs.createEmptySection(
                    libraryYTreeRef.current,
                    libraryYTreeRef.current?.getNodeParentFromKey(
                      focusedItemId
                    ) || "root"
                  );
                }
              } else {
                sectionId = dataManagerSubdocs.createEmptySection(
                  libraryYTreeRef.current,
                  "root"
                );
              }

              setItemId(sectionId);
              setFocusedItemId(sectionId);
              activatePanel("libraries", "details", [libraryId, sectionId]);
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              setPanelOpened(true);

              if (focusedItemId)
                itemLocalStateManager.setItemOpened(
                  focusedItemId,
                  true,
                  libraryId
                );
              itemLocalStateManager.setItemOpened(sectionId, true, libraryId);
            }}
          >
            <span className="icon-[fluent--folder-add-20-regular] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                          order-6
                          `}
            onClick={() => {
              console.log("create paper button");
              let paperId;

              if (focusedItemId) {
                const focusedItemType = libraryYTreeRef.current
                  ?.getNodeValueFromKey(focusedItemId)
                  ?.get("type");

                if (
                  focusedItemType === "book" ||
                  focusedItemType === "section"
                ) {
                  paperId = dataManagerSubdocs.createEmptyPaper(
                    libraryYTreeRef.current,
                    focusedItemId || "root"
                  );
                } else if (
                  focusedItemType === "paper" ||
                  focusedItemType === "note"
                ) {
                  paperId = dataManagerSubdocs.createEmptyPaper(
                    libraryYTreeRef.current,
                    libraryYTreeRef.current?.getNodeParentFromKey(
                      focusedItemId
                    ) || "root"
                  );
                }
              } else {
                paperId = dataManagerSubdocs.createEmptyPaper(
                  libraryYTreeRef.current,
                  "root"
                );
              }

              setItemId(paperId);
              setFocusedItemId(paperId);
              activatePanel("libraries", "details", [libraryId, paperId]);

              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              setPanelOpened(true);
              if (focusedItemId)
                itemLocalStateManager.setItemOpened(
                  focusedItemId,
                  true,
                  libraryId
                );
              itemLocalStateManager.setItemOpened(paperId, true, libraryId);
            }}
          >
            <span className="icon-[fluent--document-one-page-add-24-regular] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                          order-6
                          `}
            onClick={() => {
              console.log("create note button");
              let noteId;

              if (focusedItemId) {
                const focusedItemType = libraryYTreeRef.current
                  ?.getNodeValueFromKey(focusedItemId)
                  ?.get("type");

                if (
                  focusedItemType === "book" ||
                  focusedItemType === "section"
                ) {
                  noteId = dataManagerSubdocs.createEmptyNote(
                    libraryYTreeRef.current,
                    focusedItemId || "root"
                  );
                } else if (
                  focusedItemType === "paper" ||
                  focusedItemType === "note"
                ) {
                  noteId = dataManagerSubdocs.createEmptyNote(
                    libraryYTreeRef.current,
                    libraryYTreeRef.current?.getNodeParentFromKey(
                      focusedItemId
                    ) || "root"
                  );
                }
              } else {
                noteId = dataManagerSubdocs.createEmptyNote(
                  libraryYTreeRef.current,
                  "root"
                );
              }

              setItemId(noteId);
              setFocusedItemId(noteId);
              activatePanel("libraries", "details", [libraryId, noteId]);

              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              setPanelOpened(true);
              if (focusedItemId)
                itemLocalStateManager.setItemOpened(
                  focusedItemId,
                  true,
                  libraryId
                );
              itemLocalStateManager.setItemOpened(noteId, true, libraryId);
            }}
          >
            <span className="icon-[fluent--square-add-20-regular] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
        </div>
      </div>
      <div id="libraryDirectoryBodyContainer" className={`grow min-h-0 w-full`}>
        <div
          id="libraryDirectoryBody"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setFocusedItemId(null);
            }
          }}
          ref={libraryDirectoryBodyRef}
          style={{
            paddingLeft: `var(--scrollbarWidth)`,
          }}
          className={`h-full w-full overflow-y-scroll overflow-x-hidden ${
            deviceType === "mobile" ? "no-scrollbar" : ""
          }`}
        >
          <div
            id="BookListContainer"
            className="h-fit w-full flex flex-col justify-start items-center"
          >
            {sortedChildrenState &&
              sortedChildrenState.length > 0 &&
              sortedChildrenState.map((bookId) => (
                <motion.div
                  id={`Node-${bookId}`}
                  key={bookId}
                  className="w-full h-fit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <DirectoryItemNode
                    libraryId={libraryId}
                    ytree={libraryYTreeRef.current}
                    itemId={bookId}
                    breadcrumbs={[libraryId, bookId]}
                    focusedItemId={focusedItemId}
                    setFocusedItemId={setFocusedItemId}
                  />
                </motion.div>
              ))}

            {deviceType === "mobile" && (
              <OptionsButton
                id="DirectoryItemAddButton"
                container={libraryDirectoryBodyRef.current}
                className={`mt-3 bg-appBackground rounded-full w-libraryDirectoryBookNodeHeight h-libraryDirectoryBookNodeHeight p-1 hover:bg-appLayoutInverseHover`}
                buttonIcon={
                  <span className="icon-[material-symbols-light--add-2-rounded] h-full w-full"></span>
                }
                origin={"topMiddle"}
                options={[
                  {
                    label: "Create Book",
                    icon: (
                      <span className="icon-[fluent--book-add-20-regular] hover:text-appLayoutHighlight rounded-full h-full w-full"></span>
                    ),
                    callback: () => {
                      console.log("Create Book!");
                      const bookId = dataManagerSubdocs.createEmptyBook(
                        libraryYTreeRef.current
                      );
                      setItemId(bookId);
                      if (deviceType === "mobile") {
                        setPanelOpened(false);
                      }

                      setPanelOpened(true);
                    },
                  },
                  {
                    label: "Create Section",
                    icon: (
                      <span className="icon-[fluent--folder-add-20-regular] h-full w-full"></span>
                    ),
                    callback: () => {
                      console.log("create section button");
                      const sectionId = dataManagerSubdocs.createEmptySection(
                        libraryYTreeRef.current,
                        "root"
                      );

                      setItemId(sectionId);
                      if (deviceType === "mobile") {
                        setPanelOpened(false);
                      }

                      setPanelOpened(true);
                    },
                  },
                  {
                    label: "Create Paper",
                    icon: (
                      <span className="icon-[fluent--document-one-page-add-20-regular] h-full w-full"></span>
                    ),
                    callback: () => {
                      console.log("create paper button");
                      const paperId = dataManagerSubdocs.createEmptyPaper(
                        libraryYTreeRef.current,
                        "root"
                      );

                      setItemId(paperId);
                      if (deviceType === "mobile") {
                        setPanelOpened(false);
                      }

                      setPanelOpened(true);
                    },
                  },
                ]}
              >
                <span
                  className={`icon-[material-symbols-light--add-2-rounded] h-full w-full`}
                ></span>
              </OptionsButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryDirectory;

const OptionsButton = ({
  options,
  className,
  buttonIcon,
  origin = "topRight",
  container,
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
        const containerRect = container.getBoundingClientRect();

        const bottomLimit = containerRect.bottom;
        const bottomOfDropdown =
          buttonRect.top + window.scrollY + dropdownRect.height * 2 + 3;

        const distanceOverflowed = bottomOfDropdown - bottomLimit;

        if (distanceOverflowed > 0) {
          setShouldDropdownGoUp(true);
          setTop(0 - distanceOverflowed);
        } else {
          setShouldDropdownGoUp(false);
        }
      }
    }
  }, [isOpened, container]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      ref={buttonContainerRef}
      className={`relative w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-1 mr-1 rounded-full 
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
            transition={{ ease: "easeOut", duration: 0.1 }}
            className={`absolute h-fit w-optionsDropdownWidth max-w-optionsDropdownWidth overflow-hidden flex flex-col items-center 
                       rounded-md bg-appBackground border border-appLayoutBorder shadow-md shadow-appLayoutGentleShadow 
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
                className="flex items-center justify-start w-full h-optionsDropdownOptionHeight pl-1 py-1 gap-px
                           hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight transition-colors duration-0"
              >
                <span className="h-optionsDropdownOptionHeight w-optionsDropdownOptionHeight min-w-optionsDropdownOptionHeight p-1">
                  {option.icon}
                </span>
                <span className="grow h-full pl-1 text-optionsDropdownOptionFont flex items-center justify-start">
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
