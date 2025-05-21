import { Popover } from "@mantine/core";
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
          transition={{ type: "linear" }}
          className={`h-libraryManagerAddButtonSize min-h-libraryManagerAddButtonSize transition-colors duration-100 rounded-t-md
                    hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                    flex items-center justify-center
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

export const DetailsPanelButtonOnClick = ({
  exist,
  onClick,
  key,
  icon = (
    <motion.span
      animate={{
        opacity: 1,
      }}
      className={`icon-[material-symbols-light--check-rounded] ${"hover:text-appLayoutHighlight"} rounded-full w-full h-full`}
    ></motion.span>
  ),
  className
}) => {
  return (
    <AnimatePresence>
      {exist && (
        <motion.button
          type="button"
          key={key}
          initial={{
            width: 0,
            opacity: 0,
            padding: 0,
          }}
          animate={{
            width: "var(--detailsPanelSubmitButtonWidth)",
            padding: "0.15rem",
            opacity: 1,
          }}
          exit={{
            width: 0,
            opacity: 0,
            padding: 0,
          }}
          onClick={onClick}
          className={`h-libraryManagerAddButtonSize min-h-libraryManagerAddButtonSize transition-colors duration-100 rounded-t-md
                    hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                    flex items-center justify-center relative
                    ${className}
                    `}
        >
          {icon}
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export const PopOverTargetButton = ({ children }) => {
  return (
    <Popover.Target>
      <button
        className="h-libraryManagerAddButtonSize w-detailsPanelSubmitButtonWidth transition-colors duration-100 rounded-t-md
                       hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                       flex items-center justify-center relative"
      >
        {children}
      </button>
    </Popover.Target>
  );
};

export const DetailsPanelButtonPlaceHolder = ({ exist = true }) => {
  return (
    <AnimatePresence>
      {exist && (
        <motion.div
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
          transition={{ type: "linear" }}
          className={`h-libraryManagerAddButtonSize min-h-libraryManagerAddButtonSize transition-colors duration-100 rounded-t-md
                  
                    flex items-center justify-center
                    `}
        ></motion.div>
      )}
    </AnimatePresence>
  );
};
