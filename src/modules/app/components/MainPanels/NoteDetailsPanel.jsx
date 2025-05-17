import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import { YTree } from "yjs-orderedtree";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { equalityDeep } from "lib0/function";
import { AnimatePresence, motion } from "motion/react";
import { Textarea } from "@mantine/core";
import DetailsPanel, {
  formClassName,
} from "../LayoutComponents/DetailsPanel.jsx/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelDivider";
import DetailsPanelBody from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelBody";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelNameInput";
import { DetailsPanelSubmitButton } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelSubmitButton";
import { DetailsPanelDescriptionProp } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelProps";

/**
 *
 * @param {{ytree: YTree, noteId: string}} param0
 * @returns
 */
const NoteDetailsPanel = ({ ytree, noteId, libraryId }) => {
  console.log("library details panel rendering: ", noteId);

  const { deviceType } = useDeviceType();

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);

  const itemMapState = useYMap(ytree.getNodeValueFromKey(noteId));

  console.log("Library Props Map STATE: ", itemMapState);

  const [initialItemProperties, setInitialItemProperties] = useState({
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

    setInitialItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
    });
  }, [noteId, itemMapState]);

  const unsavedChangesExist = useMemo(() => {
    console.log("CURRENTA ND INITIAL: ", itemProperties, initialItemProperties);
    return !equalityDeep(itemProperties, initialItemProperties);
  }, [itemProperties, initialItemProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setItemProperties({
      ...itemProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    const itemMap = ytree.getNodeValueFromKey(noteId);

    itemMap.set("item_properties", {
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
        id="NoteDetailsContent"
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
          <DetailsPanelDescriptionProp
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            label={"Note"}
          />
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default NoteDetailsPanel;
