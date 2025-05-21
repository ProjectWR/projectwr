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
} from "../LayoutComponents/DetailsPanel/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel/DetailsPanelDivider";
import {
  DetailsPanelBody,
  DetailsPanelProperties,
} from "../LayoutComponents/DetailsPanel/DetailsPanelBody";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel/DetailsPanelNameInput";
import {
  DetailsPanelButtonOnClick,
  DetailsPanelSubmitButton,
} from "../LayoutComponents/DetailsPanel/DetailsPanelSubmitButton";
import useRefreshableTimer from "../../hooks/useRefreshableTimer";
import { DetailsPanelDescriptionProp } from "../LayoutComponents/DetailsPanel/DetailsPanelProps";
import { DetailsPanelNotesPanel } from "../LayoutComponents/DetailsPanel/DetailsPanelNotesPanel";

/**
 *
 * @param {{ytree: YTree, sectionId: string}} param0
 * @returns
 */
const SectionDetailsPanel = ({ ytree, sectionId, libraryId }) => {
  const { deviceType } = useDeviceType();
  const isMd = appStore((state) => state.isMd);

  console.log("library details panel rendering: ", sectionId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);

  const itemMapState = useYMap(ytree.getNodeValueFromKey(sectionId));

  console.log("Library Props Map STATE: ", itemMapState);

  const initialItemProperties = useRef({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
  });

  const [itemProperties, setItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
  });

  useEffect(() => {
    setItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
    });

    initialItemProperties.current = {
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
    };
  }, [sectionId, itemMapState]);

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(itemProperties, initialItemProperties.current);
  }, [itemProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setItemProperties({
      ...itemProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    const sectionMap = ytree.getNodeValueFromKey(sectionId);

    sectionMap.set("item_properties", {
      item_title: itemProperties.item_title,
      item_description: itemProperties.item_description,
    });

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
            value={itemProperties.item_title}
          />
          <DetailsPanelSubmitButton unsavedChangesExist={unsavedChangesExist} />
        </DetailsPanelHeader>
        <DetailsPanelDivider />
        <DetailsPanelBody>
          <DetailsPanelProperties>
            <DetailsPanelDescriptionProp
              itemProperties={itemProperties}
              setItemProperties={setItemProperties}
            />
          </DetailsPanelProperties>
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default SectionDetailsPanel;
