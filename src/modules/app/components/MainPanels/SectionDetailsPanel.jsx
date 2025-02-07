import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { libraryStore } from "../../stores/libraryStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";

/**
 *
 * @param {{ytree: YTree, sectionId: string}} param0
 * @returns
 */
const SectionDetailsPanel = ({ ytree, sectionId }) => {
  console.log("library details panel rendering: ", sectionId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = libraryStore((state) => state.setItemId);

  const sectionMapState = useYMap(ytree.getNodeValueFromKey(sectionId));

  console.log("Library Props Map STATE: ", sectionMapState);

  const [sectionProperties, setSectionProperties] = useState({
    item_title: "",
    section_description: "",
  });

  useEffect(() => {
    setSectionProperties({
      item_title: sectionMapState.item_title,
      section_description: sectionMapState.section_description,
    });
  }, [sectionId, sectionMapState]);

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
  };

  return (
    <div
      id="LibraryDetailContainer"
      className="w-full h-full flex flex-col items-center justify-start"
    >
      <div
        id="CreateLibraryHeader"
        className="h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow py-2 px-1 gap-1"
      >
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

        <input
          className="bg-appBackground flex-grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 pb-2 px-2 pr-1 transition-colors duration-200"
          name="item_title"
          onChange={handleChange}
          value={sectionProperties.item_title}
        />
      </div>

      <div
        id="CreateLibraryBody"
        className="flex-grow w-full flex flex-col items-end justify-start border-b border-appLayoutBorder py-3 gap-3 px-4"
      >
        <div className="prop w-full h-[15rem] relative">
          <textarea
            id="libraryDescription"
            className="bg-appBackground w-full h-full border border-appLayoutBorder px-3 pt-detailsPanelPropLabelHeight rounded-md  focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200"
            name="section_description"
            onChange={handleChange}
            value={sectionProperties.section_description}
          />

          <label
            htmlFor="libraryDescription"
            className="absolute top-1 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none" // Smaller size and lighter color
          >
            Section Description
          </label>
        </div>

        <button
          className={`w-fit h-fit bg-appLayoutSubmitButton text-appBackground text-detailsPanelSaveButtonFontSize p-1 px-3 rounded-md shadow-md hover:bg-appLayoutInverseHover border border-appLayoutBorder transition-colors duration-200`}
          onClick={handleSave}
        >
          Save Details
        </button>
      </div>
    </div>
  );
};

export default SectionDetailsPanel;
