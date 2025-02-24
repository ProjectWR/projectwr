import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { libraryStore } from "../../stores/libraryStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import { equalityDeep } from "lib0/function";

const LibraryDetailsPanel = ({ libraryId }) => {
  const { deviceType } = useDeviceType();

  console.log("library details panel rendering: ", libraryId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setLibraryId = libraryStore((state) => state.setLibraryId);
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const libraryPropsMapState = useYMap(
    dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
  );

  console.log("Library Props Map STATE: ", libraryPropsMapState);

  const initialLibraryProperties = useRef({
    library_name: libraryPropsMapState.library_name,
    library_description: libraryPropsMapState.library_description,
  });

  const [libraryProperties, setLibraryProperties] = useState({
    library_name: libraryPropsMapState.library_name,
    library_description: libraryPropsMapState.library_description,
  });

  useEffect(() => {
    setLibraryProperties({
      library_name: libraryPropsMapState.library_name,
      library_description: libraryPropsMapState.library_description,
    });

    initialLibraryProperties.current = {
      library_name: libraryPropsMapState.library_name,
      library_description: libraryPropsMapState.library_description,
    };
  }, [libraryId, libraryPropsMapState]);

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(libraryProperties, initialLibraryProperties.current);
  }, [libraryProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setLibraryProperties({
      ...libraryProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    dataManagerSubdocs
      .getLibrary(libraryId)
      .getMap("library_props")
      .set("library_name", libraryProperties.library_name);
    dataManagerSubdocs
      .getLibrary(libraryId)
      .getMap("library_props")
      .set("library_description", libraryProperties.library_description);

    setPanelOpened(true);
  };

  return (
    <div
      id="LibraryDetailContainer"
      className="w-full h-full flex flex-col items-center justify-start"
    >
      <div
        id="CreateLibraryHeader"
        className="h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow py-2 px-1"
      >
        {deviceType === "mobile" && (
          <>
            <button
              className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center
                         order-1
          `}
              onClick={() => {
                setPanelOpened(true);
                setLibraryId("unselected");
              }}
            >
              <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
            </button>

            <button
              className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-100 p-1 mr-2 rounded-full text-appLayoutTextMuted hover:text-appLayoutHighlight flex items-center justify-center
                          order-3`}
              onClick={() => {
                setPanelOpened(true);
              }}
              onMouseEnter={() => {
                setIsDoorOpen(true);
              }}
              onMouseLeave={() => {
                setIsDoorOpen(false);
              }}
            >
              <div className="relative w-full h-full">
                <AnimatePresence mode="sync">
                  {isDoorOpen && (
                    <motion.span
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.1 }}
                      key="doorOpen"
                      className="icon-[ion--enter] h-full w-full absolute top-0 left-0 transition-colors duration-100"
                    ></motion.span>
                  )}

                  {!isDoorOpen && (
                    <motion.span
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.1 }}
                      key="doorClose"
                      className="icon-[ion--enter-outline] h-full w-full absolute top-0 left-0 transition-colors duration-100"
                    ></motion.span>
                  )}
                </AnimatePresence>{" "}
              </div>
            </button>
          </>
        )}

        <input
          className="bg-appBackground flex-grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 pb-2 px-2 pr-1 transition-colors duration-200 order-2"
          name="library_name"
          onChange={handleChange}
          value={libraryProperties.library_name}
        />
      </div>

      <div
        id="CreateLibraryBody"
        className="flex-grow w-full flex flex-col items-center justify-start border-b border-appLayoutBorder py-3 gap-3 px-4"
      >
        <div className="prop w-full h-detailsPanelDescriptionInputSize relative">
          <textarea
            id="libraryDescription"
            className="resize-none bg-appBackground text-detailsPanelPropsFontSize w-full h-full border border-appLayoutBorder px-3 pt-detailsPanelPropLabelHeight rounded-md  focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200"
            name="library_description"
            placeholder="Enter Description"
            onChange={handleChange}
            value={libraryProperties.library_description}
          />

          <label
            htmlFor="libraryDescription"
            className="absolute top-1 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none" // Smaller size and lighter color
          >
            Library Description
          </label>
        </div>

        <AnimatePresence>
          {unsavedChangesExist && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-100 p-1 rounded-full 
                hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                flex items-center justify-center
                order-last
            `}
              onClick={handleSave}
            >
              <motion.span
                animate={{
                  opacity: 1,
                }}
                className={`icon-[material-symbols-light--check-rounded] ${"hover:text-appLayoutHighlight"} rounded-full w-full h-full`}
              ></motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
LibraryDetailsPanel.propTypes = {
  libraryEntryReference: PropTypes.object.isRequired,
};

export default LibraryDetailsPanel;
