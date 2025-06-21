import { useEditorState } from "@tiptap/react";

const TiptapFloatingToolbar = ({ editor, toolbarPreferences }) => {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isHighlighted: editor.isActive("highlight"),
      isStriked: editor.isActive("strike"),
      isUnderlined: editor.isActive("underline"),
      isSubscript: editor.isActive("subscript"),
      isSuperscript: editor.isActive("superscript"),
      isBlockQuote: editor.isActive("blockquote"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isLeftAlign: editor.isActive({ textAlign: "left" }),
      isCenterAlign: editor.isActive({ textAlign: "center" }),
      isRightAlign: editor.isActive({ textAlign: "right" }),
      isHeading1: editor.isActive("heading", { level: 1 }),
      isHeading2: editor.isActive("heading", { level: 2 }),
      isHeading3: editor.isActive("heading", { level: 3 }),
      isHeading4: editor.isActive("heading", { level: 4 }),
      isHeading5: editor.isActive("heading", { level: 5 }),
    }),
  });

  const {
    toolbarHeight,
    toolbarButtonHeight,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    buttonHeight,
    buttonWidth,
    buttonRadius,
    backgroundColor,
    buttonColor,
    dividerColor,
    fontSize,
    textFormatButtonWidth,
    toolbarFontSize,
    hoverColor,
    pressedColor,
  } = toolbarPreferences;

  return (
    <div className="h-full w-fit overflow-hidden flex">
      <style>
        {`

            .toolbarButton:hover {
              background-color: ${hoverColor};
            }

            .toolbarButton:focus {
              background-color: ${hoverColor};
            }
          `}
      </style>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive("heading", { level: 1 })
            ? pressedColor
            : "",
        }}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <span className="icon-[cuida--heading1-outline] w-[80%] h-[80%] text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive("heading", { level: 2 })
            ? pressedColor
            : "",
        }}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="icon-[cuida--heading2-outline] w-[80%] h-[80%] text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive("heading", { level: 3 })
            ? pressedColor
            : "",
        }}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <span className="icon-[cuida--heading3-outline] w-[80%] h-[80%] text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive("bulletList") ? pressedColor : "",
        }}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <span className="icon-[material-symbols-light--format-list-bulleted] w-[90%] h-[90%] text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive("orderedList") ? pressedColor : "",
        }}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <span className="icon-[material-symbols-light--format-list-numbered] w-[90%] h-[90%] text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive({ textAlign: "left" })
            ? pressedColor
            : "",
        }}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <span className="icon-[material-symbols-light--format-align-left] w-full h-full text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive({ textAlign: "center" })
            ? pressedColor
            : "",
        }}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <span className="icon-[material-symbols-light--format-align-center] w-full h-full text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive({ textAlign: "right" })
            ? pressedColor
            : "",
        }}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <span className="icon-[material-symbols-light--format-align-right] w-full h-full text-appLayoutText"></span>
      </button>
      <button
        className="toolbarButton h-full flex items-center justify-center focus:outline-none"
        style={{
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive("horizontalRule")
            ? pressedColor
            : "",
        }}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <span className="icon-[material-symbols-light--horizontal-rule] w-full h-full text-appLayoutText"></span>
      </button>
    </div>
  );
};

export default TiptapFloatingToolbar;
