import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../../stores/appStore";
import {
  lazy,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { max, min } from "lib0/math";
import { YTree } from "yjs-orderedtree";
import useYMap from "../../../hooks/useYMap";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { equalityDeep } from "lib0/function";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, FloatingMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RichTextEditor } from "@mantine/tiptap";
import ProsemirrorProofreadExtension from "../../../../editor/TipTapEditor/Extensions/ProsemirrorProofreadExtension";
import ContextMenuWrapper from "../ContextMenuWrapper";
import { ScrollArea } from "@mantine/core";
import { queryData } from "../../../lib/search";
import {
  HoverListBody,
  HoverListButton,
  HoverListDivider,
  HoverListFooter,
  HoverListHeader,
  HoverListItem,
  HoverListShell,
} from "../HoverListShell";
import dataManagerSubdocs from "../../../lib/dataSubDoc";
import { useDebouncedCallback } from "use-debounce";

// import SortedNotes from "./SortedNotes";

const SortedNotes = lazy(() => import("./SortedNotes"));

/**
 *
 * @param {{ytree: YTree, itemId: string, libraryId: string, notesPanelOpened: Function, isNotesPanelAwake: boolean, refreshNotesPanel: Function, keepNotesPanelAwake: Function}} param0
 * @returns
 */
