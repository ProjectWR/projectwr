import { useCallback, useEffect, useState, useRef } from "react";
import useOuterClick from "../../design-system/useOuterClick";
import { useDeviceType } from "../../app/ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "framer-motion";
import Tippy from "@tippyjs/react";

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

const HighlightButton = ({ editor, toolbarPreferences }) => {
  const { deviceType } = useDeviceType();

  const {
    toolbarHeight,
    toolbarButtonHeight,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    buttonHeight,
    buttonWidth,
    backgroundColor,
    buttonColor,
    dividerColor,
  } = toolbarPreferences;

  const [lastPickedColor, setLastPickedColor] = useState(colors[0]);
  const [isOpened, setIsOpened] = useState(false);

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


  return (
    <div className="relative" ref={innerRef}>
      <Tippy
        visible={isOpened}
        onClickOutside={() => setIsOpened(false)}
        interactive={true}
        placement="bottom-start"
        appendTo={() => document.querySelector("#EditorContainer")}
        offset={[0, 4]}
        content={
          <div
            className={`p-1 bg-background z-30 bg-opacity-100  fixed items-center grid grid-cols-3 gap-[0.125rem] rounded-[0.2rem]`}
            style={{
              width: `${buttonWidth * 3.4}rem`,
              height: `${buttonHeight * 3.6}rem`,
              border: `1px solid ${dividerColor}`,
              backgroundColor: backgroundColor,
            }}
          >
            {colors.map((color) => (
              <button
                style={{
                  height: `${buttonHeight}rem`,
                  width: `${buttonWidth}rem`,
                }}
                key={color}
                className="w-full h-full toolbarButton p-1"
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
              style={{
                height: `${buttonHeight}rem`,
                width: `${buttonWidth}rem`,
              }}
              className="toolbarButton"
              reversed
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setIsOpened(!isOpened);
              }}
            >
              <span className="icon-[material-symbols-light--ink-eraser-rounded] h-full w-full"></span>
            </button>
          </div>
        }>
        <div className="w-fit h-fit flex items-center justify-center border-appLayoutBorder">
          <button
            style={{ height: `${buttonHeight}rem`, width: `${buttonWidth}rem` }}
            className={`px-[0.35rem] py-[0.3rem] toolbarButton rounded-[0.35rem]`}
            onClick={() => setIsOpened(!isOpened)}
          >
            <div
              className="w-full h-full rounded-[0.1rem]"
              style={{ backgroundColor: lastPickedColor }}
            ></div>
          </button>

          <button
            style={{ height: `${buttonHeight}rem`, width: `${buttonWidth}rem` }}
            className={`py-px rounded-[0.3rem] toolbarButton`}
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
      </Tippy>




    </div>
  );
};

export default HighlightButton;
