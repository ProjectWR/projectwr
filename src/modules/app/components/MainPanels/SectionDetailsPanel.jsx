import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import { equalityDeep } from "lib0/function";
import { Textarea } from "@mantine/core";
import DetailsPanel, {
  formClassName,
} from "../LayoutComponents/DetailsPanel.jsx/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelDivider";
import DetailsPanelBody from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelBody";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelNameInput";

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
    <DetailsPanel>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleSave();
        }}
        id="BookDetailsContainer"
        className={formClassName}
      >
        <DetailsPanelHeader>
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

          <DetailsPanelNameInput
            name="item_title"
            onChange={handleChange}
            value={sectionProperties.item_title}
          />
        </DetailsPanelHeader>
        <DetailsPanelDivider />
        <DetailsPanelBody>
          <div className="prop w-full h-fit relative">
            <Textarea
              maxRows={10}
              id="sectionDescription"
              classNames={{
                root: "bg-appBackground pt-detailsPanelPropLabelHeight h-fit  border border-appLayoutBorder rounded-md overflow-hidden ",
                wrapper:
                  "bg-appBackground overflow-hidden text-detailsPanelPropsFontSize border-none focus:border-none w-full focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200",
                input:
                  "bg-appBackground px-3 pb-3 text-appLayoutText text-detailsPanelPropsFontSize font-serif min-h-[5rem] max-h-detailsPanelDescriptionInputHeight border-none focus:border-none overflow-y-auto",
              }}
              autosize
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
                initial={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  padding: 0,
                }}
                animate={{
                  height: "var(--libraryManagerAddButtonSize) ",
                  opacity: 1,
                  marginTop: `0.25rem`,
                  marginBottom: 0,
                  padding: `0.25rem`,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  padding: 0,
                }}
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
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default SectionDetailsPanel;
