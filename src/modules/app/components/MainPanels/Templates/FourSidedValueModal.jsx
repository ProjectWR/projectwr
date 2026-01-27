import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import imageManager from "../../../lib/image";

/**
 * FourSidedValueModal - A generic modal dialog for editing 4-sided CSS values
 * (top, right, bottom, left) like border-image-slice, width, outset, etc.
 */
const FourSidedValueModal = ({
  isOpen,
  onClose,
  value,
  onChange,
  borderImageSource,
  title = "Edit",
  description = "Set the values for each side.",
  showFill = false,
}) => {
  const [sideValues, setSideValues] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    fill: false,
  });
  const modalRef = useRef(null);

  // Parse the value on mount or when value changes
  useEffect(() => {
    if (value) {
      // Handle both string "10 20 30 40" and basic numbers
      const strValue = String(value);
      const parts = strValue.split(" ");
      const fill = parts.includes("fill");
      // Filter out 'fill' and parsed numbers
      const numbers = parts
        .filter((p) => p !== "fill")
        .map((n) => parseFloat(n) || 0);

      setSideValues({
        top: numbers[0] || 0,
        right: numbers[1] !== undefined ? numbers[1] : numbers[0] || 0,
        bottom: numbers[2] !== undefined ? numbers[2] : numbers[0] || 0,
        left:
          numbers[3] !== undefined
            ? numbers[3]
            : numbers[1] !== undefined
            ? numbers[1]
            : numbers[0] || 0,
        fill: showFill ? fill : false,
      });
    } else {
      // Default to 0s if no value
      setSideValues({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        fill: false,
      });
    }
  }, [value, showFill]);

  const handleSave = () => {
    const { top, right, bottom, left, fill } = sideValues;
    // Construct valid CSS string.
    // Optimization: If all are same, return single value?
    // For now, let's keep it explicit for clarity in the UI, or just join them.
    // Standard CSS syntax:
    // 1 value: all 4 sides
    // 2 values: top/bottom left/right
    // 3 values: top left/right bottom
    // 4 values: top right bottom left

    // To match user request for "separate" inputs, always returning 4 values is safest,
    // but standard CSS practice is to condense. Let's return 4 for maximum control/clarity unless we want to be smart.
    // Let's stick to 4 values to ensure the UI inputs map back 1:1 easily.

    let res = `${top} ${right} ${bottom} ${left}`;
    if (showFill && fill) {
      res += " fill";
    }
    onChange(res);
    onClose();
  };

  const updateValue = (key, val) => {
    setSideValues((prev) => ({ ...prev, [key]: val }));
  };

  // Resolve image ID to URL if needed
  const displayUrl = React.useMemo(() => {
    if (!borderImageSource) return null;

    if (
      typeof borderImageSource === "string" &&
      !borderImageSource.startsWith("blob:") &&
      !borderImageSource.startsWith("http")
    ) {
      return imageManager.getImageUrl(borderImageSource);
    }

    return borderImageSource;
  }, [borderImageSource]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-2000 flex items-center justify-center"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-2001 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-appBackground border border-appLayoutBorder rounded-lg shadow-2xl p-6 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-2 text-appLayoutText">
              {title}
            </h2>
            <p className="text-sm text-appLayoutTextMuted mb-4">
              {description}
            </p>

            {displayUrl && (
              <div className="mb-6 bg-appLayoutInputBackground border border-appLayoutBorder rounded-lg p-4">
                <div className="flex justify-center">
                  <img
                    src={displayUrl}
                    alt="Preview"
                    className="max-w-full max-h-64 border border-appLayoutBorder rounded object-contain"
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-appLayoutText">
                    Top
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={sideValues.top}
                      onChange={(e) =>
                        updateValue("top", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-sm border border-appLayoutBorder rounded-lg bg-appBackground text-appLayoutText focus:outline-none focus:border-appLayoutHighlight"
                    />
                    <span className="text-sm text-appLayoutTextMuted">px</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-appLayoutText">
                    Right
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={sideValues.right}
                      onChange={(e) =>
                        updateValue("right", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-sm border border-appLayoutBorder rounded-lg bg-appBackground text-appLayoutText focus:outline-none focus:border-appLayoutHighlight"
                    />
                    <span className="text-sm text-appLayoutTextMuted">px</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-appLayoutText">
                    Bottom
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={sideValues.bottom}
                      onChange={(e) =>
                        updateValue("bottom", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-sm border border-appLayoutBorder rounded-lg bg-appBackground text-appLayoutText focus:outline-none focus:border-appLayoutHighlight"
                    />
                    <span className="text-sm text-appLayoutTextMuted">px</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-appLayoutText">
                    Left
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={sideValues.left}
                      onChange={(e) =>
                        updateValue("left", parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 text-sm border border-appLayoutBorder rounded-lg bg-appBackground text-appLayoutText focus:outline-none focus:border-appLayoutHighlight"
                    />
                    <span className="text-sm text-appLayoutTextMuted">px</span>
                  </div>
                </div>
              </div>

              {showFill && (
                <div className="flex items-center gap-2 p-3 bg-appLayoutInputBackground rounded-lg">
                  <input
                    type="checkbox"
                    id="fill-checkbox"
                    checked={sideValues.fill}
                    onChange={(e) => updateValue("fill", e.target.checked)}
                    className="w-4 h-4 rounded border-appLayoutBorder"
                  />
                  <label
                    htmlFor="fill-checkbox"
                    className="text-sm text-appLayoutText cursor-pointer"
                  >
                    Fill center (use middle region as background)
                  </label>
                </div>
              )}
            </div>

            <div className="bg-appLayoutInputBackground border border-appLayoutBorder rounded-lg p-3 mb-6">
              <p className="text-xs text-appLayoutTextMuted mb-1">
                Current Value:
              </p>
              <code className="text-xs text-appLayoutText font-mono">
                {[
                  sideValues.top,
                  sideValues.right,
                  sideValues.bottom,
                  sideValues.left,
                ].join(" ")}
                {showFill && sideValues.fill ? " fill" : ""}
              </code>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-appLayoutBorder rounded-lg hover:bg-appLayoutHover text-appLayoutText transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-appLayoutHighlight text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


export default FourSidedValueModal;
