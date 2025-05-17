import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../../stores/appStore";

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

  console.log("NOTE PANEL STATES: ", notesPanelOpened, isNotesPanelAwake);

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
            width: `${360}px`,
            minWidth: `${360}px`,
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
          <div className="w-full h-full">NOTES PANEL</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
