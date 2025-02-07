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

const LibraryDirectory = ({ libraryId }) => {
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

  return (
    <div
      id="LibraryDirectoryContainer"
      className={`h-full w-full flex flex-col`}
    >
      <div
        id="LibraryDirectoryHeader"
        className={`flex items-center justify-between px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow z-[1]`}
      >
        <h1 className="h-fit w-fit pt-1 pb-[0.38rem] text-libraryManagerHeaderText text-neutral-300 order-2">
          {libraryPropsMapState.library_name}
        </h1>
        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-5
 `}
          onClick={() => {
            console.log("Create Book!");
            dataManagerSubdocs.createEmptyBook(libraryYTreeRef.current);
          }}
        >
          <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>

        <button
          className="h-libraryManagerNodeEditButtonWidth w-libraryManagerNodeEditButtonWidth px-2 rounded-full hover:text-appLayoutHighlight hover:bg-appLayoutInverseHover transition-colors duration-200 order-4"
          onClick={() => {
            setLibraryId(libraryId);
            setItemId("unselected");
            setPanelOpened(false);
          }}
        >
          <span className="icon-[mdi--edit-outline] h-full w-full transition-colors duration-100"></span>
        </button>

        {deviceType === "mobile" && (
          <>
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
          </>
        )}
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
                id={`BookNode-${bookId}`}
                key={bookId}
                className="w-full h-fit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{duration: 0.2}}
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
