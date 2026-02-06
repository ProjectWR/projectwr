import { ScrollArea } from "@mantine/core";
import { motion, AnimatePresence } from "motion/react";

export const HoverListShell = ({ children, condition, className }) => {
  return (
    <AnimatePresence mode="sync">
      {condition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`
            absolute top-[100%] left-1/2 -translate-x-1/2 w-full h-fit shadow-lg shadow-appLayoutGentleShadow z-1000 pt-1 px-1 border border-appLayoutInverseHover
           bg-appBackgroundAccent/95 backdrop-blur-[1px] rounded-md  overflow-hidden flex items-center flex-col ${className}`}
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

export const HoverListHeader = ({ children, className }) => {
  return (
    <div className="contextMenuItem text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted hover:bg-transparent!">
      {children}
    </div>
  );
};

export const HoverListInteractiveHeader = ({
  children,
  className,
  disabled = false,
}) => {
  return (
    <div className="contextMenuItem text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted hover:bg-transparent! py-1">
      {children}
    </div>
  );
};

export const HoverListDivider = () => {
  return <div className="w-[98.5%] h-px shrink-0 bg-appLayoutBorder"></div>;
};

export const HoverListBody = ({
  children,
  scrollPadding = true,
  className,
}) => {
  return (
    <ScrollArea
      data-tauri-drag-region
      classNames={{
        root: "h-fit min-h-0 w-full",
        scrollbar: `bg-transparent hover:bg-transparent p-0 w-scrollbarWidthThin z-[5]`,
        thumb: `bg-appLayoutBorder rounded-l-full hover:!bg-appLayoutInverseHover opacity-70`,
        content: `text-libraryDirectoryBookNodeFontSize w-full flex flex-col py-1`,
      }}
    >
      {children}
    </ScrollArea>
  );
};

export const HoverListItem = ({ children, disabled }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="contextMenuItem"
    >
      {children}
    </motion.div>
  );
};

export const HoverListButton = ({ children, disabled, onClick, className }) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="contextMenuItem text-nowrap overflow-ellipsis overflow-x-hidden text-left w-full"
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
