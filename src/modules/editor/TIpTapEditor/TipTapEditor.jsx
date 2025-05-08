import React, { useEffect, useMemo, useRef, useState } from "react";
import TipTapToolbar from "./TipTapToolbar";

import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import Collaboration from "@tiptap/extension-collaboration";
import Bold from "@tiptap/extension-bold";
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
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";

import { ContextMenu } from "radix-ui";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";

import { useDeviceType } from "../../app/ConfigProviders/DeviceTypeProvider";
import { TipTapEditorDefaultPreferences } from "./TipTapEditorDefaultPreferences";
import loremIpsum from "../lorem";
import ProsemirrorProofreadExtension from "./Extensions/ProsemirrorProofreadExtension";
import ProsemirrorVirtualCursor from "./Extensions/ProsemirrorVirtualCursorExtension";
import dictionaryManager from "../../app/lib/dictionary";
import { wait } from "lib0/promise";
import { appStore } from "../../app/stores/appStore";
import ContextMenuWrapper from "../../app/components/LayoutComponents/ContextMenuWrapper";
import { Indent } from "./Extensions/indent";

const content = "<p>Hello World!</p>";

const { desktopDefaultPreferences, mobileDefaultPreferences } =
  TipTapEditorDefaultPreferences;

const TiptapEditor = ({
  hunspell,
  yXmlFragment,
  setHeaderOpened,
  mode = "editPaper",
  preferences,
}) => {
  console.log("Tiptap Editor Rendering");

  const { deviceType } = useDeviceType();
  const isMobile = deviceType === "mobile";

  const [editorRef, setEditorFocus] = useFocus();

  const lastScrollTopRef = useRef(0); // Stores last scroll position

  const defaultPreferences = isMobile
    ? mobileDefaultPreferences
    : desktopDefaultPreferences;

  const editorPreferences = { ...defaultPreferences, ...preferences };

  const paperPreferences = {
    ...defaultPreferences.paperPreferences,
    ...preferences?.paperPreferences,
  };

  const toolbarPreferences = {
    ...defaultPreferences.toolbarPreferences,
    ...preferences?.toolbarPreferences,
  };

  const setSearchQuery = appStore((state) => state.setSearchQuery);
  const [selectingError, setSelectingError] = useState("");

  const {
    width,
    gapTop,
    paddingTop, // Updated from marginTop
    paddingLeft, // Updated from marginLeft
    paddingRight, // Updated from marginRight
    paddingBottom, // Updated from marginBottom
    font,
    fontSize,
    lineHeight,
    marginBottom,
    backgroundColor,
    paperBorderWidth,
    paperColor,
    paperBorderColor,
    roundRadius,
    paperShadow,
    paperShadowColor,

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

    blockquoteBorderWidth,
    blockquotePadding,
    blockquoteBorderColor,
  } = paperPreferences;

  const { dividerColor } = toolbarPreferences;

  const extensions = useRef([
    Document,
    Paragraph,
    Text,
    Collaboration.configure({
      fragment: yXmlFragment,
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
    ProsemirrorProofreadExtension,
    ProsemirrorVirtualCursor,
    Indent.configure({
      types: ["listItem", "paragraph"],
      minLevel: 0,
      maxLevel: 4,
    }),
  ]);

  const previewTemplateExtensions = useRef([
    Document,
    Paragraph,
    Text,
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

  const editor = useEditor({
    content: mode === "previewTemplate" ? loremIpsum : content,
    extensions:
      mode === "previewTemplate"
        ? previewTemplateExtensions.current
        : extensions.current,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    onUpdate({ editor }) {
      console.log("UPDATE!");
      console.log("Editor Updated");
      const selection = editor.state.selection;
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
    onSelectionUpdate({ editor }) {
      const domSelection = window.getSelection();
      let errorText = "";
      if (domSelection?.anchorNode) {
        let node = domSelection.anchorNode.parentElement;
        while (node) {
          if (
            node.tagName.toLowerCase() === "span" &&
            node.classList.contains("spelling-error")
          ) {
            errorText = node.textContent;
            break;
          }
          node = node.parentElement;
        }
      }
      console.log("Selecting Error Text:", errorText);
      setSelectingError(errorText);
    },
  });

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

  const options = useMemo(() => {
    const options = [];

    if (selectingError.trim().length > 0) {
      options.push({
        label: "Add word to dictionary",
        icon: (
          <span className="icon-[material-symbols-light--add-2-rounded] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
        ),
        action: async () => {
          dictionaryManager.addOrUpdateWord(selectingError, "", "");
          await wait(1000);
          editor.commands.forceSpellcheck();
        },
      });
    }

    options.push(
      ...[
        {
          label: "Search in your library",
          icon: (
            <span className="icon-[material-symbols-light--search] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          action: () => {
            const textSelection = window.getSelection()?.toString().trim();
            setSearchQuery(textSelection);
            console.log(document.getElementById("searchInput"));
            setTimeout(() => {
              document.getElementById("searchInput").focus();
            }, 100);
          },
        },

        {
          label: "Use Ctrl+C to Copy",
          icon: (
            <span className="icon-[material-symbols-light--content-copy-outline] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          disabled: true,
        },

        {
          label: "Use Ctrl+V to Paste",
          icon: (
            <span className="icon-[material-symbols-light--content-paste] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          disabled: true,
        },

        {
          label: "Use Ctrl+X to Cut",
          icon: (
            <span className="icon-[material-symbols-light--content-cut] h-optionsDropdownIconHeight w-optionsDropdownIconHeight"></span>
          ),
          disabled: true,
        },
      ]
    );

    console.log("OPTIONS: ", options);

    return options;
  }, [editor, selectingError, setSearchQuery]);

  return (
    <ContextMenuWrapper options={options}>
      <div
        id="EditorContainer"
        className="h-full w-full flex flex-col items-center bg-appBackgroundAccent"
      >
        <style>
          {`
          .tiptap {
            min-height: calc(20rem * var(--uiScale));
            padding: calc(${paddingTop}rem * var(--uiScale))
                     calc(${paddingRight}rem * var(--uiScale))
                     calc(${paddingBottom}rem / var(--uiScale))
                     calc(${paddingLeft}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }

          #EditorContainer h1 {
            font-size: calc(${h1FontSize}rem * var(--uiScale));
            line-height: calc(${h1LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h1MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }
          #EditorContainer h2 {
            font-size: calc(${h2FontSize}rem * var(--uiScale));
            line-height: calc(${h2LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h2MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }
          #EditorContainer h3 {
            font-size: calc(${h3FontSize}rem * var(--uiScale));
            line-height: calc(${h3LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h3MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }
          #EditorContainer h4 {
            font-size: calc(${h4FontSize}rem * var(--uiScale));
            line-height: calc(${h4LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h4MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }
          #EditorContainer h5 {
            font-size: calc(${h5FontSize}rem * var(--uiScale));
            line-height: calc(${h5LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h5MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }

          #EditorContainer p {
            font-size: calc(${fontSize}rem * var(--uiScale));
            line-height: calc(${lineHeight}rem * var(--uiScale));
            margin-bottom: calc(${marginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
            margin: 0;
          }

          #EditorContainer {
            font-size: calc(${fontSize}rem * var(--uiScale));
            line-height: calc(${lineHeight}rem * var(--uiScale));
          }

          #EditorContainer ol,
          #EditorContainer ul {
            padding-left: calc(${listPaddingLeft}rem * var(--uiScale));
            margin: calc(${listMarginTop}rem * var(--uiScale)) 1rem calc(${listMarginBottom}rem * var(--uiScale)) 0.4rem;
          }

          #EditorContainer ul {
            list-style: circle;
          }

          #EditorContainer ol {
            list-style: lower;
          }

          #EditorContainer hr {
            cursor: pointer;
            margin: calc(${hrMarginTop}rem * var(--uiScale)) 0 calc(${hrMarginBottom}rem * var(--uiScale)) 0;
            border-top: 1px solid ${hrBorderColor};
          }

          #EditorContainer blockquote {
            padding-left: ${blockquotePadding}rem;
            border-left: ${blockquoteBorderWidth}rem solid ${blockquoteBorderColor};
          }

          .spelling-error {
            background-color: #ff00001a;
            border-top-left-radius: calc(3px * var(--uiScale));
            border-top-right-radius: calc(3px * var(--uiScale));
            border-bottom: 1px solid #ff0000e6;
          }

          [data-indent='1'] {
            padding-left: calc(1 * 3rem);
          }

          [data-indent='2'] {
            padding-left: calc(2 * 3rem);
          }
          
          [data-indent='3'] {
            padding-left: calc(3 * 3rem);
          }
          
          [data-indent='4'] {
            padding-left: calc(4 * 3rem);
          }

          
          
          
          

        `}
        </style>

        <div
          id="EditableContainer"
          className={`h-full w-full flex justify-start flex-col items-center relative
           overflow-y-scroll min-h-0 text-neutral-200
          `}
          style={{
            paddingLeft: `var(--scrollbarWidth)`,
            backgroundColor: backgroundColor,
          }}
        >
          <div
            id="EditableToolbar"
            style={{
              height: `calc(${toolbarPreferences.toolbarHeight}rem * var(--uiScale))`,
              minHeight: `calc(${toolbarPreferences.toolbarHeight}rem * var(--uiScale))`,
              backgroundColor: `${toolbarPreferences.backgroundColor}`,
              borderColor: `${dividerColor}`,
              top: `calc(${toolbarPreferences.toolbarGapTop}rem * var(--uiScale))`,
            }}
            className={`
            min-w-0 sticky
            ${
              isMobile
                ? "order-1 w-full"
                : "order-0 w-fit rounded-lg border shadow-md shadow-appLayoutGentleShadow relative z-2"
            }
          `}
          >
            <TipTapToolbar
              editor={editor}
              toolbarPreferences={toolbarPreferences}
            />
          </div>
          <EditorContent
            spellCheck={false}
            editor={editor}
            className={`h-fit outline-none focus:outline-none z-1
                  `}
            style={{
              width: width.endsWith("%")
                ? `${width}`
                : `calc(${width} * var(--uiScale))`,
              minWidth: width.endsWith("%")
                ? `${width}`
                : `calc(${width} * var(--uiScale))`,
              backgroundColor: `${paperColor}`,
              borderTopWidth: `${paperBorderWidth}px`,
              borderRightWidth: `${paperBorderWidth}px`,
              borderBottomWidth: `0`,
              borderLeftWidth: `${paperBorderWidth}px`,
              borderTopColor: `${paperBorderColor}`,
              borderLeftColor: `${paperBorderColor}`,
              borderRightColor: `${paperBorderColor}`,
              marginTop: `${gapTop}rem`,
              borderTopRightRadius: `${roundRadius}rem`,
              borderTopLeftRadius: `${roundRadius}rem`,
              boxShadow: `0px 0px ${paperShadow} ${paperShadowColor}`,
            }}
          />
        </div>
      </div>
    </ContextMenuWrapper>
  );
};

export default React.memo(TiptapEditor);

// const updateVirtualCursor = (editor, fontSize) => {
//   const selection = editor.state.selection;
//   if (!selection.empty) {
//     editor.commands.hideVirtualCursor();
//     return;
//   }

//   const editable = document.querySelector(".tiptap");
//   const editableRect = editable.getBoundingClientRect();
//   const coords = editor.view.coordsAtPos(selection.from);

//   const domSelection = window.getSelection();
//   const anchorNode = domSelection.anchorNode;

//   const minFontSize = fontSize + 2;

//   if (anchorNode?.parentElement) {
//     if (anchorNode.parentElement.tagName === "DIV") {
//       const computedStyle = getComputedStyle(anchorNode);
//       fontSize = parseFloat(computedStyle.fontSize) || fontSize;
//     } else {
//       console.log("HERRE IN UPDATE VIRTUAL CURSOR: ");
//       const computedStyle = getComputedStyle(anchorNode.parentElement);
//       fontSize = parseFloat(computedStyle.fontSize) || fontSize;
//     }
//   }

//   console.log("Font size in uvc: ", fontSize);

//   editor.commands.addVirtualCursor({
//     top: coords.top - editableRect.top,
//     left: coords.left - editableRect.left,
//     fontSize: max(fontSize, minFontSize),
//   });
// };

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};
