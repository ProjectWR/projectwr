import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import Collaboration from "@tiptap/extension-collaboration";
import Bold from "@tiptap/extension-bold";
import React, { useEffect, useRef, useState } from "react";
import VirtualCursor from "./Extensions/VirtualCursorExtension";
import TipTapToolbar from "./TipTapToolbar";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Blockquote from "@tiptap/extension-blockquote";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import OrderedList from "@tiptap/extension-ordered-list";
import TabIndentExtension from "./Extensions/TabIndentExtension";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import { useDeviceType } from "../../app/ConfigProviders/DeviceTypeProvider";

const content = "<p>Hello World!</p>";

// Separate default preferences for desktop
const desktopDefaultPreferences = {
  paperPreferences: {
    width: 55,
    gapTop: 3,
    paddingTop: 5, // Updated from marginTop
    paddingLeft: 6, // Updated from marginLeft
    paddingRight: 6, // Updated from marginRight
    paddingBottom: 40, // Updated from marginBottom
    font: "serif",
    fontSize: 1.25,
    lineHeight: 1.75,
    backgroundColor: "#171717",
    paperBorderWidth: 1,
    paperColor: "#171717",
    paperBorderColor: "#525252",
    roundRadius: 0,
    paperShadow: "xl",
    paperShadowColor: "#000",
    listPaddingLeft: 1,
    listMarginTop: 1.25,
    listMarginBottom: 1.25,
    hrMarginTop: 2,
    hrMarginBottom: 2,
    hrBorderColor: "white",
  },
  toolbarPreferences: {
    toolbarHeight: 3.3,
    toolbarButtonHeight: 2.3,
    marginTop: 0.25,
    marginBottom: 0.25,
    marginLeft: 0.25,
    marginRight: 0.25,
    buttonHeight: 2.3,
    buttonWidth: 2,
    backgroundColor: "#171717",
    buttonColor: "#171717",
    dividerColor: "#232323",
    hoverColor: "#121212",
  },
};

// Mobile preferences updated with padding
const mobileDefaultPreferences = {
  paperPreferences: {
    width: 55,
    gapTop: 0,
    paddingTop: 1.2, // Updated from marginTop
    paddingLeft: 1.2, // Updated from marginLeft
    paddingRight: 1.2, // Updated from marginRight
    paddingBottom: 20, // Updated from marginBottom
    font: "serif",
    fontSize: 1.1,
    lineHeight: 1.5,
    backgroundColor: "#171717",
    paperBorderWidth: 1,
    paperColor: "#171717",
    paperBorderColor: "#525252",
    roundRadius: 0,
    paperShadow: "none",
    paperShadowColor: "#000",
    listPaddingLeft: 1,
    listMarginTop: 1.25,
    listMarginBottom: 1.25,
    hrMarginTop: 2,
    hrMarginBottom: 2,
    hrBorderColor: "white",
  },
  toolbarPreferences: {
    toolbarHeight: 2.8,
    toolbarButtonHeight: 2.3,
    marginTop: 0.25,
    marginBottom: 0.25,
    marginLeft: 0.25,
    marginRight: 0.25,
    buttonHeight: 2.3,
    buttonWidth: 3,
    backgroundColor: "#171717",
    buttonColor: "#171717",
    dividerColor: "#232323",
    textFormatButtonWidth: 10,
    hoverColor: "#121212",
    pressedColor: "#080808",
  },
};

