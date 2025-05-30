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
import { checkForYTree, YTree } from "yjs-orderedtree";
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
import { mainPanelStore } from "../../../stores/mainPanelStore";
import useOuterClick from "../../../../design-system/useOuterClick";
import useRefreshableTimer from "../../../hooks/useRefreshableTimer";

const lazyWithPrefetch = (factory) => {
  factory();
  return lazy(factory);
};

const NoteCard = lazyWithPrefetch(() => import("./NoteCard"));

/**
 *
 * @param {{ytree: YTree, itemId: string, libraryId: string, notesPanelOpened: Function, isNotesPanelAwake: boolean, refreshNotesPanel: Function, keepNotesPanelAwake: Function}} param0
 * @returns
 */
export const DetailsPanelNotesPanel = ({}) => {
  const isMd = appStore((state) => state.isMd);
  const zoom = appStore((state) => state.zoom);

  const [isNotesPanelAwake, refreshNotesPanel, keepNotesPanelAwake] =
    useRefreshableTimer({ time: 1000 });

  const notesPanelOpened = appStore((state) => state.notesPanelOpened);
  const notesPanelWidth = appStore((state) => state.notesPanelWidth);
  const setNotesPanelWidth = appStore((state) => state.setNotesPanelWidth);

  const [notesPanelSliderPos, setNotesPanelSliderPos] =
    useState(notesPanelWidth);
  const [notesPanelSliderActive, setNotesPanelSliderActive] = useState(false);

  const notesPanelState = appStore((state) => state.notesPanelState);

  const { libraryId, itemId } = notesPanelState;

  const mainPanelState = mainPanelStore((state) => state.mainPanelState);

  const { panelType } = mainPanelState;

  const [error, setError] = useState(null);

  const [ytree, setYtree] = useState(null);

  useEffect(() => {
    try {
      if (libraryId && dataManagerSubdocs.getLibrary(libraryId)) {
        if (
          !checkForYTree(
            dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
          )
        ) {
          throw new Error("ytree doesn't already exist");
        }

        setYtree(
          new YTree(
            dataManagerSubdocs.getLibrary(libraryId).getMap("library_directory")
          )
        );

        setError(null);
        return () => {};
      } else {
        throw new Error("library not found locally");
      }
    } catch (e) {
      setError("Something went wrong");
      return () => {};
    }
  }, [libraryId]);

  const handleDrag = useCallback(
    (event, info) => {
      const rect = document
        .getElementById("NotesPanelMotionContainer")
        ?.getBoundingClientRect();

      if (!rect) return;

      let newWidth = rect.right - info.point.x;

      const MIN_WIDTH = zoom * 284.8;
      const MAX_WIDTH = 2 * zoom * 360 + zoom * 44.8;

      newWidth = min(MAX_WIDTH, max(MIN_WIDTH, newWidth));

      setNotesPanelSliderPos(newWidth);
      setNotesPanelSliderActive(true);
    },
    [setNotesPanelSliderPos, setNotesPanelSliderActive, zoom]
  );

  const handleDragEnd = useCallback(
    (event, info) => {
      const rect = document
        .getElementById("NotesPanelMotionContainer")
        ?.getBoundingClientRect();

      if (!rect) return;

      let newWidth = rect.right - info.point.x;

      const MIN_WIDTH = zoom * 284.8;
      const MAX_WIDTH = 2 * zoom * 360 + zoom * 44.8;

      newWidth = min(MAX_WIDTH, max(MIN_WIDTH, newWidth));

      setNotesPanelWidth(newWidth);
      setNotesPanelSliderPos(newWidth);
      setNotesPanelSliderActive(false);
    },
    [
      setNotesPanelWidth,
      setNotesPanelSliderPos,
      setNotesPanelSliderActive,
      zoom,
    ]
  );

  useEffect(() => {
    const rect = document
      .getElementById("NotesPanelMotionContainer")
      ?.getBoundingClientRect();

    if (!rect) return;

    let newWidth = rect.right - rect.left;

    const MIN_WIDTH = zoom * 284.8;
    const MAX_WIDTH = 2 * zoom * 360 + zoom * 44.8;

    newWidth = min(MAX_WIDTH, max(MIN_WIDTH, newWidth));

    setNotesPanelWidth(newWidth);
  }, [setNotesPanelWidth, zoom]);

  useEffect(() => {
    if (!isMd) refreshNotesPanel();
  }, [isMd, refreshNotesPanel]);

  return (
    <div id="NotesPanelContainer" className="h-full w-fit">
      <AnimatePresence mode="wait">
        {panelType === "libraries" &&
          notesPanelOpened &&
          (isMd || isNotesPanelAwake) && (
            <motion.div
              key={`NotesPanelMotionContainer-${libraryId}`}
              id="NotesPanelMotionContainer"
              className={`h-full border-l border-appLayoutBorder z-5 bg-appBackgroundAccent ${
                !isMd &&
                "absolute top-0 right-0 bg-appBackgroundAccent/95 backdrop-blur-[1px]"
              } `}
              initial={{
                opacity: 0,
                width: 0,
                minWidth: 0,
                transition: { duration: 0.05 },
              }}
              animate={{
                opacity: 1,
                width: `${notesPanelWidth}px`,
                minWidth: `${notesPanelWidth}px`,
                transition: { duration: 0.05 },
              }}
              exit={{
                opacity: 0,
                width: 0,
                minWidth: 0,
                transition: { duration: 0.05 },
              }}
              transition={{ duration: 0.1 }}
              onHoverStart={() => {
                keepNotesPanelAwake();
              }}
              onHoverEnd={() => {
                refreshNotesPanel();
              }}
            >
              <div className="w-full h-full @container flex flex-col relative">
                {error}

                {!error && libraryId && itemId && ytree ? (
                  <NotesContent
                    libraryId={libraryId}
                    itemId={itemId}
                    ytree={ytree}
                  />
                ) : (
                  <div className="w-full h-full"> No Library item opened </div>
                )}

                <motion.div
                  className={`absolute h-full w-[6px] top-0 z-[50] hover:bg-sidePanelDragHandle ${
                    notesPanelSliderActive
                      ? "bg-sidePanelDragHandle"
                      : "bg-transparent"
                  } cursor-w-resize`}
                  drag="x"
                  style={{
                    right: `${notesPanelSliderPos}px`,
                  }}
                  dragConstraints={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  dragElastic={0}
                  dragMomentum={false}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                ></motion.div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

const NotesContent = ({ libraryId, itemId, ytree }) => {
  const [searchOpened, setSearchOpened] = useState(false);

  const searchRef = useOuterClick(() => {
    setSearchOpened(false);
  });

  const [sortedNoteIds, setSortedNoteIds] = useState([]);

  const setNotesPanelState = appStore((state) => state.setNotesPanelState);

  const itemMapState = useYMap(
    itemId === "root"
      ? dataManagerSubdocs.getLibrary(libraryId).getMap("library_props")
      : ytree.getNodeValueFromKey(itemId)
  );

  const [headerText, setHeaderText] = useState(
    itemMapState.item_properties.item_title
  );

  useEffect(() => {
    const updateSortedNoteIds = () => {
      let sortedChildren = [];

      try {
        sortedChildren = ytree.sortChildrenByOrder(
          ytree.getNodeChildrenFromKey(itemId),
          itemId
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
  }, [libraryId, itemId, ytree]);

  return (
    <>
      <div className="w-full h-fit text-notesPanelHeaderFontSize text-appLayoutTextMuted flex items-center justify-start px-2 py-2">
        <div
          ref={searchRef}
          className="w-full relative h-fit flex items-center"
        >
          <input
            onFocus={() => {
              setSearchOpened(true);
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
            visible={searchOpened}
            onClick={(result, itemTitle) => {
              console.log("RESULT: ", result);
              if (result.id === result.libraryId) {
                setNotesPanelState({
                  libraryId: result.libraryId,
                  itemId: "root",
                });
              } else {
                setNotesPanelState({
                  libraryId: result.libraryId,
                  itemId: result.id,
                });
              }

              setSearchOpened(false);

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
    </>
  );
};

const SortedNotes = ({ sortedNoteIds, libraryId, ytree }) => {
  return (
    <>
      {sortedNoteIds &&
        sortedNoteIds.map((noteId) => (
          <NoteCard
            key={noteId}
            noteId={noteId}
            libraryId={libraryId}
            ytree={ytree}
          />
        ))}
    </>
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
            (result.type === "book" ||
              result.type === "section" ||
              result.id === result.libraryId) &&
            result.libraryId === libraryId
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
