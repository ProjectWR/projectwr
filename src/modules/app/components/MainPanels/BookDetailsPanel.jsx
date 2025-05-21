import { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  DetailsPanelButtonPlaceHolder,
  DetailsPanelSubmitButton,
} from "../LayoutComponents/DetailsPanel/DetailsPanelSubmitButton";
import {
  DetailsPanelDescriptionProp,
  DetailsPanelStatusProp,
  DetailsPanelWordCountProp,
} from "../LayoutComponents/DetailsPanel/DetailsPanelProps";
import Tokenizr from "tokenizr";
import useRefreshableTimer from "../../hooks/useRefreshableTimer";
import { DetailsPanelNotesPanel } from "../LayoutComponents/DetailsPanel/DetailsPanelNotesPanel";
import { DetailsPanelButton } from "../LayoutComponents/DetailsPanel/DetailsPanelButton";

let lexer = new Tokenizr();

lexer.rule(/[a-zA-Z](?:[a-zA-Z0-9]|'(?=[a-zA-Z]))*/, (ctx, match) => {
  // Handles contractions like don't, couldn't, etc.
  ctx.accept("word", match[0]);
});

lexer.rule(/[+-]?[0-9]+/, (ctx, match) => {
  ctx.accept("number", parseInt(match[0]));
});

lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx, match) => {
  ctx.ignore(); // Comments
});

lexer.rule(/[ \t\r\n]+/, (ctx, match) => {
  ctx.ignore(); // Whitespace
});

lexer.rule(/./, (ctx, match) => {
  ctx.accept("char"); // Catch-all for punctuation
});

/**
 *
 * @param {{ytree: YTree, bookId: string}} param0
 * @returns
 */
const BookDetailsPanel = ({ ytree, bookId, libraryId }) => {
  console.log("library details panel rendering: ", bookId);

  const { deviceType } = useDeviceType();
  const isMd = appStore((state) => state.isMd);

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);

  const itemMapState = useYMap(ytree.getNodeValueFromKey(bookId));

  const [initialItemProperties, setInitialItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
    item_progress: itemMapState.item_properties.item_progress,
    item_goal: itemMapState.item_properties.item_goal,
  });

  const [itemProperties, setItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
    item_progress: itemMapState.item_properties.item_progress,
    item_goal: itemMapState.item_properties.item_goal,
  });

  useEffect(() => {
    setItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
      item_progress: itemMapState.item_properties.item_progress,
      item_goal: itemMapState.item_properties.item_goal,
    });

    setInitialItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
      item_progress: itemMapState.item_properties.item_progress,
      item_goal: itemMapState.item_properties.item_goal,
    });
  }, [bookId, itemMapState]);

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(itemProperties, initialItemProperties);
  }, [itemProperties, initialItemProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      item_goal: itemProperties.item_goal,
    });

    setPanelOpened(true);
  };

  const getWordCount = useCallback(() => {
    const allDescendantIds = [];
    ytree.getAllDescendants(bookId, allDescendantIds);

    let wordCount = 0;
    let charCount = 0;

    for (const id of allDescendantIds) {
      const item = ytree.getNodeValueFromKey(id);
      if (item?.get("type") === "paper") {
        const paperXmlDom = item.get("paper_xml").toDOM();
        const textNodes = [...paperXmlDom.childNodes];
        textNodes.forEach((node) => {
          lexer.input(node.textContent);

          wordCount += lexer
            .tokens()
            .filter((token) => token.text.length > 0).length;

          charCount += node.textContent.length;
        });
      }
    }

    return wordCount;
  }, [bookId, ytree]);

  const wordCount = getWordCount();

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

          <DetailsPanelButtonPlaceHolder exist={!unsavedChangesExist} />
        </DetailsPanelHeader>
        <DetailsPanelDivider />

        <DetailsPanelBody>
          <DetailsPanelProperties>
            <DetailsPanelWordCountProp
              currentWordCount={wordCount}
              itemProperties={itemProperties}
              onChange={handleChange}
            />
            <DetailsPanelStatusProp
              itemProperties={itemProperties}
              setItemProperties={setItemProperties}
            />
            <DetailsPanelDescriptionProp
              itemProperties={itemProperties}
              setItemProperties={setItemProperties}
            />
            {/* <div className="prop w-full h-fit relative">
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
          </div> */}
          </DetailsPanelProperties>
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default BookDetailsPanel;
