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
      isAlign: editor.isActive("textAlign"),
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
    <div className="h-full w-fit overflow-hiden">
      <button
        className="toolbarButton"
        style={{
          height: `calc(${buttonHeight}rem * var(--uiScale))`,
          borderRadius: `${buttonRadius}rem`,
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          backgroundColor: editor.isActive("bold") ? pressedColor : "",
        }}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="icon-[material-symbols-light--format-bold] w-full h-full text-appLayoutText"></span>
      </button>
    </div>
  );
};

export default TiptapFloatingToolbar;