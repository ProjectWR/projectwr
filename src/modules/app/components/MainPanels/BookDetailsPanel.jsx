import { useEffect, useMemo, useRef, useState } from "react";
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
import { DetailsPanelStatusProp } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelProps";

/**
 *
 * @param {{ytree: YTree, bookId: string}} param0
 * @returns
 */
const BookDetailsPanel = ({ ytree, bookId }) => {
  console.log("library details panel rendering: ", bookId);

  const { deviceType } = useDeviceType();

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);

  const itemMapState = useYMap(ytree.getNodeValueFromKey(bookId));

  console.log("Library Props Map STATE: ", itemMapState);

  const [initialItemProperties, setInitialItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
    item_progress: itemMapState.item_properties.item_progress,
  });

  const [itemProperties, setItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
    item_progress: itemMapState.item_properties.item_progress,
  });

  useEffect(() => {
    setItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
      item_progress: itemMapState.item_properties.item_progress,
    });

    setInitialItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
      item_progress: itemMapState.item_properties.item_progress,
    });
  }, [bookId, itemMapState]);

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
    const bookMap = ytree.getNodeValueFromKey(bookId);

    bookMap.set("item_properties", {
      item_title: itemProperties.item_title,
      item_description: itemProperties.item_description,
      item_progress: itemProperties.item_progress,
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
        id="BookDetailsContent"
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
          <DetailsPanelStatusProp
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
          />
          <div className="prop w-full h-fit relative">
            <h2 className="w-full h-fit pt-2 px-3 border-t border-x border-appLayoutBorder rounded-t-md flex justify-start items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
              Book Description
            </h2>
            <Textarea
              maxRows={10}
              id="bookDescription"
              classNames={{
                root: "bg-appBackground h-fit  border-b border-x border-appLayoutBorder rounded-b-md overflow-hidden ",
                wrapper:
                  "bg-appBackground overflow-hidden text-detailsPanelPropsFontSize border-none focus:border-none w-full focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200",
                input:
                  "bg-appBackground px-3 pb-3 text-appLayoutText text-detailsPanelPropsFontSize font-serif min-h-[5rem] max-h-detailsPanelDescriptionInputHeight border-none focus:border-none overflow-y-auto",
              }}
              autosize
              name="item_description"
              placeholder="Enter Description"
              onChange={handleChange}
              value={itemProperties.item_description}
            />
          </div>
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default BookDetailsPanel;
