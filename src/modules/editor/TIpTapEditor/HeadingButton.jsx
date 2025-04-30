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
      isHeading4: editor.isActive("heading", { level: 4 }),
      isHeading5: editor.isActive("heading", { level: 5 }),
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
  }, [editorState, onSelectionUpdate])

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
        className="px-1 w-fit"
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
              <ReturnPlainElementForFormat format={activeHeading} />
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
              width: `calc(${textFormatButtonWidth}rem * var(--uiScale))`,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <button
              className={`w-full h-fit px-2 py-[0.3rem] toolbarButton flex items-center justify-center relative`}
              onClick={() => {
                setFormat("p", editor);
              }}
            >
              <ReturnElementForFormat format={"p"} />
            </button>
            <button
              className={`w-full h-fit px-2 py-[0.3rem] toolbarButton flex items-center justify-center`}
              onClick={() => {
                setFormat("h1", editor);
              }}
            >
              <ReturnElementForFormat format={"h1"} />
            </button>
            <button
              className={`w-full h-fit px-2 py-[0.3rem] toolbarButton flex items-center justify-center`}
              onClick={() => {
                setFormat("h2", editor);
              }}
            >
              <ReturnElementForFormat format={"h2"} />
            </button>
            <button
              className={`w-full h-fit px-2 py-[0.3rem] toolbarButton flex items-center justify-center`}
              onClick={() => {
                setFormat("h3", editor);
              }}
            >
              <ReturnElementForFormat format={"h3"} />
            </button>
            <button
              className={`w-full h-fit px-2 py-[0.3rem] toolbarButton flex items-center justify-center`}
              onClick={() => {
                setFormat("h4", editor);
              }}
            >
              <ReturnElementForFormat format={"h4"} />
            </button>
            <button
              className={`w-full h-fit px-2 py-[0.3rem] toolbarButton flex items-center justify-center`}
              onClick={() => {
                setFormat("h5", editor);
              }}
            >
              <ReturnElementForFormat format={"h5"} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TextFormatButton;

const ReturnPlainElementForFormat = ({ format }) => {
  switch (format) {
    case "h1":
      console.log("Inside plain element renderer: ", format);
      return <p className="min-w-fit w-fit">Title</p>;

    case "h2":
      return <p className="min-w-fit w-fit">Heading 1</p>;

    case "h3":
      return <p className="min-w-fit w-fit">Heading 2</p>;

    case "h4":
      return <p className="min-w-fit w-fit">Heading 3</p>;

    case "h5":
      return <p className="min-w-fit w-fit">Heading 4</p>;

    default:
      return <p className="min-w-fit w-fit">Normal Text</p>;
  }
};

const ReturnElementForFormat = ({ format }) => {
  switch (format) {
    case "p":
      return <p>Normal Text</p>;

    case "h1":
      return <h1 style={{ margin: 0 }}>Title</h1>;

    case "h2":
      return <h2 style={{ margin: 0 }}>Heading 1</h2>;

    case "h3":
      return <h3 style={{ margin: 0 }}>Heading 2</h3>;

    case "h4":
      return <h4 style={{ margin: 0 }}>Heading 3</h4>;

    case "h5":
      return <h5 style={{ margin: 0 }}>Heading 4</h5>;

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
    case "h4":
      editor.chain().focus().toggleHeading({ level: 4 }).run();
      break;
    case "h5":
      editor.chain().focus().toggleHeading({ level: 5 }).run();
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

    case 4:
      return "h4";

    case 5:
      return "h5";

    default:
      return "p";
  }
};
