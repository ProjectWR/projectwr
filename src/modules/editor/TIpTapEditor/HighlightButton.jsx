import { useCallback, useEffect, useState } from "react";
import WritingAppButton from "../../design-system/WritingAppButton";
import useOuterClick from "../../design-system/useOuterClick";

const colors = [
  "#4B0082", // Indigo (good for both black and white text)
  "#008080", // Teal (good for both black and white text)
  "#FF5733", // Bright orange (good for white text)
  "#C70039", // Deep red (good for white text)
  "#FFFF99", // Light yellow (good for black text)
  "#D4E157", // Lime green (good for black text)
  "#AEC6CF", // Pastel blue
  "#FFB347", // Pastel orange
  "#FFB6C1", // Pastel pink
];

const HighlightButton = ({ editor }) => {
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
      <div className="w-[4.6rem] h-[2rem] border-border ">
        <div className="w-full h-full flex items-center justify-center">
          <WritingAppButton
            className={`w-1/2 h-full px-[0.35rem] py-[0.3rem] hover:bg-hover rounded-[0.35rem]`}
            buttonContent={
              <div
                className="w-full h-full rounded-[0.1rem]"
                style={{ backgroundColor: lastPickedColor }}
              ></div>
            }
            onClick={() => setIsOpened(!isOpened)}
          />

          <WritingAppButton
            className={`w-1/2 h-full py-px rounded-[0.3rem] hover:bg-hover`}
            buttonContent={
              <span
                className="icon-[material-symbols-light--format-ink-highlighter] w-full h-full"
                style={{ backgroundColor: lastPickedColor }}
              ></span>
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: lastPickedColor })
                .run()
            }
            isPressed={editor.isActive("highlight")}
          />
        </div>
      </div>

      <div
        className={`w-[8rem] h-[9rem] p-2 bg-background z-30 bg-opacity-100 ${
          isOpened ? "grid " : "hidden"
        } absolute items-center grid-cols-3 gap-2 rounded-[0.2rem] border-border border left-[-1px] top-[35px] shadow-shadow shadow-md`}
      >
        <WritingAppButton
          className="w-full h-full border-border hover:bg-hover"
          reversed
          onClick={() => {
            editor.chain().focus().unsetHighlight().run();
            setIsOpened(!isOpened);
          }}
          buttonContent={
            <span
              className={`icon-[material-symbols-light--ink-eraser-rounded] w-[37.8rem] h-full text-white bg-white `}
            ></span>
          }
        />

        {colors.map((color) => (
          <WritingAppButton
            key={color}
            className="w-full h-full hover:bg-hover "
            reversed
            onClick={() => {
              editor.chain().focus().toggleHighlight({ color }).run();
              setLastPickedColor(color);
              setIsOpened(!isOpened);
            }}
            buttonContent={
              <div
                className={`w-full h-full rounded-[0.1rem]`}
                style={{ backgroundColor: color }}
              ></div>
            }
            isPressed={editor.isActive("highlight", { color })}
          />
        ))}
      </div>
    </div>
  );
};

export default HighlightButton;
