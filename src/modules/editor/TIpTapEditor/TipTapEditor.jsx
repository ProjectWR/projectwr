import React, { useEffect, useMemo, useRef, useState } from "react";
import VirtualCursor from "./Extensions/VirtualCursorExtension";
import TipTapToolbar from "./TipTapToolbar"

import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import Collaboration from "@tiptap/extension-collaboration";
import Bold from "@tiptap/extension-bold";;
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
import { TipTapEditorDefaultPreferences } from "./TipTapEditorDefaultPreferences";
import loremIpsum from "../lorem";
import { max } from "lib0/math";

const content = "<p>Hello World!</p>";

const { desktopDefaultPreferences, mobileDefaultPreferences } =
  TipTapEditorDefaultPreferences;

const TiptapEditor = ({
  yXmlFragment,
  setHeaderOpened,
  mode = "editPaper",
  preferences,
}) => {
  console.log("Tiptap Editor Rendering");

  const { deviceType } = useDeviceType();
  const isMobile = deviceType === "mobile";

  const lastScrollTopRef = useRef(0); // Stores last scroll position

  const defaultPreferences = isMobile
    ? mobileDefaultPreferences
    : desktopDefaultPreferences;
  const [editorPreferencesState, setEditorPreferencesState] = useState(
    preferences || defaultPreferences
  );

  const {
    fontSize,
    lineHeight,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,

    h1FontSize,
    h1LineHeight,
    h1MarginBottom,

    h2FontSize,
    h2LineHeight,
    h2MarginBottom,

    h3FontSize,
    h3LineHeight,
    h3MarginBottom,

    h4FontSize,
    h4LineHeight,
    h4MarginBottom,

    h5FontSize,
    h5LineHeight,
    h5MarginBottom,

    listPaddingLeft,
    listMarginTop,
    listMarginBottom,
    hrMarginTop,
    hrMarginBottom,
    hrBorderColor,
  } = editorPreferencesState.paperPreferences;

  const extensions = useRef([
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
  ]);

  const previewTemplateExtensions = useRef([
    Document,
    Paragraph,
    Text,
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
  ]);

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
      content: mode === "previewTemplate" ? loremIpsum : content,
      extensions:
        mode === "previewTemplate"
          ? previewTemplateExtensions.current
          : extensions.current,
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
          fontSize + 2
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
          fontSize + 2
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
            fontSize + 2
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
            font-size: ${h1FontSize}rem;
            line-height: ${h1LineHeight}rem;
            margin-bottom: ${h1MarginBottom}rem;
          }
          #EditorContainer h2 {
            font-size: ${h2FontSize}rem;
            line-height: ${h2LineHeight}rem;
            margin-bottom: ${h2MarginBottom}rem;
          }
          #EditorContainer h3 {
            font-size: ${h3FontSize}rem;
            line-height: ${h3LineHeight}rem;
            margin-bottom: ${h3MarginBottom}rem;
          }
          #EditorContainer h4 {
            font-size: ${h4FontSize}rem;
            line-height: ${h4LineHeight}rem;
            margin-bottom: ${h4MarginBottom}rem;
          }
          #EditorContainer h5 {
            font-size: ${h5FontSize}rem;
            line-height: ${h5LineHeight}rem;
            margin-bottom: ${h5MarginBottom}rem;
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
            ${isMobile ? "order-last" : "order-first"}
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
               ? "pl-[0.75rem]  border-white"
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

  const minFontSize = fontSize + 2;

  if (anchorNode?.parentElement) {
    if (anchorNode.parentElement.tagName === "DIV") {
      const computedStyle = getComputedStyle(anchorNode);
      fontSize = parseFloat(computedStyle.fontSize) || fontSize;
    } else {
      console.log("HERRE IN UPDATE VIRTUAL CURSOR: ");
      const computedStyle = getComputedStyle(anchorNode.parentElement);
      fontSize = parseFloat(computedStyle.fontSize) || fontSize;
    }
  }

  console.log("Font size in uvc: ", fontSize);

  editor.commands.addVirtualCursor({
    top: coords.top - editableRect.top,
    left: coords.left - editableRect.left,
    fontSize: max(fontSize, minFontSize),
  });
};
