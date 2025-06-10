import { useCallback, useEffect, useState, useRef } from "react";
import useOuterClick from "../../design-system/useOuterClick";
import { useDeviceType } from "../../app/ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import { useEditorState } from "@tiptap/react";

const formats = {
  p: {
    text: "<p> Normal Text </p>",
  },
};

const TextFormatButton = ({ editor, toolbarPreferences }) => {
  console.log("textformat button rerendered");

  const { deviceType } = useDeviceType();

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isHeading1: editor.isActive("heading", { level: 1 }),
      isHeading2: editor.isActive("heading", { level: 2 }),
      isHeading3: editor.isActive("heading", { level: 3 }),
    }),
  });

  const [isOpened, setIsOpened] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const headerRef = useRef(null);
  const dropdownRef = useRef(null);

  const innerRef = useOuterClick(() => {
    setIsOpened(false);
  });

  const [activeHeading, setActiveHeading] = useState(getActiveHeading(editor));

  const onSelectionUpdate = useCallback(() => {
    setActiveHeading(getActiveHeading(editor));
  }, [editor]);

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
    textFormatButtonWidth,
    toolbarFontSize,
    hoverColor,
    pressedColor,
  } = toolbarPreferences;

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
    onSelectionUpdate();
  }, [editorState, onSelectionUpdate]);

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

      setDropdownPosition({ top: top, left: left > 0 ? left : 0 });
    }
  }, [isOpened]);

  return (
    <div
      className="relative h-full w-fit shrink-0 flex items-center"
      ref={innerRef}
    >
      <div
        style={{ height: `${buttonHeight}rem` }}
        id="TextFormatButtonHeader"
        ref={headerRef}
        className="px-1 w-fit flex items-center justify-center"
      >
        <button
          style={{
            minWidth: `calc(${textFormatButtonWidth}rem * var(--uiScale))`,
            width: `calc(${textFormatButtonWidth}rem * var(--uiScale))`,
          }}
          className={`h-full px-[0.35rem] toolbarButton rounded-[0.35rem] `}
          onClick={() => setIsOpened(!isOpened)}
        >
          <div className="w-full h-full flex items-center justify-between">
            <div className="grow px-2 h-full py-[0.3rem] flex justify-center items-center">
              <ReturnPlainElementForFormat
                format={activeHeading}
                toolbarFontSize={toolbarFontSize}
              />
            </div>
            <motion.span
              animate={{
                rotate: isOpened ^ (deviceType === "mobile") ? 0 : 180,
              }}
              className={`icon-[material-symbols-light--keyboard-arrow-up] mt-px h-full w-[2rem]`}
            ></motion.span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpened && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            ref={dropdownRef}
            className={`h-fit p-1 px-1 bg-appBackground z-30 bg-opacity-100 flex fixed items-center flex-col rounded-[0.2rem] shadow-2xl shadow-appLayoutGentleShadow`}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `fit-content`,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <button
              className={`w-fit h-fit px-4 py-1 toolbarButton flex items-center justify-center relative`}
              onClick={() => {
                setIsOpened(false);

                setFormat("p", editor);
              }}
            >
              <ReturnElementForFormat
                format={"p"}
                toolbarFontSize={toolbarFontSize}
              />
            </button>
            <button
              className={`w-full h-fit px-4 py-1 toolbarButton flex items-center justify-center`}
              onClick={() => {
                setIsOpened(false);

                setFormat("h1", editor);
              }}
            >
              <ReturnElementForFormat
                format={"h1"}
                toolbarFontSize={toolbarFontSize}
              />
            </button>
            <button
              className={`w-full h-fit px-4 py-1 toolbarButton flex items-center justify-center`}
              onClick={() => {
                setIsOpened(false);

                setFormat("h2", editor);
              }}
            >
              <ReturnElementForFormat
                format={"h2"}
                toolbarFontSize={toolbarFontSize}
              />
            </button>
            <button
              className={`w-full h-fit px-4 py-1 toolbarButton flex items-center justify-center`}
              onClick={() => {
                setIsOpened(false);

                setFormat("h3", editor);
              }}
            >
              <ReturnElementForFormat
                format={"h3"}
                toolbarFontSize={toolbarFontSize}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TextFormatButton;

const ReturnPlainElementForFormat = ({ format, toolbarFontSize }) => {
  switch (format) {
    case "h1":
      return (
        <p
          className="min-w-fit w-fit"
          style={{ fontSize: `calc(${toolbarFontSize}rem * var(--uiScale))` }}
        >
          Title
        </p>
      );

    case "h2":
      return (
        <p
          className="min-w-fit w-fit"
          style={{ fontSize: `calc(${toolbarFontSize}rem * var(--uiScale))` }}
        >
          Heading 1
        </p>
      );

    case "h3":
      return (
        <p
          className="min-w-fit w-fit"
          style={{ fontSize: `calc(${toolbarFontSize}rem * var(--uiScale))` }}
        >
          Heading 2
        </p>
      );

    default:
      return (
        <p
          className="min-w-fit w-fit"
          style={{ fontSize: `calc(${toolbarFontSize}rem * var(--uiScale))` }}
        >
          Normal Text
        </p>
      );
  }
};

const ReturnElementForFormat = ({ format, toolbarFontSize }) => {
  switch (format) {
    case "p":
      return (
        <p style={{}} className="text-nowrap w-fit">
          Normal Text
        </p>
      );

    case "h1":
      return (
        <h1 style={{ margin: 0 }} className="text-nowrap w-fit">
          Title
        </h1>
      );

    case "h2":
      return (
        <h2 style={{ margin: 0 }} className="text-nowrap w-fit">
          Heading 1
        </h2>
      );

    case "h3":
      return (
        <h3 style={{ margin: 0 }} className="text-nowrap w-fit">
          Heading 2
        </h3>
      );
    default:
      return null;
  }
};

const setFormat = (format, editor) => {
  switch (format) {
    case "p":
      editor.chain().focus().setParagraph().run();
      break;
    case "h1":
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      break;
    case "h2":
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      break;
    case "h3":
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      break;
  }
};

const getActiveHeading = (editor) => {
  const { level } = editor.getAttributes("heading");

  switch (level) {
    case 1:
      return "h1";

    case 2:
      return "h2";

    case 3:
      return "h3";

    default:
      return "p";
  }
};
