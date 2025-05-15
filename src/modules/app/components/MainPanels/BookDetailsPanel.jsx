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

  const bookMapState = useYMap(ytree.getNodeValueFromKey(bookId));

  console.log("Library Props Map STATE: ", bookMapState);

  const [initialBookProperties, setInitialBookProperties] = useState({
    item_title: bookMapState.item_properties.item_title,
    book_description: bookMapState.item_properties.item_description,
  });

  const [bookProperties, setBookProperties] = useState({
    item_title: bookMapState.item_properties.item_title,
    book_description: bookMapState.item_properties.item_description,
  });

  useEffect(() => {
    setBookProperties({
      item_title: bookMapState.item_properties.item_title,
      book_description: bookMapState.item_properties.item_description,
    });

    setInitialBookProperties({
      item_title: bookMapState.item_properties.item_title,
      book_description: bookMapState.item_properties.item_description,
    });
  }, [bookId, bookMapState]);

  const unsavedChangesExist = useMemo(() => {
    console.log("CURRENTA ND INITIAL: ", bookProperties, initialBookProperties);
    return !equalityDeep(bookProperties, initialBookProperties);
  }, [bookProperties, initialBookProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setBookProperties({
      ...bookProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    const bookMap = ytree.getNodeValueFromKey(bookId);

    bookMap.set("item_properties", {
      item_title: bookProperties.item_title,
      item_description: bookProperties.book_description,
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
            value={bookProperties.item_title}
          />
          <DetailsPanelSubmitButton unsavedChangesExist={unsavedChangesExist} />
        </DetailsPanelHeader>
        <DetailsPanelDivider />
        <DetailsPanelBody>
          <div className="prop w-full h-fit relative">
            <Textarea
              maxRows={10}
              id="bookDescription"
              classNames={{
                root: "bg-appBackground pt-detailsPanelPropLabelHeight h-fit  border border-appLayoutBorder rounded-md overflow-hidden ",
                wrapper:
                  "bg-appBackground overflow-hidden text-detailsPanelPropsFontSize border-none focus:border-none w-full focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200",
                input:
                  "bg-appBackground px-3 pb-3 text-appLayoutText text-detailsPanelPropsFontSize font-serif min-h-[5rem] max-h-detailsPanelDescriptionInputHeight border-none focus:border-none overflow-y-auto",
              }}
              autosize
              name="book_description"
              placeholder="Enter Description"
              onChange={handleChange}
              value={bookProperties.book_description}
            />

            <label
              htmlFor="libraryDescription"
              className="absolute top-2 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none" // Smaller size and lighter color
            >
              Book Description
            </label>
          </div>
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default BookDetailsPanel;
