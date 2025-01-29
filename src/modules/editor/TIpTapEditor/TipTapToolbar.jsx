import { useCallback, useEffect, useState } from "react";
import WritingAppButton from "../../design-system/WritingAppButton";
import TextFormatButton from "./HeadingButton";
import HighlightButton from "./HighlightButton";

const TipTapToolbar = ({ editor }) => {
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
    <div className="h-full w-full flex justify-start items-center px-1">
      <WritingAppButton
        className="w-[2.3rem] h-[2rem] hover:bg-hover ml-1 rounded-[0.35rem] "
        reversed
        onClick={() => editor.commands.undo()}
        buttonContent={
          <span className="icon-[material-symbols-light--undo] w-full h-full text-white"></span>
        }
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] hover:bg-hover rounded-[0.35rem] mr-1 "
        reversed
        onClick={() => editor.commands.redo()}
        buttonContent={
          <span className="icon-[material-symbols-light--redo] w-full h-full text-white"></span>
        }
      />

      <div className="w-0 h-[2rem] border-border border-l"></div>

      <TextFormatButton editor={editor} />

      <div className="w-0 h-[2rem] border-border border-l"></div>

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] hover:bg-hover rounded-[0.35rem] ml-1 mr-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().toggleBold().run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-bold] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("bold")}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().toggleItalic().run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-italic] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("italic")}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().toggleStrike().run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-strikethrough] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("strike")}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        buttonContent={
          <span className="icon-[proicons--text-underline] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("underline")}
      />

      <HighlightButton editor={editor} />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-1 pt-[0.4rem] hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        buttonContent={
          <span className="icon-[proicons--text-subscript] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("subscript")}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-1 pb-[0.4rem] hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        buttonContent={
          <span className="icon-[proicons--text-superscript] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("superscript")}
      />

      <div className="w-0 h-[2rem] border-border border-l"></div>

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-1 pb-[0.4rem] hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-quote] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("blockquote")}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-px hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-list-bulleted] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("bulletList")}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-px  hover:bg-hover rounded-[0.35rem] mx-[0.125rem] mr-1 "
        reversed
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-list-numbered] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive("orderedList")}
      />

      <div className="w-0 h-[2rem] border-border border-l"></div>

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-px hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-align-left] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive({ textAlign: "left" })}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-px hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-align-center] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive({ textAlign: "center" })}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-px hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-align-right] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive({ textAlign: "right" })}
      />

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-px hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        buttonContent={
          <span className="icon-[material-symbols-light--format-align-justify] w-full h-full text-white"></span>
        }
        isPressed={editor.isActive({ textAlign: "justify" })}
      />

      <div className="w-0 h-[2rem] border-border border-l"></div>

      <WritingAppButton
        className="w-[2.3rem] h-[2rem] p-px hover:bg-hover rounded-[0.35rem] mx-[0.125rem] "
        reversed
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        buttonContent={
          <span className="icon-[material-symbols-light--horizontal-rule] w-full h-full text-white"></span>
        }
      />

      <div className="w-0 h-[2rem] border-border border-l"></div>
    </div>
  );
};

export default TipTapToolbar;
