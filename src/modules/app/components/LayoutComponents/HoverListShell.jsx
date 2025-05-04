import { motion, AnimatePresence } from "motion/react";

export const HoverListShell = ({ children, condition }) => {
  return (
    <AnimatePresence mode="sync">
      {condition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`
            absolute top-[100%] left-1/2 -translate-x-1/2 w-full h-fit min-w-actionBarSearchWidth shadow-2xl shadow-appLayoutGentleShadow z-1000 pt-1 px-1 border border-appLayoutInverseHover
           bg-appBackgroundAccent/95 backdrop-blur-[1px] rounded-md  overflow-hidden flex items-center flex-col`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ListShell = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={` bg-appBackground/95 backdrop-blur-[1px] rounded-md  overflow-hidden flex items-center flex-col pt-1 px-1 border border-appLayoutBorder ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const HoverListHeader = ({ children }) => {
  return (
    <div
      style={{
        paddingLeft: `var(--scrollbarWidth)`,
        paddingRight: `var(--scrollbarWidth)`,
      }}
      className="w-full h-actionBarSearchHeaderHeight text-actionBarResultHeaderTextSize text-appLayoutTextMuted flex items-center"
    >
      {children}
    </div>
  );
};

export const HoverListDivider = () => {
  return <div className="w-[98.5%] h-px shrink-0 bg-appLayoutBorder"></div>;
};

export const HoverListBody = ({ children }) => {
  return (
    <div
      style={{
        paddingLeft: `var(--scrollbarWidth)`,
      }}
      className="w-full max-h-actionBarSearchMaxHeight overflow-y-scroll text-actionBarResultTextSize flex flex-col py-1"
    >
      {children}
    </div>
  );
};

export const HoverListItem = ({ children, disabled }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      style={{
        paddingTop: `var(--scrollbarWidth)`,
        paddingBottom: `var(--scrollbarWidth)`,
      }}
      className={`px-3 h-actionBarResultNodeHeight w-full hover:bg-appLayoutInverseHover ${
        disabled && "hover:bg-transparent text-appLayoutTextMuted"
      } rounded-md `}
    >
      {children}
    </motion.div>
  );
};

export const HoverListButton = ({ children, disabled, onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      style={{
        paddingTop: `var(--scrollbarWidth)`,
        paddingBottom: `var(--scrollbarWidth)`,
      }}
      className={`px-3 h-actionBarResultNodeHeight w-full hover:bg-appLayoutInverseHover ${
        disabled && "hover:bg-transparent text-appLayoutTextMuted"
      } rounded-md flex items-center justify-between `}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export const HoverListFooter = () => {
  return (
    <div className="w-full px-2 h-actionBarSearchFooterHeight text-actionBarResultHeaderTextSize flex items-center"></div>
  );
};
