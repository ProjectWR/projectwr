import { useCallback, useEffect, useState, useRef } from "react";
import useOuterClick from "../../design-system/useOuterClick";
import { useDeviceType } from "../../app/ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import { useEditorState } from "@tiptap/react";
import Tippy from '@tippyjs/react';

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

  return (
    <div className="h-full w-fit shrink-0 flex items-center">
      <div
        id="EditorStyles TextFormatButtonHeader"
        className="px-1 h-full w-fit flex items-center justify-center"
      >
        <Tippy
          visible={isOpened}
          onClickOutside={() => setIsOpened(false)}
          interactive={true}
          placement="bottom"
          appendTo={() => document.querySelector("#EditorContainer")}
          offset={[0, 4]}
          content={
            <div
              className={`h-fit p-1 px-1 bg-appBackground z-30 bg-opacity-100 flex items-center flex-col rounded-[0.2rem] shadow-2xl shadow-appLayoutGentleShadow`}
              style={{
                minWidth: `calc(${textFormatButtonWidth}rem * var(--uiScale))`,
                width: `calc(${textFormatButtonWidth}rem * var(--uiScale))`,
                border: `1px solid ${dividerColor}`,
              }}
            >
              <button
                className={`w-full h-fit px-2 toolbarButton flex items-center justify-center relative`}
                onClick={() => {
                  setIsOpened(false);
                  setFormat("p", editor);
                }}
              >
                <ReturnPlainElementForFormat
                  format={"p"}
                  toolbarFontSize={toolbarFontSize}
                />
              </button>
              <button
                className={`w-full h-fit px-2 toolbarButton flex items-center justify-center`}
                onClick={() => {
                  setIsOpened(false);
                  setFormat("h1", editor);
                }}
              >
                <ReturnPlainElementForFormat
                  format={"h1"}
                  toolbarFontSize={toolbarFontSize}
                />
              </button>
              <button
                className={`w-full h-fit px-2 toolbarButton flex items-center justify-center`}
                onClick={() => {
                  setIsOpened(false);
                  setFormat("h2", editor);
                }}
              >
                <ReturnPlainElementForFormat
                  format={"h2"}
                  toolbarFontSize={toolbarFontSize}
                />
              </button>
              <button
                className={`w-full h-fit px-2 toolbarButton flex items-center justify-center`}
                onClick={() => {
                  setIsOpened(false);
                  setFormat("h3", editor);
                }}
              >
                <ReturnPlainElementForFormat
                  format={"h3"}
                  toolbarFontSize={toolbarFontSize}
                />
              </button>
            </div>
          }
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
        </Tippy>
      </div>


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
          Heading 1
        </p>
      );

    case "h2":
      return (
        <p
          className="min-w-fit w-fit"
          style={{ fontSize: `calc(${toolbarFontSize}rem * var(--uiScale))` }}
        >
          Heading 2
        </p>
      );

    case "h3":
      return (
        <p
          className="min-w-fit w-fit"
          style={{ fontSize: `calc(${toolbarFontSize}rem * var(--uiScale))` }}
        >
          Heading 3
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
        <p className="EditorStyles text-nowrap">
          Normal Text
        </p>
      );

    case "h1":
      return (
        <h1 className="EditorStyles text-nowrap">
          Heading 1
        </h1>
      );

    case "h2":
      return (
        <h2 className="EditorStyles text-nowrap">
          Heading 2
        </h2>
      );

    case "h3":
      return (
        <h3 className="EditorStyles text-nowrap">
          Heading 3
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
