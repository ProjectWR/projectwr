import { useCallback, useEffect, useState } from "react";
import TextFormatButton from "./HeadingButton";
import HighlightButton from "./HighlightButton";

const TipTapToolbar = ({ editor, toolbarPreferences }) => {
  const onUpdate = useCallback(() => {
    console.log("on update called!");
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      console.log("No Editor");
      return;
    }

    onUpdate();

    editor.on("update", onUpdate);

    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, onUpdate]);

  return (
    <div className="h-full w-full no-scrollbar overflow-visible overflow-x-scroll">
      <div className="h-full w-fit flex justify-start items-center">
        <button
          className="w-[2.3rem] h-[2rem] hover:bg-appLayoutHover ml-1 rounded-[0.35rem]"
          reversed
          onClick={() => editor.commands.undo()}
        >
          <span className="icon-[material-symbols-light--undo] w-full h-full text-white"></span>
        </button>

        <button
          className="w-[2.3rem] h-[2rem] hover:bg-appLayoutHover rounded-[0.35rem] mr-1"
          reversed
          onClick={() => editor.commands.redo()}
        >
          <span className="icon-[material-symbols-light--redo] w-full h-full text-white"></span>
        </button>

        <div className="w-0 h-[2rem] border-appLayoutBorder border-l"></div>

        <TextFormatButton editor={editor} />

        <div className="w-0 h-[2rem] border-appLayoutBorder border-l"></div>

        <button
          className={`w-[2.3rem] h-[2rem] hover:bg-appLayoutHover rounded-[0.35rem] ml-1 mr-[0.125rem] ${
            editor.isActive("bold")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span className="icon-[material-symbols-light--format-bold] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive("italic")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="icon-[material-symbols-light--format-italic] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive("strike")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="icon-[material-symbols-light--format-strikethrough] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive("underline")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="icon-[proicons--text-underline] w-full h-full text-white"></span>
        </button>

        <HighlightButton editor={editor} />

        <button
          className={`w-[2.3rem] h-[2rem] p-1 pt-[0.4rem] hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive("subscript")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <span className="icon-[proicons--text-subscript] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] p-1 pb-[0.4rem] hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive("superscript")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <span className="icon-[proicons--text-superscript] w-full h-full text-white"></span>
        </button>

        <div className="w-0 h-[2rem] border-appLayoutBorder border-l"></div>

        <button
          className={`w-[2.3rem] h-[2rem] p-1 pb-[0.4rem] hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive("blockquote")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <span className="icon-[material-symbols-light--format-quote] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] p-px hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive("bulletList")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <span className="icon-[material-symbols-light--format-list-bulleted] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] p-px hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] mr-1 ${
            editor.isActive("orderedList")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <span className="icon-[material-symbols-light--format-list-numbered] w-full h-full text-white"></span>
        </button>

        <div className="w-0 h-[2rem] border-appLayoutBorder border-l"></div>

        <button
          className={`w-[2.3rem] h-[2rem] p-px hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive({ textAlign: "left" })
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <span className="icon-[material-symbols-light--format-align-left] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] p-px hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive({ textAlign: "center" })
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <span className="icon-[material-symbols-light--format-align-center] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] p-px hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive({ textAlign: "right" })
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <span className="icon-[material-symbols-light--format-align-right] w-full h-full text-white"></span>
        </button>

        <button
          className={`w-[2.3rem] h-[2rem] p-px hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <span className="icon-[material-symbols-light--format-align-justify] w-full h-full text-white"></span>
        </button>

        <div className="w-0 h-[2rem] border-appLayoutBorder border-l"></div>

        <button
          className={`w-[2.3rem] h-[2rem] p-px hover:bg-appLayoutHover rounded-[0.35rem] mx-[0.125rem] ${
            editor.isActive("horizontalRule")
              ? "bg-appLayoutPressed shadw-inner shadow-appLayoutShadow"
              : ""
          }`}
          reversed
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <span className="icon-[material-symbols-light--horizontal-rule] w-full h-full text-white"></span>
        </button>

        <div className="w-0 h-[2rem] border-appLayoutBorder border-l"></div>
      </div>
    </div>
  );
};

export default TipTapToolbar;
