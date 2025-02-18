import PropTypes from "prop-types";
import DirectoryItemNode from "./DirectoryItemNode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { checkForYTree, YTree } from "yjs-orderedtree";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { libraryStore } from "../../../stores/libraryStore";
import useYMap from "../../../hooks/useYMap";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../../stores/appStore";
import useOuterClick from "../../../../design-system/useOuterClick";
import { max, min } from "lib0/math";

const LibraryDirectory = ({ libraryId }) => {
  console.log("Library Directory was rendered: ", libraryId);
  const { deviceType } = useDeviceType();
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const libraryDirectoryBodyRef = useRef(null);

  const setLibraryId = libraryStore((state) => state.setLibraryId);
  const setItemId = libraryStore((state) => state.setItemId);

  const libraryPropsMapRef = useRef(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );

  console.log(
    "library Directory rendered: ",
    libraryId,
    libraryPropsMapRef.current
  );

  const textContainerRef = useRef(null);
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--libraryManagerHeaderText"
    )
  );

  const libraryPropsMapState = useYMap(libraryPropsMapRef.current);

  /** @type {{current: YTree}} */
  const libraryYTreeRef = useRef(null);

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

  useEffect(() => {
    const textContainer = textContainerRef.current;
    const text = textRef.current;
    const checkOverflow = () => {
      if (textContainer && text) {
        const containerWidth = textContainer.offsetWidth - 20;
        const textWidth = text.scrollWidth;

        console.log("widths: ", containerWidth, textWidth);

        // Decrease/Increase the font size until the text fits
        let newFontSize = parseFloat(fontSize);

        newFontSize = newFontSize * (containerWidth / textWidth);

        newFontSize = min(
          newFontSize,
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--libraryManagerHeaderText"
            )
          )
        );

        newFontSize = max(newFontSize, 1);

        console.log("new Font size: ", newFontSize);

        setFontSize(`${newFontSize}rem`);
      }
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    if (textContainer) {
      observer.observe(textContainer);
    }
    return () => {
      if (textContainer) {
        observer.unobserve(textContainer);
      }
    };
  }, [fontSize]);

  return (
    <div
      id="LibraryDirectoryContainer"
      className={`h-full w-full flex flex-col`}
    >
      <div
        id="LibraryDirectoryHeader"
        className={`flex items-center justify-between px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow z-[1]`}
      >
        <div
          ref={textContainerRef}
          style={{ fontSize }}
          className="flex-grow min-w-0 flex justify-start items-center transition-colors duration-100 pb-px order-2"
        >
          <p
            ref={textRef}
            className="w-fit max-w-full overflow-hidden text-nowrap overflow-ellipsis"
          >
            {libraryPropsMapState.library_name}
          </p>
        </div>

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
                <span className="icon-[bitcoin-icons--edit-outline] h-full w-full transition-colors duration-100"></span>
              ),
              callback: () => {
                setLibraryId(libraryId);
                setItemId("unselected");
                setPanelOpened(false);
              },
            },
            {
              label: "Create Book",
              icon: (
                <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full h-full w-full"></span>
              ),
              callback: () => {
                console.log("Create Book!");
                const bookId = dataManagerSubdocs.createEmptyBook(
                  libraryYTreeRef.current
                );
                setItemId(bookId);
                setPanelOpened(false);
              },
            },
            {
              label: "Create Section",
              icon: (
                <span className="icon-[mdi--folder-add-outline] h-full w-full"></span>
              ),
              callback: () => {
                console.log("create section button");
                const sectionId = dataManagerSubdocs.createEmptySection(
                  libraryYTreeRef.current,
                  "root"
                );

                setItemId(sectionId);
                setPanelOpened(false);
              },
            },
            {
              label: "Create Paper",
              icon: (
                <span className="icon-[mdi--paper-add-outline] h-full w-full"></span>
              ),
              callback: () => {
                console.log("create paper button");
                const paperId = dataManagerSubdocs.createEmptyPaper(
                  libraryYTreeRef.current,
                  "root"
                );

                setItemId(paperId);
                setPanelOpened(false);
              },
            },
          ]}
        />

        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center
             order-1
          `}
          onClick={() => {
            setLibraryId("unselected");
          }}
        >
          <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>

        <span className="flex-grow order-3"></span>
      </div>
      <div
        id="libraryDirectoryBodyContainer"
        className={`flex-grow min-h-0 w-full`}
      >
        <div
          id="libraryDirectoryBody"
          ref={libraryDirectoryBodyRef}
          className={`h-full w-full overflow-y-scroll px-2 ${
            deviceType === "mobile" ? "no-scrollbar" : "pl-[0.75rem]"
          }`}
        >
          <div
            id="BookListContainer"
            className="h-fit w-full flex flex-col justify-start items-center pb-10"
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
                    ytree={libraryYTreeRef.current}
                    itemId={bookId}
                  />
                </motion.div>
              ))}

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
                    <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full h-full w-full"></span>
                  ),
                  callback: () => {
                    console.log("Create Book!");
                    const bookId = dataManagerSubdocs.createEmptyBook(
                      libraryYTreeRef.current
                    );
                    setItemId(bookId);
                    setPanelOpened(false);
                  },
                },
                {
                  label: "Create Section",
                  icon: (
                    <span className="icon-[mdi--folder-add-outline] h-full w-full"></span>
                  ),
                  callback: () => {
                    console.log("create section button");
                    const sectionId = dataManagerSubdocs.createEmptySection(
                      libraryYTreeRef.current,
                      "root"
                    );

                    setItemId(sectionId);
                    setPanelOpened(false);
                  },
                },
                {
                  label: "Create Paper",
                  icon: (
                    <span className="icon-[mdi--paper-add-outline] h-full w-full"></span>
                  ),
                  callback: () => {
                    console.log("create paper button");
                    const paperId = dataManagerSubdocs.createEmptyPaper(
                      libraryYTreeRef.current,
                      "root"
                    );

                    setItemId(paperId);
                    setPanelOpened(false);
                  },
                },
              ]}
            >
              <span
                className={`icon-[material-symbols-light--add-2-rounded] h-full w-full`}
              ></span>
            </OptionsButton>
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
      className={`relative w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full 
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
                           hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight transition-colors duration-200"
              >
                <span className="h-optionsDropdownOptionHeight w-optionsDropdownOptionHeight min-w-optionsDropdownOptionHeight p-1">
                  {option.icon}
                </span>
                <span className="flex-grow h-full pl-1 text-optionsDropdownOptionFont flex items-center justify-start">
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