const TiptapEditor = ({ yXmlFragment, setHeaderOpened }) => {
  const { deviceType } = useDeviceType();
  const isMobile = deviceType === "mobile";

  const lastScrollTopRef = useRef(0); // Stores last scroll position

  const [editorPreferencesState, setEditorPreferencesState] = useState(
    isMobile ? mobileDefaultPreferences : desktopDefaultPreferences
  );

  useEffect(() => {
    const container = document.getElementById("EditableContainer");
    if (!container || !isMobile) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;

      // Detect scrolling up
      if (currentScrollTop < lastScrollTopRef.current) {
        setHeaderOpened(true);
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isMobile, setHeaderOpened]);

  const editor = useEditor(
    {
      content,
      extensions: [
        Document,
        Paragraph,
        Text,
        Collaboration.configure({
          fragment: yXmlFragment,
        }),
        VirtualCursor,
        TabIndentExtension.configure({
          spaces: 8,
        }),
        Strike,
        Bold,
        Italic,
        Underline,
        Subscript,
        Superscript,
        TextStyle.configure({ mergeNestedSpanStyles: true }),
        Highlight.configure({ multicolor: true }),
        Blockquote,
        ListItem,
        BulletList,
        OrderedList,
        HardBreak,
        Heading.configure({
          levels: [1, 2, 3, 4, 5],
        }),
        HorizontalRule,
        Image,
        Typography,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
      ],
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      onSelectionUpdate({ editor }) {
        const selection = editor.state.selection;
        if (!selection.empty) {
          editor.commands.hideVirtualCursor();
          return;
        }
        updateVirtualCursor(
          editor,
          editorPreferencesState.paperPreferences.fontSize
        );
      },
      onFocus({ editor }) {
        const selection = editor.state.selection;
        if (!selection.empty) {
          editor.commands.hideVirtualCursor();
          return;
        }
        updateVirtualCursor(
          editor,
          editorPreferencesState.paperPreferences.fontSize
        );
      },
      onBlur({ editor }) {
        editor.commands.hideVirtualCursor();
      },
      onUpdate({ editor }) {
        console.log("Editor Updated");
        const selection = editor.state.selection;
        if (selection.empty) {
          updateVirtualCursor(
            editor,
            editorPreferencesState.paperPreferences.fontSize
          );
        } else {
          editor.commands.hideVirtualCursor();
        }

        const coords = editor.view.coordsAtPos(selection.from);
        const container = document.getElementById("EditableContainer");
        const containerRect = container.getBoundingClientRect();
        const relativeY = coords.top - containerRect.top;

        let buffer = isMobile ? 100 : 200;
        let bottomBuffer = isMobile ? 200 : 400;

        let scrollAdjustment = 0;

        if (relativeY + bottomBuffer > container.clientHeight) {
          scrollAdjustment = relativeY + bottomBuffer - container.clientHeight;
          setHeaderOpened(false);
        } else if (relativeY < buffer) {
          scrollAdjustment = relativeY - buffer;
        }

        if (scrollAdjustment !== 0) {
          console.log("Scroll adjustment: ", scrollAdjustment);

          setTimeout(() => {
            container.scrollBy({
              top: scrollAdjustment,
              behavior: "smooth",
            });
          }, 2);
        }
      },
    },
    [yXmlFragment]
  );

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
    }),
  });

  const {
    fontSize,
    lineHeight,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    listPaddingLeft,
    listMarginTop,
    listMarginBottom,
    hrMarginTop,
    hrMarginBottom,
    hrBorderColor,
  } = editorPreferencesState.paperPreferences;

  return (
    <div id="EditorContainer" className="h-full w-full flex flex-col">
      <style>
        {`
          .tiptap {
            min-height: 20rem;
            padding: ${paddingTop}rem 
                      ${paddingRight}rem 
                      ${paddingBottom}rem 
                      ${paddingLeft}rem;
          }

          #EditorContainer h1 {
            font-size: ${fontSize * 2}rem;
            line-height: ${lineHeight * 2}rem;
            margin-bottom: ${lineHeight}rem;
          }
          #EditorContainer h2 {
            font-size: ${fontSize * 1.5}rem;
            line-height: ${lineHeight * 1.5}rem;
            margin-bottom: ${lineHeight * 0.75}rem;
          }
          #EditorContainer h3 {
            font-size: ${fontSize * 1.3}rem;
            line-height: ${lineHeight * 1.3}rem;
            margin-bottom: ${lineHeight * 0.65}rem;
          }
          #EditorContainer h4 {
            font-size: ${fontSize * 1.2}rem;
            line-height: ${lineHeight * 1.2}rem;
            margin-bottom: ${lineHeight * 0.55}rem;
          }
          #EditorContainer h5 {
            font-size: ${fontSize * 1.1}rem;
            line-height: ${lineHeight * 1.1}rem;
            margin-bottom: ${lineHeight * 0.45}rem;
          }

          #EditorContainer p {
            font-size: ${fontSize}rem;
            line-height: ${lineHeight}rem;
            margin: 0;
          }

          #EditorContainer {
            font-size: ${fontSize}rem;
            line-height: ${lineHeight}rem;
          }

          #EditorContainer ol, #EditorContainer ul {
            padding-left: ${listPaddingLeft}rem;
            margin: ${listMarginTop}rem 1rem ${listMarginBottom}rem 0.4rem;
          }

          #EditorContainer hr {
            cursor: pointer;
            margin: ${hrMarginTop}rem 0 ${hrMarginBottom}rem 0;
            border-top: 1px solid ${hrBorderColor};
          }
        `}
      </style>

      <div
        id="EditableToolbar"
        style={{
          boxShadow: "0 -1px 6px -1px hsl(var(--appLayoutShadow))",
          height: `${editorPreferencesState.toolbarPreferences.toolbarHeight}rem`,
          minHeight: `${editorPreferencesState.toolbarPreferences.toolbarHeight}rem`,
          backgroundColor: `${editorPreferencesState.toolbarPreferences.backgroundColor}`,
          borderTop: `1px solid ${editorPreferencesState.toolbarPreferences.dividerColor}`,
        }}
        className={`
            w-full min-w-0
            no-scrollbar ${isMobile ? "order-last" : "order-first"}
          `}
      >
        <TipTapToolbar
          editor={editor}
          toolbarPreferences={editorPreferencesState.toolbarPreferences}
        />
      </div>
      <div
        id="EditableContainer"
        className={`flex-grow w-full flex justify-center 
           overflow-y-scroll min-h-0 text-neutral-200 z-1 ${
             isMobile
               ? "no-scrollbar border-white"
               : "pl-[0.75rem] border-t border-white"
           }`}
      >
        <EditorContent
          editor={editor}
          className={`caret-transparent h-fit outline-none focus:outline-none
            shadow-${
              isMobile
                ? "none"
                : editorPreferencesState.paperPreferences.paperShadow
            }
            shadow-black
            font-serif
            `}
          style={{
            width: isMobile
              ? "100%"
              : `${editorPreferencesState.paperPreferences.width}rem`,
            borderTopWidth: isMobile
              ? "0"
              : `${editorPreferencesState.paperPreferences.paperBorderWidth}px`,
            borderRightWidth: isMobile
              ? "0"
              : `${editorPreferencesState.paperPreferences.paperBorderWidth}px`,
            borderBottomWidth: isMobile
              ? "0"
              : `${editorPreferencesState.paperPreferences.paperBorderWidth}px`,
            borderLeftWidth: isMobile
              ? "0"
              : `${editorPreferencesState.paperPreferences.paperBorderWidth}px`,
            borderTopColor: `${editorPreferencesState.paperPreferences.paperBorderColor}`,
            borderLeftColor: `${editorPreferencesState.paperPreferences.paperBorderColor}`,
            borderRightColor: `${editorPreferencesState.paperPreferences.paperBorderColor}`,
            marginTop: isMobile
              ? "0"
              : `${editorPreferencesState.paperPreferences.gapTop}rem`,
            fontSize: `${editorPreferencesState.paperPreferences.fontSize}rem`,
            lineHeight: `${editorPreferencesState.paperPreferences.lineHeight}rem`,
            borderTopRightRadius: `${editorPreferencesState.paperPreferences.roundRadius}rem`,
            borderTopLeftRadius: `${editorPreferencesState.paperPreferences.roundRadius}rem`,
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(TiptapEditor);

const updateVirtualCursor = (editor, fontSize) => {
  const selection = editor.state.selection;
  if (!selection.empty) {
    editor.commands.hideVirtualCursor();
    return;
  }

  const editable = document.querySelector(".tiptap");
  const editableRect = editable.getBoundingClientRect();
  const coords = editor.view.coordsAtPos(selection.from);

  const domSelection = window.getSelection();
  const anchorNode = domSelection.anchorNode;

  if (anchorNode?.parentElement) {
    if (anchorNode.parentElement.tagName === "DIV") {
      const computedStyle = getComputedStyle(anchorNode);
      fontSize = parseFloat(computedStyle.fontSize) || fontSize;
    } else {
      const computedStyle = getComputedStyle(anchorNode.parentElement);
      fontSize = parseFloat(computedStyle.fontSize) || fontSize;
    }
  }

  editor.commands.addVirtualCursor({
    top: coords.top - editableRect.top,
    left: coords.left - editableRect.left,
    fontSize: fontSize,
  });
};
