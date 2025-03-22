import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import { equalityDeep } from "lib0/function";

/**
 *
 * @param {{ytree: YTree, sectionId: string}} param0
 * @returns
 */
const SectionDetailsPanel = ({ ytree, sectionId }) => {
  const { deviceType } = useDeviceType();

  console.log("library details panel rendering: ", sectionId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);

  const sectionMapState = useYMap(ytree.getNodeValueFromKey(sectionId));

  console.log("Library Props Map STATE: ", sectionMapState);

  const initialSectionProperties = useRef({
    item_title: sectionMapState.item_title,
    section_description: sectionMapState.section_description,
  });

  const [sectionProperties, setSectionProperties] = useState({
    item_title: sectionMapState.item_title,
    section_description: sectionMapState.section_description,
  });

  useEffect(() => {
    setSectionProperties({
      item_title: sectionMapState.item_title,
      section_description: sectionMapState.section_description,
    });

    initialSectionProperties.current = {
      item_title: sectionMapState.item_title,
      section_description: sectionMapState.section_description,
    };
  }, [sectionId, sectionMapState]);

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(sectionProperties, initialSectionProperties.current);
  }, [sectionProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setSectionProperties({
      ...sectionProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    const sectionMap = ytree.getNodeValueFromKey(sectionId);

    sectionMap.set("item_title", sectionProperties.item_title);
    sectionMap.set(
      "section_description",
      sectionProperties.section_description
    );

    setPanelOpened(true);
  };

  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleSave();
      }}
      id="LibraryDetailContainer"
      className={`h-full flex flex-col items-center justify-start 
      ${deviceType === "mobile" && "w-full"}   
      ${deviceType === "desktop" && "mt-10"}       
    `}
      style={
        deviceType === "desktop" && {
          width: `var(--detailsPanelWidth)`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
        }
      }
    >
      <div
        id="CreateLibraryHeader"
        className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start py-1 px-1 
            ${deviceType === "desktop" && "px-6"}
          `}
      >
        {deviceType === "mobile" && (
          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 ml-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center
             order-first
          `}
            onClick={() => {
              setPanelOpened(true);
              setItemId("unselected");
            }}
          >
            <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
        )}

        <input
          className="bg-appBackground flex-grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 px-2 pr-1 transition-colors duration-200 order-2"
          name="item_title"
          onChange={handleChange}
          value={sectionProperties.item_title}
        />
      </div>
      <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div>
      <div
        id="CreateLibraryBody"
        className="flex-grow w-full flex flex-col items-center justify-start border-b border-appLayoutBorder py-4 gap-3 px-6"
      >
        <div className="prop w-full h-detailsPanelDescriptionInputSize relative">
          <textarea
            id="libraryDescription"
            className="resize-none bg-appBackground text-detailsPanelPropsFontSize w-full h-full border border-appLayoutBorder px-3 pt-detailsPanelPropLabelHeight rounded-md  focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200"
            name="section_description"
            placeholder="Enter Description"
            onChange={handleChange}
            value={sectionProperties.section_description}
          />

          <label
            htmlFor="libraryDescription"
            className="absolute top-2 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none" // Smaller size and lighter color
          >
            Section Description
          </label>
        </div>

        <AnimatePresence>
          {unsavedChangesExist && (
            <motion.button
              type="submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-100 p-1 rounded-full 
                hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                flex items-center justify-center
                order-last
            `}
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
    </form>
  );
};

export default SectionDetailsPanel;
