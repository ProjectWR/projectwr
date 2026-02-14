import PropTypes from "prop-types";
import DirectoryItemNode from "./DirectoryItemNode";
import LibraryDirectoryHeader from "./LibraryDirectoryHeader";
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
import useStoreHistory from "../../../hooks/useStoreHistory";
import useMainPanel from "../../../hooks/useMainPanel";
import { ScrollArea } from "@mantine/core";
import { StyledTooltip } from "../../LayoutComponents/StyledTooltip";
import ContextMenuWrapper from "../../LayoutComponents/ContextMenuWrapper";
import persistenceManagerForSubdocs from "../../../lib/persistenceSubDocs";

const LibraryDirectory = ({ libraryId }) => {
  console.log("Library Directory was rendered: ", libraryId);
  const { deviceType } = useDeviceType();

  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const libraryDirectoryBodyRef = useRef(null);

  const libraryManagerOpened = appStore((state) => state.libraryManagerOpened);

  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);

  const { activatePanel } = useMainPanel();

  const focusedItem = appStore((state) => state.focusedItem);

  /* Optimization: Derive focusedItemId directly from store to avoid double renders */
  const focusedItemId = useMemo(() => {
    if (
      focusedItem?.type === "libraries" &&
      focusedItem.libraryId === libraryId
    ) {
      return focusedItem.itemId;
    }
    return null;
  }, [focusedItem, libraryId]);

  /* Handler to update global store instead of local state */
  const handleSetFocusedItemId = useCallback(
    (itemId) => {
      // If null, we might want to clear focus or do nothing?
      if (itemId === null) {
        // appStore.getState().setFocusedItem(null); // Optional: decide if clicking background clears focus
        return;
      }

      const setFocusedItem = appStore.getState().setFocusedItem;
      setFocusedItem({
        type: "libraries",
        libraryId: libraryId,
        itemId: itemId,
      });
    },
    [libraryId],
  );

  // Only initialize library data refs if libraryId is not "unselected"
  const libraryPropsMapRef = useRef(
    libraryId !== "unselected"
      ? dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
      : null,
  );
  const libraryPropsMapState = useYMap(libraryPropsMapRef.current);

  /** @type {{current: YTree}} */
  const libraryYTreeRef = useRef(libraryId);

  /**
   * Centralized state tracking all descendants (name, type, children)
   * @type {[Map<string, {name: string, type: string, sortedChildren: string[]}>, function]}
   */
  const [sortedDescendants, setSortedDescendants] = useState(new Map());

  const updateDescendantsState = useCallback(() => {
    if (libraryYTreeRef.current && libraryId !== "unselected") {
      const descendants = new Map();

      // Recursive function to build descendants map
      const processNode = (nodeId) => {
        const nodeValue = libraryYTreeRef.current.getNodeValueFromKey(nodeId);
        const children = libraryYTreeRef.current.getNodeChildrenFromKey(nodeId);
        const sortedChildren = libraryYTreeRef.current.sortChildrenByOrder(
          children,
          nodeId,
        );

        descendants.set(nodeId, {
          name: nodeValue?.get("item_properties")?.item_title || "",
          type: nodeValue?.get("type"),
          sortedChildren: sortedChildren,
        });

        // Recursively process all children
        sortedChildren.forEach((childId) => processNode(childId));
      };

      // Start with root's children
      const rootChildren =
        libraryYTreeRef.current.getNodeChildrenFromKey("root");
      const sortedRootChildren = libraryYTreeRef.current.sortChildrenByOrder(
        rootChildren,
        "root",
      );

      descendants.set("root", {
        name: "root",
        type: "root",
        sortedChildren: sortedRootChildren,
      });

      sortedRootChildren.forEach((childId) => processNode(childId));

      console.log("updating descendants state");

      setSortedDescendants(descendants);
    }
  }, [libraryId]);

  const onRenameClick = useCallback(() => {
    setLibraryId(libraryId);
    setItemId("unselected");
    if (deviceType === "mobile") {
      setPanelOpened(false);
    }
    setPanelOpened(true);
    // Ideally we would trigger renaming mode here if LibraryDetailsPanel supports it via a prop or state
    // For now, navigating to details is the best valid action
    activatePanel("libraries", "details", [libraryId]);
  }, [
    libraryId,
    deviceType,
    setPanelOpened,
    activatePanel,
    setItemId,
    setLibraryId,
  ]);

  const contextMenuOptions = useMemo(() => {
    return [
      {
        label: "Edit Properties",
        icon: (
          <span className="icon-[bitcoin-icons--edit-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight transition-colors duration-0"></span>
        ),
        action: () => {
          setLibraryId(libraryId);
          setItemId("unselected");
          if (deviceType === "mobile") {
            setPanelOpened(false);
          }
          setPanelOpened(true);
          activatePanel("libraries", "details", [libraryId]);
        },
      },
      {
        label: "Create Book",
        icon: (
          <span className="icon-[fluent--book-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          const bookId = dataManagerSubdocs.createEmptyBook(
            libraryYTreeRef.current,
          );
          setItemId(bookId);
          activatePanel("libraries", "details", [libraryId, bookId]);
          if (deviceType === "mobile") {
            setPanelOpened(false);
          }
          setPanelOpened(true);
        },
      },
      {
        label: "Create Section",
        icon: (
          <span className="icon-[uiw--folder-add] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          const sectionId = dataManagerSubdocs.createEmptySection(
            libraryYTreeRef.current,
            "root",
          );
          activatePanel("libraries", "details", [libraryId, sectionId]);
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
          <span className="icon-[fluent--document-one-page-add-24-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          const paperId = dataManagerSubdocs.createEmptyPaper(
            libraryYTreeRef.current,
            "root",
          );
          activatePanel("libraries", "details", [libraryId, paperId]);
          setItemId(paperId);
          if (deviceType === "mobile") {
            setPanelOpened(false);
          }
          setPanelOpened(true);
        },
      },
      {
        label: "Create Note",
        icon: (
          <span className="icon-[fluent--square-add-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          const noteId = dataManagerSubdocs.createEmptyNote(
            libraryYTreeRef.current,
            "root",
          );
          setItemId(noteId);
          activatePanel("libraries", "details", [libraryId, noteId]);
          if (deviceType === "mobile") {
            setPanelOpened(false);
          }
          setPanelOpened(true);
        },
      },
      {
        isDivider: true,
      },
      {
        label: "Save as archive",
        icon: (
          <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          await persistenceManagerForSubdocs.saveArchive(
            dataManagerSubdocs.getLibrary(libraryId),
          );
        },
      },
      {
        label: "Load from archive",
        icon: (
          <span className="icon-[ph--upload-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          await persistenceManagerForSubdocs.loadArchive(
            dataManagerSubdocs.getLibrary(libraryId),
          );
        },
      },
    ];
  }, [
    libraryId,
    deviceType,
    setPanelOpened,
    activatePanel,
    setItemId,
    setLibraryId,
  ]);

  // useEffect(() => {
  //   console.log("Focused Item: ", focusedItemId);
  // }, [focusedItemId]);

  useEffect(() => {
    // Skip data subscriptions if libraryId is "unselected"
    if (libraryId === "unselected") {
      return;
    }

    if (
      !checkForYTree(
        dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory"),
      )
    ) {
      throw new Error("Tried to access uninitialized directory");
    }

    libraryYTreeRef.current = new YTree(
      dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory"),
    );

    // Initialize the centralized descendants state
    updateDescendantsState();

    // Single observe call for entire tree
    libraryYTreeRef.current.observe(updateDescendantsState);

    return () => {
      libraryYTreeRef.current.unobserve(updateDescendantsState);
    };
  }, [libraryId, updateDescendantsState]);

  // Early return if libraryId is unselected to prevent rendering library content
  if (libraryId === "unselected") {
    return (
      <div
        id="LibraryDirectoryContainer"
        className={`h-full w-full flex flex-col items-center`}
      >
        {false && deviceType === "desktop" && (
          <div
            id="LibraryDirectoryHeaderContainer"
            className="h-fit min-h-fit w-full p-2"
          >
            <LibraryDirectoryHeader
              currentLibraryId={libraryId}
              libraryPropsMapState={libraryPropsMapState}
            />
          </div>
        )}
        <div className="grow w-full flex items-center justify-center">
          <div className="text-appLayoutText text-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="LibraryDirectoryContainer"
      className={`h-full w-full flex flex-col items-center`}
    >
      {false && deviceType === "desktop" && (
        <div
          id="LibraryDirectoryHeaderContainer"
          className="h-fit min-h-fit w-full p-2"
        >
          <LibraryDirectoryHeader
            key={`libraryDirectoryHeader`}
            currentLibraryId={libraryId}
            libraryPropsMapState={libraryPropsMapState}
          />
        </div>
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
                    libraryYTreeRef.current,
                  );
                  setItemId(bookId);

                  activatePanel("libraries", "details", [libraryId, bookId]);

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
                    "root",
                  );

                  activatePanel("libraries", "details", [libraryId, sectionId]);

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
                    "root",
                  );

                  activatePanel("libraries", "details", [libraryId, paperId]);

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

      {/* <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div> */}

      <div
        id="LibraryDirectoryCreateHeader"
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
            <StyledTooltip label="Edit Properties" position="bottom">
              <span className="icon-[bitcoin-icons--edit-outline] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
            </StyledTooltip>
          </button>

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                          order-4
                        `}
            onClick={() => {
              console.log("Create Book!");
              const bookId = dataManagerSubdocs.createEmptyBook(
                libraryYTreeRef.current,
              );

              setItemId(bookId);

              activatePanel("libraries", "details", [libraryId, bookId]);
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              setPanelOpened(true);
            }}
          >
            <StyledTooltip label="Create Book" position="bottom">
              <span className="icon-[fluent--book-add-20-regular] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
            </StyledTooltip>
          </button>

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                        order-5
                        `}
            onClick={() => {
              console.log("create section button");
              let sectionId;

              try {
                if (focusedItemId && libraryYTreeRef.current?.getNodeValueFromKey(focusedItemId)) {
                  const focusedItemType = libraryYTreeRef.current
                    ?.getNodeValueFromKey(focusedItemId)
                    ?.get("type");

                  if (
                    focusedItemType === "book" ||
                    focusedItemType === "section"
                  ) {
                    sectionId = dataManagerSubdocs.createEmptySection(
                      libraryYTreeRef.current,
                      focusedItemId || "root",
                    );
                  } else if (
                    focusedItemType === "paper" ||
                    focusedItemType === "note"
                  ) {
                    sectionId = dataManagerSubdocs.createEmptySection(
                      libraryYTreeRef.current,
                      libraryYTreeRef.current?.getNodeParentFromKey(
                        focusedItemId,
                      ) || "root",
                    );
                  }
                }
              } finally {
                sectionId = dataManagerSubdocs.createEmptySection(
                  libraryYTreeRef.current,
                  "root",
                );
              }
              
              setItemId(sectionId);

              activatePanel("libraries", "details", [libraryId, sectionId]);
              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              setPanelOpened(true);
            }}
          >
            <StyledTooltip label="Create Section" position="bottom">
              <span className="icon-[fluent--folder-add-20-regular] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
            </StyledTooltip>
          </button>

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                          order-6
                          `}
            onClick={() => {
              console.log("create paper button");
              let paperId;

              try {
                if (focusedItemId && libraryYTreeRef.current?.getNodeValueFromKey(focusedItemId)) {
                  const focusedItemType = libraryYTreeRef.current
                    ?.getNodeValueFromKey(focusedItemId)
                    ?.get("type");

                  if (
                    focusedItemType === "book" ||
                    focusedItemType === "section"
                  ) {
                    paperId = dataManagerSubdocs.createEmptyPaper(
                      libraryYTreeRef.current,
                      focusedItemId || "root",
                    );
                  } else if (
                    focusedItemType === "paper" ||
                    focusedItemType === "note"
                  ) {
                    paperId = dataManagerSubdocs.createEmptyPaper(
                      libraryYTreeRef.current,
                      libraryYTreeRef.current?.getNodeParentFromKey(
                        focusedItemId,
                      ) || "root",
                    );
                  }
                }
              } finally {
                paperId = dataManagerSubdocs.createEmptyPaper(
                  libraryYTreeRef.current,
                  "root",
                );
              }


              setItemId(paperId);

              activatePanel("libraries", "details", [libraryId, paperId]);

              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              setPanelOpened(true);
            }}
          >
            <StyledTooltip label="Create Paper" position="bottom">
              <span className="icon-[fluent--document-one-page-add-24-regular] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
            </StyledTooltip>
          </button>

          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-0 p-[6px]  rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
                          order-6
                          `}
            onClick={() => {
              console.log("create note button");
              let noteId;

              try {
                if (focusedItemId && libraryYTreeRef.current?.getNodeValueFromKey(focusedItemId)) {
                  const focusedItemType = libraryYTreeRef.current
                    ?.getNodeValueFromKey(focusedItemId)
                    ?.get("type");

                  if (
                    focusedItemType === "book" ||
                    focusedItemType === "section"
                  ) {
                    noteId = dataManagerSubdocs.createEmptyNote(
                      libraryYTreeRef.current,
                      focusedItemId || "root",
                    );
                  } else if (
                    focusedItemType === "paper" ||
                    focusedItemType === "note"
                  ) {
                    noteId = dataManagerSubdocs.createEmptyNote(
                      libraryYTreeRef.current,
                      libraryYTreeRef.current?.getNodeParentFromKey(
                        focusedItemId,
                      ) || "root",
                    );
                  }
                }
              } finally {
                noteId = dataManagerSubdocs.createEmptyNote(
                  libraryYTreeRef.current,
                  "root",
                );
              }



              setItemId(noteId);

              activatePanel("libraries", "details", [libraryId, noteId]);

              if (deviceType === "mobile") {
                setPanelOpened(false);
              }

              setPanelOpened(true);
            }}
          >
            <StyledTooltip label="Create Note" position="bottom">
              <span className="icon-[fluent--square-add-20-regular] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
            </StyledTooltip>
          </button>
        </div>
      </div>
      <ContextMenuWrapper
        asChild={true}
        options={contextMenuOptions}
        triggerClassname="grow min-h-0 basis-0 w-full"
      >
        <ScrollArea
          scrollbars="y"
          id="libraryDirectoryBodyContainer"
          type="hover"
          classNames={{
            root: "grow min-h-0 basis-0  w-full",
            scrollbar: `bg-transparent hover:bg-transparent p-0 w-scrollbarWidthThin z-[5]`,
            thumb: `bg-appLayoutBorder rounded-l-full hover:!bg-appLayoutInverseHover opacity-70`,
            content: `h-fit w-full max-h-full px-1`,
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleSetFocusedItemId(null);
            }
          }}
          ref={libraryDirectoryBodyRef}
        >
          <div
            id="BookListContainer"
            className="h-fit w-full px-0 flex flex-col justify-start items-center"
          >
            {sortedDescendants.get("root")?.sortedChildren &&
              sortedDescendants.get("root").sortedChildren.length > 0 &&
              sortedDescendants.get("root").sortedChildren.map((bookId) => (
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
                    setFocusedItemId={handleSetFocusedItemId}
                    sortedDescendants={sortedDescendants}
                  />
                </motion.div>
              ))}
          </div>
        </ScrollArea>
      </ContextMenuWrapper>
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
                  ${isOpened
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
                       ${shouldDropdownGoUp
                ? `                      
                              ${origin === "topRight" &&
                "origin-bottom-right right-0"
                } 
                              ${origin === "topMiddle" && "origin-bottom"}`
                : `                       
                              ${origin === "topRight" &&
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
