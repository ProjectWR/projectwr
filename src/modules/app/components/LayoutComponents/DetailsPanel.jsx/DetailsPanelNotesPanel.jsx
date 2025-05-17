import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../../stores/appStore";
import { useCallback, useState } from "react";
import { max, min } from "lib0/math";

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
          <div className="w-full h-full relative">
            NOTES PANEL
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
