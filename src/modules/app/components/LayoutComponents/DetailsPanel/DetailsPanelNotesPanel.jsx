import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../../stores/appStore";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
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
  isNotesPanelAwake,
  refreshNotesPanel,
  keepNotesPanelAwake,
}) => {
  const isMd = appStore((state) => state.isMd);
  const zoom = appStore((state) => state.zoom);

  const [notesPanelWidth, setNotesPanelWidth] = useState(360);

  const [sortedNoteIds, setSortedNoteIds] = useState();

  const handleDrag = useCallback(
    (event, info) => {
      const rect = document
        .getElementById("NotesPanelMotionContainer")
        ?.getBoundingClientRect();

      const rectBody = document
        .getElementById("DetailsPanelBody")
        ?.getBoundingClientRect();

      if (!rect || !rectBody) return;

      let newWidth = info.point.x - rect.left;

      const MIN_WIDTH = 0.77 * zoom * 360;
      const MAX_WIDTH = 0.45 * rectBody.width;

      console.log("MIN AND MAX WIDTH: ", MIN_WIDTH, MAX_WIDTH);

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
    <AnimatePresence mode="wait">
      {notesPanelOpened && (isMd || isNotesPanelAwake) && (
        <motion.div
          key="NotesPanelMotionContainer"
          id="NotesPanelMotionContainer"
          className={`h-full border-r border-appLayoutBorder z-5 bg-appBackgroundAccent ${
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
          transition={{ duration: 0.05 }}
          onHoverStart={() => {
            keepNotesPanelAwake();
          }}
          onHoverEnd={() => {
            refreshNotesPanel();
          }}
        >
          <div className="w-full h-full @container flex flex-col relative">
            <div className="w-full h-fit text-notesPanelHeaderFontSize text-appLayoutTextMuted flex items-center justify-start px-3 py-1">
              Notes
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
              className="absolute h-full w-[6px] top-0 -right-[6px] z-50 hover:bg-sidePanelDragHandle cursor-w-resize"
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

