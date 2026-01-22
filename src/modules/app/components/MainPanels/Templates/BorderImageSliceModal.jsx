import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import imageManager from "../../../lib/image";

/**
 * BorderImageSliceModal - A modal dialog for editing border-image-slice values
 * with visual preview and interactive controls
 */
const BorderImageSliceModal = ({
  isOpen,
  onClose,
  value,
  onChange,
  borderImageSource,
}) => {
  const [sliceValues, setSliceValues] = useState({
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
      const parts = value.split(" ");
      const fill = parts.includes("fill");
      const numbers = parts
        .filter((p) => p !== "fill")
        .map((n) => parseInt(n) || 0);
      setSliceValues({
        top: numbers[0] || 0,
        right: numbers[1] || numbers[0] || 0,
        bottom: numbers[2] || numbers[0] || 0,
        left: numbers[3] || numbers[1] || numbers[0] || 0,
        fill,
      });
    }
  }, [value]);

  const handleSave = () => {
    const { top, right, bottom, left, fill } = sliceValues;
    const sliceStr =
      [top, right, bottom, left].join(" ") + (fill ? " fill" : "");
    onChange(sliceStr);
    onClose();
  };

  const updateSliceValue = (key, val) => {
    setSliceValues((prev) => ({ ...prev, [key]: val }));
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
            className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[2001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-appBackground border border-appLayoutBorder rounded-lg shadow-2xl p-6 w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4 text-appLayoutText">
              Border Image Slice Editor
            </h2>

            {displayUrl && (
              <div className="mb-6 bg-appLayoutInputBackground border border-appLayoutBorder rounded-lg p-4">
                <div className="flex justify-center">
                  <img
                    src={displayUrl}
                    alt="Border Image"
                    className="max-w-full max-h-64 border border-appLayoutBorder rounded object-contain"
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-appLayoutTextMuted mb-4">
                Set the slice values to define how the border image is divided
                into regions. Values represent pixels from each edge.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-appLayoutText">
                    Top
                  </label>
                  <input
                    type="number"
                    value={sliceValues.top}
                    onChange={(e) =>
                      updateSliceValue("top", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-sm border border-appLayoutBorder rounded-lg bg-appBackground text-appLayoutText focus:outline-none focus:border-appLayoutHighlight"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-appLayoutText">
                    Right
                  </label>
                  <input
                    type="number"
                    value={sliceValues.right}
                    onChange={(e) =>
                      updateSliceValue("right", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-sm border border-appLayoutBorder rounded-lg bg-appBackground text-appLayoutText focus:outline-none focus:border-appLayoutHighlight"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-appLayoutText">
                    Bottom
                  </label>
                  <input
                    type="number"
                    value={sliceValues.bottom}
                    onChange={(e) =>
                      updateSliceValue("bottom", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-sm border border-appLayoutBorder rounded-lg bg-appBackground text-appLayoutText focus:outline-none focus:border-appLayoutHighlight"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-appLayoutText">
                    Left
                  </label>
                  <input
                    type="number"
                    value={sliceValues.left}
                    onChange={(e) =>
                      updateSliceValue("left", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 text-sm border border-appLayoutBorder rounded-lg bg-appBackground text-appLayoutText focus:outline-none focus:border-appLayoutHighlight"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-appLayoutInputBackground rounded-lg">
                <input
                  type="checkbox"
                  id="fill-checkbox"
                  checked={sliceValues.fill}
                  onChange={(e) => updateSliceValue("fill", e.target.checked)}
                  className="w-4 h-4 rounded border-appLayoutBorder"
                />
                <label
                  htmlFor="fill-checkbox"
                  className="text-sm text-appLayoutText cursor-pointer"
                >
                  Fill center (use middle region as background)
                </label>
              </div>
            </div>

            <div className="bg-appLayoutInputBackground border border-appLayoutBorder rounded-lg p-3 mb-6">
              <p className="text-xs text-appLayoutTextMuted mb-1">
                Current Value:
              </p>
              <code className="text-xs text-appLayoutText font-mono">
                {[
                  sliceValues.top,
                  sliceValues.right,
                  sliceValues.bottom,
                  sliceValues.left,
                ].join(" ")}
                {sliceValues.fill ? " fill" : ""}
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

export default BorderImageSliceModal;