export const DetailsPanelNotesPanel = ({
  libraryId,
  itemId,
  ytree,
  notesPanelOpened,
  notesPanelWidth,
  setNotesPanelWidth,
  isNotesPanelAwake,
  refreshNotesPanel,
  keepNotesPanelAwake,
}) => {
  const isMd = appStore((state) => state.isMd);
  const zoom = appStore((state) => state.zoom);

  const headerInputRef = useRef();

  const [sortedNoteIds, setSortedNoteIds] = useState([]);

  const [scopedItemId, setScopedItemId] = useState(
    libraryId === itemId ? "root" : itemId
  );

  const itemMapState = useYMap(
    libraryId === itemId
      ? dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
      : ytree.getNodeValueFromKey(scopedItemId)
  );

  const [headerText, setHeaderText] = useState(
    itemMapState.item_properties.item_title
  );

  const [headerFocused, setHeaderFocused] = useState(false);

  const handleDrag = useCallback(
    (event, info) => {
      const rect = document
        .getElementById("NotesPanelMotionContainer")
        ?.getBoundingClientRect();

      const rectBody = document
        .getElementById("DetailsPanelBody")
        ?.getBoundingClientRect();

      if (!rect || !rectBody) return;

      let newWidth = rect.right - info.point.x;

      const MIN_WIDTH = 0.77 * zoom * 360;
      const MAX_WIDTH = 0.45 * rectBody.width;


      newWidth = min(MAX_WIDTH, max(MIN_WIDTH, newWidth));

      setNotesPanelWidth(newWidth);
    },
    [setNotesPanelWidth, zoom]
  );

  useEffect(() => {
    const updateSortedNoteIds = () => {
      let sortedChildren = [];

      try {
        sortedChildren = ytree.sortChildrenByOrder(
          ytree.getNodeChildrenFromKey(scopedItemId),
          scopedItemId
        );
      } catch (e) {
        console.error("Error fetching Note IDs in Notes Panel: ", e);
      }

      setSortedNoteIds(sortedChildren);
    };

    ytree.observe(updateSortedNoteIds);

    updateSortedNoteIds();

    return () => {
      ytree.unobserve(updateSortedNoteIds);
    };
  }, [libraryId, scopedItemId, ytree]);

  // useEffect(() => {
  //   const input = headerInputRef.current;
  //   if (input) {
  //     const handleKeyDown = (e) => {
  //       if (e.key === "Enter") {
  //         input.blur();
  //       }
  //     };

  //     input.addEventListener("keydown", handleKeyDown);

  //     return () => {
  //       input.removeEventListener("keydown", handleKeyDown);
  //     };
  //   }
  // }, [headerFocused]);

  return (
    <AnimatePresence mode="wait">
      {notesPanelOpened && (isMd || isNotesPanelAwake) && (
        <motion.div
          key={`NotesPanelMotionContainer-${itemId}`}
          id="NotesPanelMotionContainer"
          className={`h-full border-l border-appLayoutBorder z-5 bg-appBackgroundAccent ${
            !isMd &&
            "absolute top-0 left-0 bg-appBackgroundAccent/95 backdrop-blur-[1px]"
          } `}
          initial={{ opacity: 0, width: 0, minWidth: 0 }}
          animate={{
            opacity: 1,
            width: `${notesPanelWidth}px`,
            minWidth: `${notesPanelWidth}px`,
          }}
          exit={{ opacity: 0, width: 0, minWidth: 0 }}
          transition={{ duration: 0.1 }}
          onHoverStart={() => {
            keepNotesPanelAwake();
          }}
          onHoverEnd={() => {
            refreshNotesPanel();
          }}
        >
          <div className="w-full h-full @container flex flex-col relative">
            <div className="w-full h-fit text-notesPanelHeaderFontSize text-appLayoutTextMuted flex items-center justify-start px-2 py-2">
              <div className="w-full relative h-fit flex items-center">
                <input
                  ref={headerInputRef}
                  onFocus={() => {
                    setHeaderFocused(true);
                  }}
                  onBlur={() => {
                    setHeaderFocused(false);
                  }}
                  className="w-full h-fit text-notesPanelHeaderFontSize text-appLayoutTextMuted bg-appBackground focus:bg-appLayoutInputBackground focus:text-appLayoutText focus:outline-0 flex items-center justify-start px-2 rounded-md"
                  value={headerText}
                  onChange={(e) => {
                    setHeaderText(e.target.value);
                  }}
                />
                <SearchResults
                  key={"NoteScopeInputResults"}
                  input={headerText}
                  libraryId={libraryId}
                  visible={headerFocused}
                  onClick={(result, itemTitle) => {
                    setScopedItemId(result.id);
                    setHeaderText(itemTitle);
                  }}
                />
              </div>
            </div>
            <div className="divider w-full px-2">
              <div className="w-full h-px bg-appLayoutBorder"></div>
            </div>
            <ScrollArea
              overscrollBehavior="none"
              scrollbars="y"
              type="hover"
              classNames={{
                root: `grow p-3 basis-0 w-full`,
                scrollbar: `bg-transparent hover:bg-transparent p-0 w-scrollbarWidthThin z-[5] opacity-70`,
                thumb: `bg-appLayoutBorder rounded-t-full hover:bg-appLayoutInverseHover`,
                content: "h-fit w-full grid grid-cols-1 auto-rows-max gap-3 ",
              }}
            >
              <Suspense fallback={<div>Loading</div>}>
                <SortedNotes
                  sortedNoteIds={sortedNoteIds}
                  ytree={ytree}
                  libraryId={libraryId}
                />
              </Suspense>
            </ScrollArea>
            <motion.div
              className="absolute h-full w-[6px] top-0 left-0 z-50 hover:bg-sidePanelDragHandle cursor-w-resize"
              drag="x"
              dragConstraints={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              dragElastic={0}
              dragMomentum={false}
              onDrag={handleDrag}
            ></motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SearchResults = ({
  libraryId,
  input = "",
  onClick = () => {},
  visible = false,
}) => {
  const [searchResults, setSearchResults] = useState([]);

  const debouncedSearch = useDebouncedCallback(() => {
    if (input.length > 0) {
      setSearchResults(
        queryData(input).filter(
          (result) =>
            result.libraryId === libraryId &&
            (result.type === "book" || result.type === "section")
        )
      );
    } else {
      setSearchResults([]);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch();
  }, [input, libraryId, debouncedSearch]);


  return (
    <HoverListShell className={"min-w-0"} condition={visible}>
      <HoverListHeader>
        <span>
          {" "}
          {searchResults.length}{" "}
          {searchResults.length === 1 ? "result" : "results"} in your library
        </span>
      </HoverListHeader>
      <HoverListDivider />
      <HoverListBody>
        {searchResults.length > 0 &&
          searchResults.map((result) => {
            const item_properties =
              result.id === result.libraryId
                ? dataManagerSubdocs
                    .getLibrary(result.libraryId)
                    .getMap("library_props")
                    .get("item_properties")
                : dataManagerSubdocs
                    .getLibrary(result.libraryId)
                    .getMap("library_directory")
                    .get(result.id)
                    .get("value")
                    .get("item_properties");

            return (
              <HoverListButton
                key={result.id}
                onClick={() => {
                  onClick(result, item_properties.item_title);
                }}
              >
                <span> {item_properties.item_title}</span>
              </HoverListButton>
            );
          })}

        {searchResults.length === 0 && (
          <HoverListItem disabled={true}>
            <div className="w-full h-full flex items-center">
              No results found
            </div>
          </HoverListItem>
        )}
      </HoverListBody>
      <HoverListDivider />
      <HoverListFooter />
    </HoverListShell>
  );
};
