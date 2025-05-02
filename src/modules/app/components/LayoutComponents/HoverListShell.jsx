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
          className="absolute top-[100%] pt-1 px-1 h-fit w-full bg-appBackground rounded-md z-1000 border border-appLayoutInverseHover overflow-hidden shadow-2xl shadow-appLayoutGentleShadow flex items-center flex-col"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
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

export const HoverListFooter = () => {
  return (
    <div className="w-full px-2 h-actionBarSearchFooterHeight text-actionBarResultHeaderTextSize flex items-center"></div>
  );
};
