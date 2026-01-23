import React, { useCallback, useMemo, useRef, useState } from "react";
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
import DialogWrapper from "../../LayoutComponents/DialogWrapper";
import driveOrchestrator from "../../../lib/drive/driveOrchestrator";
import { oauthStore } from "../../../stores/oauthStore";
import { appStore } from "../../../stores/appStore";

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
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const driveSyncLoading = appStore((state) => state.driveSyncLoading);

  const userProfile = oauthStore((state) => state.userProfile);

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    libraryId: null,
    libraryTitle: null,
  });

  const [deleteFromDrive, setDeleteFromDrive] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: {
      id: libraryId,
      type: "library",
      appItemType: "libraries",
      tabProps: {
        panelType: "libraries",
        mode: "details",
        breadcrumbs: [libraryId],
      },
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOverCurrent }, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem, monitor) => {
      if (!ref.current) {
        return;
      }

      if (draggedItem.id === libraryId) {
        setIsSelfSelected(true);
        return;
      }

      setIsSelfSelected(false);

      if (draggedItem.type !== "library") return;

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
          getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap),
        );

        const orderIndex = insertBetween(
          previousOrderIndex,
          libraryPropsMapRef.get("order_index"),
        );

        dataManagerSubdocs
          .getLibrary(draggedItem.id)
          .getMap("library_props")
          .set("order_index", orderIndex);
      }

      if (!isTopSelected) {
        const nextOrderIndex = getNextOrderIndex(
          libraryId,
          getArrayFromYDocMap(dataManagerSubdocs.libraryYDocMap),
        );

        const orderIndex = insertBetween(
          libraryPropsMapRef.get("order_index"),
          nextOrderIndex,
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

  const onRenameClick = useCallback(() => {
    setRenameValue(props.item_properties.item_title);
    setIsRenaming(true);
  }, [props.item_properties.item_title]);

  const handleRenameSave = useCallback(() => {
    if (
      renameValue.trim() &&
      renameValue !== props.item_properties.item_title
    ) {
      const libraryYdoc = dataManagerSubdocs.getLibrary(libraryId);
      const libraryProps = libraryYdoc.getMap("library_props");
      const currentProperties = libraryProps.get("item_properties");
      libraryProps.set("item_properties", {
        ...currentProperties,
        item_title: renameValue.trim(),
      });
    }
    setIsRenaming(false);
  }, [renameValue, props.item_properties.item_title, libraryId]);

  const handleRenameCancel = useCallback(() => {
    setIsRenaming(false);
  }, [onRenameClick]);

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
            dataManagerSubdocs.getLibrary(libraryId),
          );
        },
      },
      {
        label: "Load from archive",
        icon: (
          <span className="icon-[ph--upload-thin] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          await persistenceManagerForSubdocs.loadArchive(
            dataManagerSubdocs.getLibrary(libraryId),
          );
        },
      },
      {
        isDivider: true,
      },

      {
        label: "Rename",
        icon: (
          <span className="icon-[fluent--rename-a-20-regular] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: onRenameClick,
      },
      {
        label: "Delete",
        icon: (
          <span className="icon-[mdi--delete-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          // Show confirmation dialog
          setDeleteConfirmDialog({
            open: true,
            libraryId: libraryId,
            libraryTitle: props.item_properties.item_title,
          });
        },
      },
    ];
  }, [onRenameClick, libraryId, onSelect, props.item_properties.item_title]);

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
            {isRenaming ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameSave();
                  } else if (e.key === "Escape") {
                    handleRenameCancel();
                  }
                }}
                onBlur={handleRenameSave}
                className="w-full bg-appLayoutInputBackground border border-appLayoutBorder px-1 text-appLayoutText text-libraryManagerHeaderText text-center focus:outline-none focus:border-appLayoutFocus"
                autoFocus
              />
            ) : (
              <span className="w-fit whitespace-nowrap text-nowrap overflow-x-hidden text-ellipsis">
                {props.item_properties.item_title}
              </span>
            )}
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

      <DialogWrapper
        open={deleteConfirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmDialog({
              open: false,
              libraryId: null,
              libraryTitle: null,
            });
          }
        }}
        title="Delete Library"
        description={`Are you sure you want to delete "${deleteConfirmDialog.libraryTitle}"? This action cannot be undone.`}
        onSubmit={async () => {
          console.log("Deleting Library", deleteConfirmDialog.libraryId);
          await persistenceManagerForSubdocs.clearLocalPersistenceForYDoc(
            deleteConfirmDialog.libraryId,
          );
          await persistenceManagerForSubdocs.closeConnectionForYDoc(
            deleteConfirmDialog.libraryId,
          );
          await dataManagerSubdocs.destroyLibrary(
            deleteConfirmDialog.libraryId,
          );

          console.log("userProfile:", userProfile, deleteFromDrive);
          if (userProfile && deleteFromDrive) {
            console.log("Deleting from Drive too");
            const googleDriveManager =
              driveOrchestrator.getManager("googleDrive");
            googleDriveManager.stopSync(deleteConfirmDialog.libraryId);
            googleDriveManager.deleteDocument(deleteConfirmDialog.libraryId);
          }
          setDeleteConfirmDialog({
            open: false,
            libraryId: null,
            libraryTitle: null,
          });
        }}
        submitLabel="Delete"
        destructive={true}
        options={[
          ...(userProfile && !driveSyncLoading
            ? [
                {
                  checked: deleteFromDrive,
                  label: "Delete from drive",
                  onChange: (e) => setDeleteFromDrive(e.target.checked),
                },
              ]
            : []),
        ]}
      />
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
