import PropTypes from "prop-types";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { DropdownMenu } from "radix-ui";
import { appStore } from "../../../stores/appStore";
import dataManagerSubdocs, {
  getArrayFromYDocMap,
} from "../../../lib/dataSubDoc";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { sortArrayWithPropsByOrder } from "../../../utils/orderUtil";
import { equalityDeep } from "lib0/function";
import { setupSearchForLibrary } from "../../../lib/search";
import useMainPanel from "../../../hooks/useMainPanel";

const LibraryDirectoryHeader = ({ currentLibraryId, libraryPropsMapState }) => {
  const { deviceType } = useDeviceType();
  const setLibraryId = appStore((state) => state.setLibraryId);
  const setItemId = appStore((state) => state.setItemId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const { activatePanel } = useMainPanel();

  const libraryDropdownRef = useRef(null);
  const [libraryDropdownHeight, setLibraryDropdownHeight] = useState(0);

  const [isOpen, setIsOpen] = useState(false);

  const prevLibraryIdsWithPropsRef = useRef(null);

  useLayoutEffect(() => {
    if (libraryDropdownRef.current) {
      setLibraryDropdownHeight(libraryDropdownRef.current.scrollHeight);
    }
  }, [isOpen]);

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
          dataManagerSubdocs.libraryYDocMap
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
    }
  );

  const sortedLibraryIds = useMemo(
    () => sortArrayWithPropsByOrder([...libraryIdsWithProps]),
    [libraryIdsWithProps]
  );

  const handleLibrarySelect = useCallback(
    (libraryId) => {
      setLibraryId(libraryId);
      setItemId("unselected");
      if (deviceType === "mobile") {
        setPanelOpened(false);
      }
      setPanelOpened(true);
      activatePanel("libraries", "details", [libraryId]);
    },
    [setLibraryId, setItemId, setPanelOpened, deviceType, activatePanel]
  );

  const handleCreateLibrary = useCallback(() => {
    const newLibraryId = dataManagerSubdocs.createEmptyLibrary();
    setLibraryId(newLibraryId);
    setupSearchForLibrary(newLibraryId);
    if (deviceType === "mobile") {
      setPanelOpened(false);
    }
    setPanelOpened(true);
    activatePanel("libraries", "details", [newLibraryId]);
  }, [setLibraryId, setPanelOpened, deviceType, activatePanel]);

  return (
    <div
      id="LibraryDirectoryHeader"
      className={`flex items-center justify-start w-full overflow-x-hidden overflow-ellipsis h-fit min-h-libraryManagerHeaderHeight  border rounded-md flex-col transition-all duration-200 ease-in-out ${
        isOpen
          ? "border-appLayoutBorder bg-appBackground shadow-md shadow-appLayoutGentleShadow"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="h-fit min-h-fit max-h-full w-full flex items-center justify-start ">
        <div
          className={`h-fit w-full py-1 grow px-2 text-libraryManagerHeaderText text-appLayoutText hover:text-appLayoutHighlight transition-colors duration-100 flex items-center justify-center`}
        >
          <p className="max-w-full w-full h-fit text-nowrap overflow-hidden text-ellipsis text-left">
            {libraryPropsMapState.item_properties.item_title}
          </p>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-appLayoutInverseHover rounded-full w-libraryManagerAddButtonSize max-h-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize flex items-center justify-center"
          >
            <span
              className={`icon-[heroicons-outline--selector] w-[80%] h-[80%]`}
            ></span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="w-full"
          key={isOpen ? "openedDropdown" : "closedDropdown"}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "fit-content", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full overflow-hidden"
            >
              <div className="h-fit w-full grid grid-cols-1">
                {sortedLibraryIds.map(([libraryId, props]) => (
                  <AnimatePresence key={libraryId} mode="wait">
                    <motion.div
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      transition={{ duration: 0.05 }}
                      key={libraryId}
                      className="text-libraryManagerHeaderText h-fit py-1 px-2 w-full flex items-center justify-between hover:bg-appLayoutHover transition-colors duration-100"
                      onClick={() => handleLibrarySelect(libraryId)}
                    >
                      <span className="text-appLayoutText grow">
                        {props.item_properties.item_title}
                      </span>
                      {libraryId === currentLibraryId && (
                        <span className="icon-[material-symbols-light--check-rounded] w-preferencesItemButtonSize h-full"></span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ))}
              </div>
              <div className="h-px bg-appLayoutBorder"></div>
              <div className="contextMenuItem" onClick={handleCreateLibrary}>
                <span className="icon-[material-symbols-light--add-2-rounded] w-preferencesItemButtonSize h-full"></span>
                <span className="text-appLayoutText">Create Library</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

LibraryDirectoryHeader.propTypes = {
  currentLibraryId: PropTypes.string.isRequired,
  libraryPropsMapState: PropTypes.object.isRequired,
};

export default LibraryDirectoryHeader;
