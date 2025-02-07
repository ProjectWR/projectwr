import { useCallback, useEffect, useState, useRef } from "react";
import useOuterClick from "../../design-system/useOuterClick";
import { useDeviceType } from "../../app/ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "framer-motion";

const colors = [
  "#4B0082", // Indigo (good for both black and white text)
  "#008080", // Teal (good for both black and white text)
  "#FF5733", // Bright orange (good for white text)
  "#C70039", // Deep red (good for white text)
  // "#FFFF99", // Light yellow (good for black text)
  "#D4E157", // Lime green (good for black text)
  "#AEC6CF", // Pastel blue
  "#FFB347", // Pastel orange
  "#FFB6C1", // Pastel pink
];

const HighlightButton = ({ editor }) => {
  const { deviceType } = useDeviceType();

  const [lastPickedColor, setLastPickedColor] = useState(colors[0]);
  const [isOpened, setIsOpened] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const headerRef = useRef(null);
  const dropdownRef = useRef(null);

  const innerRef = useOuterClick(() => {
    setIsOpened(false);
  });

  const onSelectionUpdate = useCallback(() => {
    if (editor.getAttributes("highlight").color)
      setLastPickedColor(editor.getAttributes("highlight").color);
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      console.log("No Editor");
      return;
    }

    editor.on("selectionUpdate", onSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [editor, onSelectionUpdate]);

  useEffect(() => {
    if (isOpened && headerRef.current && dropdownRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate the top position for the dropdown
      let top = headerRect.bottom;

      // Check if the dropdown would go past the bottom of the viewport
      if (top + dropdownHeight > viewportHeight) {
        // Adjust the top position to ensure the dropdown stays within the viewport
        top = headerRect.top - dropdownHeight;
      }

      // Calculate the left position for the dropdown (centered below the header)
      const left =
        headerRect.left +
        (headerRect.width - dropdownRef.current.offsetWidth) / 2;

      const right = headerRect.right;

      if (left < 0) {
        setDropdownPosition({ top: top - 18, left: 0 });
        return;
      }

      if (right > window.outerWidth) {
        setDropdownPosition({
          top: top - 18,
          left: window.innerWidth - dropdownRef.current.offsetWidth
        });
        return;
      }

      setDropdownPosition({ top: top - 18, left: left });
    }
  }, [isOpened]);

  return (
    <div className="relative" ref={innerRef}>
      <div
        ref={headerRef}
        className="w-[4.6rem] h-[2rem] border-appLayoutBorder"
      >
        <div className="w-full h-full flex items-center justify-center">
          <button
            className={`w-1/2 h-full px-[0.35rem] py-[0.3rem] hover:bg-appLayoutHover rounded-[0.35rem]`}
            onClick={() => setIsOpened(!isOpened)}
          >
            <div
              className="w-full h-full rounded-[0.1rem]"
              style={{ backgroundColor: lastPickedColor }}
            ></div>
          </button>

          <button
            className={`w-1/2 h-full py-px rounded-[0.3rem] hover:bg-appLayoutHover`}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: lastPickedColor })
                .run()
            }
          >
            <span
              className="icon-[material-symbols-light--format-ink-highlighter] w-full h-full"
              style={{ backgroundColor: lastPickedColor }}
            ></span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpened && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            ref={dropdownRef}
            className={`w-[9rem] h-[9rem] p-2 bg-background z-30 bg-opacity-100 grid fixed items-center grid-cols-3 gap-1 rounded-[0.2rem] border-appLayoutBorder border shadow-black shadow-md`}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {colors.map((color) => (
              <button
                key={color}
                className="w-full h-full hover:bg-appLayoutHover p-1"
                reversed
                onClick={() => {
                  editor.chain().focus().toggleHighlight({ color }).run();
                  setLastPickedColor(color);
                  setIsOpened(!isOpened);
                }}
              >
                <div
                  className={`w-full h-full rounded-[0.1rem]`}
                  style={{ backgroundColor: color }}
                ></div>
              </button>
            ))}

            <button
              className="w-full h-full hover:bg-appLayoutHover"
              reversed
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setIsOpened(!isOpened);
              }}
            ></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HighlightButton;
