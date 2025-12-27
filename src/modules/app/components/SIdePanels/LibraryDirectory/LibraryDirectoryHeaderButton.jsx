import React, { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import { AnimatePresence, motion } from "motion/react";
import {
  getNextOrderIndex,
  getPreviousOrderIndex,
  insertBetween,
} from "../../../utils/orderUtil";
import dataManagerSubdocs, {
  getArrayFromYDocMap,
} from "../../../lib/dataSubDoc";
import ContextMenuWrapper from "../../LayoutComponents/ContextMenuWrapper";
import persistenceManagerForSubdocs from "../../../lib/persistenceSubDocs";

const LibraryDirectoryHeaderButton = ({
  libraryId,
  props,
  onSelect,
  onHover,
  isHovered,
}) => {
  const ref = useRef(null);

  const [isTopSelected, setIsTopSelected] = useState(false);
  const [isSelfSelected, setIsSelfSelected] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "LIBRARY",
    item: {
      id: libraryId,
      type: "library",
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "LIBRARY",
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }

      if (draggedItem.id === libraryId) {
        setIsSelfSelected(true);
        return;
      }

      setIsSelfSelected(false);

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (hoverClientY < hoverMiddleY) {
        setIsTopSelected(true);
      } else {
        setIsTopSelected(false);
      }
    },
    drop: (draggedItem, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }

      console.log("ITEM DROPPED: ", draggedItem);

      if (draggedItem.id === libraryId) {
        setIsSelfSelected(true);
        return;
      }

      setIsSelfSelected(false);

      if (draggedItem.type !== "library") return;

      const libraryPropsMapRef = dataManagerSubdocs
        .getLibrary(libraryId)
        .getMap("library_props");

      console.log("SETTING POSITION: ");
      if (isTopSelected) {
        const previousOrderIndex = getPreviousOrderIndex(
          libraryId,
          getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap)
        );

        const orderIndex = insertBetween(
          previousOrderIndex,
          libraryPropsMapRef.get("order_index")
        );

        dataManagerSubdocs
          .getLibrary(draggedItem.id)
          .getMap("library_props")
          .set("order_index", orderIndex);
      }

      if (!isTopSelected) {
        const nextOrderIndex = getNextOrderIndex(
          libraryId,
          getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap)
        );

        const orderIndex = insertBetween(
          libraryPropsMapRef.get("order_index"),
          nextOrderIndex
        );

        dataManagerSubdocs
          .getLibrary(draggedItem.id)
          .getMap("library_props")
          .set("order_index", orderIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  drag(drop(ref));

  const options = useMemo(() => {
    return [
      {
        label: "Edit",
        icon: (
          <span className="icon-[ion--enter-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          onSelect(libraryId);
        },
      },
      {
        label: "Save as archive",
        icon: (
          <span className="icon-[ph--download-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          await persistenceManagerForSubdocs.saveArchive(
            dataManagerSubdocs.getLibrary(libraryId)
          );
        }
      },
      {
        label: "Load from archive",
        icon: (
          <span className="icon-[ph--upload-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          await persistenceManagerForSubdocs.loadArchive(
            dataManagerSubdocs.getLibrary(libraryId)
          );
        }
      },
      {
        label: "Delete",
        icon: (
          <span className="icon-[mdi--delete-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: () => {
          dataManagerSubdocs.destroyLibrary(libraryId);
        },
      },
    ];
  }, []);

  return (
    <ContextMenuWrapper triggerClassname="w-full h-fit" options={options}>
      <div
        ref={ref}
        id="DirectoryItemNodeContainer"
        className={`w-full h-fit
        ${isDragging ? "opacity-20" : ""}
        
        ${(() => {
            if (!isSelfSelected && isOverCurrent) {
              return isTopSelected
                ? "border-t border-b border-b-transparent border-t-appLayoutDirectoryNodeHover"
                : "border-b border-t border-t-transparent border-b-appLayoutDirectoryNodeHover";
            } else {
              return "border-y border-transparent";
            }
          })()}
      `}
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onMouseEnter={() => onHover(libraryId)}
            onMouseLeave={() => onHover(null)}
            transition={{ duration: 0.05 }}
            key={libraryId}
            className="text-libraryManagerHeaderText h-libraryDirectoryBookNodeHeight px-2 text-appLayoutTextMuted hover:text-appLayoutHighlight w-full flex items-center gap-1 justify-center hover:bg-appLayoutHover transition-colors duration-100 group cursor-pointer"
            onClick={() => onSelect(libraryId)}
          >
            <motion.div
              animate={{
                width: isHovered ? "fit-content" : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.1 }}
              className="h-full w-fit flex items-center justify-center"
            >
              <span className="icon-[formkit--right] w-libraryDirectorySectionNodeIconSize h-libraryDirectorySectionNodeIconSize overflow-hidden"></span>
            </motion.div>
            <span className="w-fit whitespace-nowrap text-nowrap overflow-x-hidden text-ellipsis">{props.item_properties.item_title}</span>
            <motion.div
              animate={{
                width: isHovered ? "fit-content" : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.1 }}
              className="h-full w-fit flex items-center justify-center"
            >
              <span className="icon-[formkit--left] w-libraryDirectorySectionNodeIconSize h-libraryDirectorySectionNodeIconSize overflow-hidden"></span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </ContextMenuWrapper>
  );
};

LibraryDirectoryHeaderButton.propTypes = {
  libraryId: PropTypes.string.isRequired,
  props: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onHover: PropTypes.func.isRequired,
  isHovered: PropTypes.bool.isRequired,
};

export default React.memo(LibraryDirectoryHeaderButton);
