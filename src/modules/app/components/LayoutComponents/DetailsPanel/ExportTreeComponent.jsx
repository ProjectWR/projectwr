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
  ({ ytree, itemId, onSelectionChange }, ref) => {
    // Track checkbox state for each node independently
    const [checkboxState, setCheckboxState] = useState({});

    /**
     * Check if a node has a selected ancestor (should be disabled)
     */
    const isDisabled = useCallback(
      (nodeId) => {
        // Walk up the tree to check if any ancestor is selected
        let currentId = nodeId;
        let parentId = ytree.getNodeParentFromKey(currentId);

        while (parentId && parentId !== "root") {
          if (checkboxState[parentId]) {
            return true;
          }
          currentId = parentId;
          parentId = ytree.getNodeParentFromKey(currentId);
        }

        return false;
      },
      [ytree, checkboxState]
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
      [ytree]
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
      [getSelectedItemsFromState, onSelectionChange]
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

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getSelectedItems,
      getSelectedCount,
      selectAll,
      deselectAll,
    }));

    // Get children of the root item
    const rootChildren = useMemo(() => {
      return ytree.getNodeChildrenFromKey(itemId);
    }, [ytree, itemId]);

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
                className="text-xs px-2 py-1 rounded bg-appLayoutInverseHover hover:bg-appLayoutPressed text-appLayoutText transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs px-2 py-1 rounded bg-appLayoutInverseHover hover:bg-appLayoutPressed text-appLayoutText transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="w-full max-h-96 py-3 px-2 overflow-y-auto border border-appLayoutBorder rounded-lg">
            {hasChildren ? (
              <div className="flex flex-col">
                {ytree
                  .sortChildrenByOrder(rootChildren, itemId)
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
          </div>

          {getSelectedCount() > 0 && (
            <div className="w-full text-right px-2 pt-1 border-none text-detailsPanelPropsFontSize text-appLayoutTextMuted">
              {getSelectedCount()} item{getSelectedCount() !== 1 ? "s" : ""}{" "}
              selected
            </div>
          )}
        </div>
      </div>
    );
  }
);

ExportTreeComponent.displayName = "ExportTreeComponent";

ExportTreeComponent.propTypes = {
  ytree: PropTypes.object.isRequired,
  itemId: PropTypes.string.isRequired,
  onSelectionChange: PropTypes.func,
};

export default ExportTreeComponent;
