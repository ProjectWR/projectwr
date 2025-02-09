import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import { libraryStore } from "../../stores/libraryStore";
import { YTree } from "yjs-orderedtree";
import { appStore } from "../../stores/appStore";

/**
 *
 * @param {{ytree: YTree, bookId: string}} param0
 * @returns
 */
const BookDetailsPanel = ({ ytree, bookId }) => {
  console.log("library details panel rendering: ", bookId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = libraryStore((state) => state.setItemId);

  const bookMapState = useYMap(ytree.getNodeValueFromKey(bookId));

  console.log("Library Props Map STATE: ", bookMapState);

  const [bookProperties, setBookProperties] = useState({
    item_title: "",
    book_description: "",
  });

  useEffect(() => {
    setBookProperties({
      item_title: bookMapState.item_title,
      book_description: bookMapState.book_description,
    });
  }, [bookId, bookMapState]);

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

    bookMap.set("item_title", bookProperties.item_title);
    bookMap.set("book_description", bookProperties.book_description);
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
          value={bookProperties.item_title}
        />
      </div>

      <div
        id="CreateLibraryBody"
        className="flex-grow w-full flex flex-col items-end justify-start border-b border-appLayoutBorder py-3 gap-3 px-4"
      >
        <div className="prop w-full h-detailsPanelDescriptionInputSize relative resize-none">
          <textarea
            id="libraryDescription"
            className="resize-none bg-appBackground w-full h-full border border-appLayoutBorder px-3 pt-detailsPanelPropLabelHeight rounded-md  focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200"
            name="book_description"
            onChange={handleChange}
            value={bookProperties.book_description}
          />

          <label
            htmlFor="libraryDescription"
            className="absolute top-1 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none" // Smaller size and lighter color
          >
            Book Description
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

export default BookDetailsPanel;
