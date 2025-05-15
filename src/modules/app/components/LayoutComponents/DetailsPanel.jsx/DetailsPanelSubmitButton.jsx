import { AnimatePresence, motion } from "motion/react";

export const DetailsPanelSubmitButton = ({ unsavedChangesExist }) => {
  return (
    <AnimatePresence>
      {unsavedChangesExist && (
        <motion.button
          type="submit"
          initial={{
            width: 0,
            opacity: 0,
            paddingRight: 0,
            paddingLeft: 0,
            padding: 0,
          }}
          animate={{
            width: "var(--detailsPanelSubmitButtonWidth)",
            opacity: 1,
          }}
          exit={{
            width: 0,
            opacity: 0,
            paddingRight: 0,
            paddingLeft: 0,

            padding: 0,
          }}
          className={`h-libraryManagerAddButtonSize min-h-libraryManagerAddButtonSize transition-colors duration-100 rounded-t-md
                    hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                    flex items-center justify-center order-3
                    `}
        >
          <motion.span
            animate={{
              opacity: 1,
            }}
            className={`icon-[material-symbols-light--check-rounded] ${"hover:text-appLayoutHighlight"} rounded-full w-full h-full`}
          ></motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
