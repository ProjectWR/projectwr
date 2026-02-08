import {
  useState,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import PropTypes from "prop-types";
import ExportTreeNode from "./ExportTreeNode";
import { YTree } from "yjs-orderedtree";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { exportItem } from "../../../lib/importExport";
import JSZip from "jszip";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { ScrollArea } from "@mantine/core";
import { current } from "immer";

/**
 * ExportTreeComponent - Main wrapper for export tree with checkbox selection
 * Manages checkbox state and provides methods to get selected items
 *
 * @param {Object} props
 * @param { YTree } props.ytree - YTree instance
 * @param {string} props.itemId - Root item ID (book, section, or library)
 * @param {string} props.libraryId - Library ID
 * @param {Function} props.onSelectionChange - Optional callback when selection changes
 */
const ExportTreeComponent = forwardRef(
  ({ ytree, itemId, libraryId, onSelectionChange }, ref) => {
    // Track checkbox state for each node independently
    const [checkboxState, setCheckboxState] = useState({});
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Check if a node has a selected ancestor (should be disabled)
     */
    const isDisabled = useCallback(
      (nodeId) => {
        // Walk up the tree to check if any ancestor is selected
        let currentId = nodeId;
        if (currentId === "root") {
          return false;
        }
        let parentId = ytree.getNodeParentFromKey(currentId);

        while (parentId) {
          if (checkboxState[parentId]) {
            return true;
          }

          if (parentId == "root") return false;

          currentId = parentId;
          parentId = ytree.getNodeParentFromKey(currentId);
        }

        return false;
      },
      [ytree, checkboxState],
    );

    /**
     * Get selected items from a given state object
     * Excludes descendants of selected parents
     */
    const getSelectedItemsFromState = useCallback(
      (state) => {
        const selected = Object.keys(state).filter((id) => state[id]);

        // Filter out items whose ancestor is also selected
        return selected.filter((nodeId) => {
          if (nodeId == "root") {
            return true;
          }
          let parentId = ytree.getNodeParentFromKey(nodeId);

          while (parentId && parentId !== "root") {
            if (state[parentId]) {
              // This node has a selected ancestor, exclude it
              return false;
            }
            parentId = ytree.getNodeParentFromKey(parentId);
          }

          return true;
        });
      },
      [ytree],
    );

    /**
     * Get list of selected items for export
     * Excludes descendants of selected parents
     */
    const getSelectedItems = useCallback(() => {
      return getSelectedItemsFromState(checkboxState);
    }, [checkboxState, getSelectedItemsFromState]);

    /**
     * Get count of selected items
     */
    const getSelectedCount = useCallback(() => {
      return getSelectedItems().length;
    }, [getSelectedItems]);

    ``; /**

    
    /**
     * Handle checkbox state change for a node
     */
    const handleCheckboxChange = useCallback(
      (nodeId, checked) => {
        setCheckboxState((prev) => {
          const newState = {
            ...prev,
            [nodeId]: checked,
          };

          // Call optional callback
          if (onSelectionChange) {
            onSelectionChange(getSelectedItemsFromState(newState));
          }

          return newState;
        });
      },
      [getSelectedItemsFromState, onSelectionChange],
    );

    const selectAll = useCallback(() => {
      const allIds = [];
      ytree.getAllDescendants(itemId, allIds);
      allIds.push(itemId); // Include root

      const newState = {};
      allIds.forEach((id) => {
        newState[id] = true;
      });

      setCheckboxState(newState);

      if (onSelectionChange) {
        onSelectionChange(getSelectedItemsFromState(newState));
      }
    }, [ytree, itemId, onSelectionChange, getSelectedItemsFromState]);

    /**
     * Deselect all items
     */
    const deselectAll = useCallback(() => {
      setCheckboxState({});

      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }, [onSelectionChange]);

    /**
     * Handle export of selected items
     */
    const handleExport = useCallback(async () => {
      const selectedItems = getSelectedItems();
      if (selectedItems.length === 0) return;

      setIsExporting(true);
      try {
        if (selectedItems.length === 1) {
          // Single item export
          await exportItem(ytree, selectedItems[0]);
        } else {
          // Multiple items - create a zip file
          const zip = new JSZip();

          for (const itemId of selectedItems) {
            await exportItem(ytree, itemId, zip, "");
          }

          // Generate and save the zip
          const zipBlob = await zip.generateAsync({ type: "uint8array" });
          const path = await save({
            defaultPath: "Export.zip",
            filters: [
              {
                name: "ZIP Archive",
                extensions: ["zip"],
              },
            ],
          });

          if (path) {
            await writeFile(path, zipBlob);
            console.log(`Exported ${selectedItems.length} items to: ${path}`);
          }
        }
      } catch (error) {
        console.error("Error during export:", error);
        alert(`Export failed: ${error.message}`);
      } finally {
        setIsExporting(false);
      }
    }, [ytree, getSelectedItems]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getSelectedItems,
      getSelectedCount,
      selectAll,
      deselectAll,
    }));

    // Get children of the root item
    const rootChildren = useMemo(() => {
      return ytree.getNodeChildrenFromKey(
        itemId == libraryId ? "root" : itemId,
      );
    }, [ytree, itemId, libraryId]);

    const hasChildren = rootChildren && rootChildren.length > 0;

    return (
      <div className="w-full h-fit">
        <div className="w-full h-fit px-1 py-1 flex flex-col items-start gap-1 border-none rounded-md">
          <div className="w-full flex justify-between items-center px-2 pt-1 pb-2">
            <h2 className="text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
              Export
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-libraryDirectoryBookNodeFontSize border border-appLayoutBorder px-3 py-1 rounded-lg bg-transparent hover:bg-appLayoutInverseHover text-appLayoutText transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="text-libraryDirectoryBookNodeFontSize  border border-appLayoutBorder px-3 py-1 rounded-lg bg-transparent hover:bg-appLayoutInverseHover text-appLayoutText transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <ScrollArea
            classNames={{
              root: "w-full h-fit p-1 overflow-y-auto border border-appLayoutBorder rounded-lg",
              scrollbar: `bg-transparent hover:bg-transparent p-0 w-scrollbarWidthThin`,
              thumb: `bg-appLayoutBorder rounded-l-full hover:!bg-appLayoutInverseHover`,
              content:
                "flex flex-col w-full h-fit max-h-detailsPanelDescriptionInputHeight",
            }}
          >
            {itemId !== libraryId ? (
              <div className="flex flex-col">
                {/* Show the parent node itself */}
                <ExportTreeNode
                  key={itemId}
                  ytree={ytree}
                  itemId={itemId}
                  libraryId={libraryId}
                  checkboxState={checkboxState}
                  onCheckboxChange={handleCheckboxChange}
                  isDisabled={isDisabled}
                  depth={0}
                />
              </div>
            ) : hasChildren ? (
              <div className="flex flex-col">
                {/* For libraries, show all root children */}
                {ytree
                  .sortChildrenByOrder(rootChildren, "root")
                  .map((childId) => (
                    <ExportTreeNode
                      key={childId}
                      ytree={ytree}
                      itemId={childId}
                      checkboxState={checkboxState}
                      onCheckboxChange={handleCheckboxChange}
                      isDisabled={isDisabled}
                      depth={0}
                    />
                  ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-appLayoutTextMuted text-sm">
                No items to export
              </div>
            )}
          </ScrollArea>

          <AnimatePresence>
            {getSelectedCount() > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-fit w-full overflow-hidden"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height:
                      "calc(var(--spacing-detailsPanelButtonHeight) * 0.66)",
                  }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-right px-4 pt-1 border-none text-libraryDirectoryBookNodeFontSize text-appLayoutTextMuted"
                >
                  {getSelectedCount()} item{getSelectedCount() !== 1 ? "s" : ""}{" "}
                  selected
                </motion.div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: "var(--spacing-detailsPanelButtonHeight)",
                  }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full px-2 flex items-center justify-end"
                >
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="text-libraryDirectoryBookNodeFontSize border border-appLayoutBorder px-4 py-2 rounded-lg bg-transparent hover:bg-appLayoutInverseHover text-appLayoutText transition-colors"
                  >
                    {isExporting ? "Exporting..." : "Export Selected"}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

ExportTreeComponent.displayName = "ExportTreeComponent";

ExportTreeComponent.propTypes = {
  ytree: PropTypes.object.isRequired,
  itemId: PropTypes.string.isRequired,
  onSelectionChange: PropTypes.func,
};

export default ExportTreeComponent;
