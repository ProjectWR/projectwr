import { useCallback, useEffect, useState } from "react";
import TextFormatButton from "./HeadingButton";
import HighlightButton from "./HighlightButton";

const TipTapToolbar = ({ editor, toolbarPreferences }) => {
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
    textFormatButtonWidth,
    hoverColor,
    pressedColor,
  } = toolbarPreferences;

  return (
    <div className="h-full w-full no-scrollbar overflow-y-hidden overflow-x-scroll">
      <div className="h-full w-fit min-w-fit m-auto flex-shrink-0 flex items-center">
        <style>
          {`
            .toolbarButton {
              background-color: ${backgroundColor};
            }

            .toolbarButton:hover {
              background-color: ${hoverColor};
            }
          `}
        </style>
        <button
          className="toolbarButton flex-shrink-0"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          }}
          onClick={() => editor.commands.undo()}
        >
          <span className="icon-[material-symbols-light--undo] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          }}
          onClick={() => editor.commands.redo()}
        >
          <span className="icon-[material-symbols-light--redo] w-full h-full text-white"></span>
        </button>
        <div
          className="w-px h-[70%]"
          style={{ backgroundColor: `${dividerColor}` }}
        ></div>
        <TextFormatButton
          editor={editor}
          toolbarPreferences={toolbarPreferences}
        />
        <div
          className="w-px h-[70%]"
          style={{ backgroundColor: `${dividerColor}` }}
        ></div>
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
          <span className="icon-[material-symbols-light--format-bold] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("italic") ? pressedColor : "",
          }}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="icon-[material-symbols-light--format-italic] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("strike") ? pressedColor : "",
          }}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="icon-[material-symbols-light--format-strikethrough] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("underline") ? pressedColor : "",
          }}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="icon-[proicons--text-underline] w-full h-full text-white"></span>
        </button>
        <HighlightButton
          editor={editor}
          toolbarPreferences={toolbarPreferences}
        />
        <button
          className="toolbarButton p-1 pb-px"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("subscript") ? pressedColor : "",
          }}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <span className="icon-[proicons--text-subscript] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton p-1 pt-px"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("superscript") ? pressedColor : "",
          }}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <span className="icon-[proicons--text-superscript] w-full h-full text-white"></span>
        </button>
        <div
          className="w-px h-[70%]"
          style={{ backgroundColor: `${dividerColor}` }}
        ></div>
        <button
          className="toolbarButton p-1"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("blockquote") ? pressedColor : "",
          }}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <span className="icon-[material-symbols-light--format-quote] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("bulletList") ? pressedColor : "",
          }}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <span className="icon-[material-symbols-light--format-list-bulleted] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("orderedList") ? pressedColor : "",
          }}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <span className="icon-[material-symbols-light--format-list-numbered] w-full h-full text-white"></span>
        </button>
        <div
          className="w-px h-[70%]"
          style={{ backgroundColor: `${dividerColor}` }}
        ></div>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive({ textAlign: "left" })
              ? pressedColor
              : "",
          }}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <span className="icon-[material-symbols-light--format-align-left] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive({ textAlign: "center" })
              ? pressedColor
              : "",
          }}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <span className="icon-[material-symbols-light--format-align-center] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive({ textAlign: "right" })
              ? pressedColor
              : "",
          }}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <span className="icon-[material-symbols-light--format-align-right] w-full h-full text-white"></span>
        </button>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive({ textAlign: "justify" })
              ? pressedColor
              : "",
          }}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <span className="icon-[material-symbols-light--format-align-justify] w-full h-full text-white"></span>
        </button>
        <div
          className="w-px h-[70%]"
          style={{ backgroundColor: `${dividerColor}` }}
        ></div>
        <button
          className="toolbarButton"
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
            backgroundColor: editor.isActive("horizontalRule")
              ? pressedColor
              : "",
          }}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <span className="icon-[material-symbols-light--horizontal-rule] w-full h-full text-white"></span>
        </button>
        {/* <div className="w-px h-[70%]" style={{backgroundColor: `${dividerColor}`}}></div> */}
      </div>
    </div>
  );
};

export default TipTapToolbar;
