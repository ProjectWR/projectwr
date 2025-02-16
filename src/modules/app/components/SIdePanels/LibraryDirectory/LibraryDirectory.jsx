import PropTypes from "prop-types";
import DirectoryItemNode from "./DirectoryItemNode";
import { useCallback, useEffect, useRef, useState } from "react";
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
        {/* <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-5
 `}
          onClick={() => {
            console.log("Create Book!");
            dataManagerSubdocs.createEmptyBook(libraryYTreeRef.current);
          }}
        >
          <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button> */}

        {/* <button
          className="h-libraryManagerNodeEditButtonWidth w-libraryManagerNodeEditButtonWidth px-2 rounded-full hover:text-appLayoutHighlight hover:bg-appLayoutInverseHover transition-colors duration-200 order-4"
          onClick={() => {
            setLibraryId(libraryId);
            setItemId("unselected");
            setPanelOpened(false);
          }}
        >
          <span className="icon-[mdi--edit-outline] h-full w-full transition-colors duration-100"></span>
        </button> */}

        <OptionsButton
          className={`order-5`}
          options={[
            {
              label: "Create Book",
              icon: (
                <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full h-full w-full"></span>
              ),
              callback: () => {
                console.log("Create Book!");
                dataManagerSubdocs.createEmptyBook(libraryYTreeRef.current);
              },
            },
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
          ]}
        />

        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center
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
        id="libraryDirectoryBody"
        className={`flex-grow w-full overflow-y-scroll ${
          deviceType === "mobile" ? "no-scrollbar" : "pl-[0.75rem]"
        }`}
      >
        <div
          id="BookListContainer"
          className="h-fit w-full flex flex-col justify-start "
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
        </div>
      </div>
    </div>
  );
};

export default LibraryDirectory;

const OptionsButton = ({ options, className }) => {
  const [isOpened, setIsOpened] = useState(false);

  const buttonContainerRef = useOuterClick(() => {
    setIsOpened(false);
  });

  return (
    <div
      ref={buttonContainerRef}
      className={`relative w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full 
                  text-appLayoutText
                  ${
                    isOpened
                      ? "bg-appLayoutPressed text-appLayoutHighlight shadow-inner shadow-appLayoutShadow"
                      : "hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight"
                  }

                  ${className}
      `}
    >
      <button
        className="w-full h-full"
        onClick={() => {
          setIsOpened(!isOpened);
        }}
      >
        <span className="icon-[lineicons--menu-hamburger-1] h-full w-full"></span>
      </button>
      <AnimatePresence>
        {isOpened && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ease: "easeOut", duration: 0.1}}
            className="absolute h-fit w-optionsDropdownWidth max-w-optionsDropdownWidth overflow-hidden flex flex-col items-center 
                       rounded-md bg-appBackground border border-appLayoutBorder shadow-md shadow-appLayoutGentleShadow top-0 right-0 origin-top-right"
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
                className="flex items-center justify-start w-full h-optionsDropdownOptionHeight pl-1 gap-px
                           hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight transition-colors duration-200"
              >
                <span className="h-optionsDropdownOptionHeight w-optionsDropdownOptionHeight min-w-optionsDropdownOptionHeight p-1">
                  {option.icon}
                </span>
                <span className="flex-grow h-full text-optionsDropdownOptionFont flex items-center justify-start">
                  {option.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
