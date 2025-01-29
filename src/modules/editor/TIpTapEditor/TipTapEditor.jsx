import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import Collaboration from "@tiptap/extension-collaboration";
import Bold from "@tiptap/extension-bold";
import React, { useState } from "react";
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
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'

const content = "<p>Hello World!</p>";

// const editorPreferences = {
//   paperPreferences: {
//     width: 55,
//     gapTop: 2,
//     marginTop: 5,
//     marginLeft: 6,
//     marginRight: 6,
//     font: "serif",
//     fontSize: 1.25,
//     lineHeight: 1.75,
//     backgroundColor: "#171717",
//     paperColor: "#171717",
//     paperBorderColor: "#e5e5e5",
//     roundRadius: 0.75,
//     paperShadow: "xl",
//     paperShadowColor: "#000",
//   },
//   toolbarPreferences: {
//     marginTop: 0.25,
//     marginBottom: 0.25,
//     marginLeft: 0.25,
//     marginRight: 0.25,
//     buttonHeight: 2.3,
//     buttonWidth: 2,
//     backgroundColor: "#171717",
//     buttonColor: "#171717",
//     dividerColor: "#232323",
//   },
// };

const TiptapEditor = ({ yDoc }) => {
  console.log("editor rendered");

  const [editorPreferencesState, setEditorPreferencesState] = useState({
    paperPreferences: {
      width: 55,
      gapTop: 3,
      marginTop: 5,
      marginLeft: 6,
      marginRight: 6,
      font: "serif",
      fontSize: 1.25,
      lineHeight: 1.75,
      backgroundColor: "#171717",
      paperBorderWidth: 1,
      paperColor: "#171717",
      paperBorderColor: "#525252",
      roundRadius: 0.75,
      paperShadow: "xl",
      paperShadowColor: "#000",
    },
    toolbarPreferences: {
      marginTop: 0.25,
      marginBottom: 0.25,
      marginLeft: 0.25,
      marginRight: 0.25,
      buttonHeight: 2.3,
      buttonWidth: 2,
      backgroundColor: "#171717",
      buttonColor: "#171717",
      dividerColor: "#232323",
    },
  });

  const editor = useEditor(
    {
      content,
      extensions: [
        Document,
        Paragraph,
        Text,
        Collaboration.configure({
          fragment: yDoc.getXmlFragment("body"),
        }),
        VirtualCursor,
        TabIndentExtension.configure({
          spaces: 8, // Set the tab size to 4 spaces
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
          types: ['heading', 'paragraph'],
        }),
      ],
      /**
       * This option gives us the control to enable the default behavior of rendering the editor immediately.
       */
      immediatelyRender: true,
      /**
       * This option gives us the control to disable the default behavior of re-rendering the editor on every transaction.
       */
      shouldRerenderOnTransaction: false,
      onUpdate({ editor }) {
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

        const coords = editor.view.coordsAtPos(selection.from);

        // Reference the scrollable container
        const container = document.getElementById("EditableContainer");
        const containerRect = container.getBoundingClientRect();

        // Calculate selection's position relative to the container
        const relativeY = coords.top - containerRect.top;
        const buffer = 200; // Pixels from the edge before scrolling
        const bottomBuffer = 400;

        // Calculate scroll adjustment
        let scrollAdjustment = 0;

        if (relativeY + bottomBuffer > container.clientHeight) {
          // Selection is too close to the bottom
          scrollAdjustment = relativeY + bottomBuffer - container.clientHeight;
        } else if (relativeY < buffer) {
          // Selection is too close to the top
          scrollAdjustment = relativeY - buffer;
        }

        // Scroll the container if necessary
        if (scrollAdjustment !== 0) {
          container.scrollBy({
            top: scrollAdjustment,
            behavior: "smooth",
          });
        }
      },
    },
    [yDoc]
  );

  const editorState = useEditorState({
    editor,
    // This function will be called every time the editor state changes
    selector: ({ editor }) => ({
      // It will only re-render if the when these markings or nodes change
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
      isAlign: editor.isActive("textAlign")
    }),
  });

  const { fontSize, lineHeight } = editorPreferencesState.paperPreferences;

  return (
    <div id="EditorContainer" className="h-full w-full flex flex-col">
      <style>
        {`
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
            margin: 0;
          }

          #EditorContainer ol {
            padding: 0 1rem;
            margin: 1.25rem 1rem 1.25rem 0.4rem;
            list-style-type: decimal;


            li p {
              margin-top: 0.25em;
              margin-bottom: 0.25em;
            }
          }

          #EditorContainer ul {
            padding: 0 1rem;
            margin: 1.25rem 1rem 1.25rem 0.4rem;
            list-style-type: disc;


            li p {
              margin-top: 0.25em;
              margin-bottom: 0.25em;
            }
          }

          #EditorContainer hr {
            cursor: pointer;
            margin: 2rem 0;
            border-top: 1px solid hsl(var(--border-bright));

            
          }
        `}
      </style>
      <div
        id="EditableToolbar"
        className={`h-fit px-1 pt-1 pb-2 border-border rounded-t-[0.5rem]`}
      >
        <TipTapToolbar editor={editor} />
      </div>
      <div
        id="EditableContainer"
        className="flex-grow w-full flex justify-center border-t border-border-bright overflow-y-scroll min-h-0 text-neutral-200 shadow-inner shadow-shadow"
      >
        <EditorContent
          editor={editor}
          className={`caret-transparent h-fit outline-none focus:outline-none relative
            shadow-${editorPreferencesState.paperPreferences.paperShadow}
            shadow-xl
            shadow-black
            font-serif
            `}
          style={{
            width: `${editorPreferencesState.paperPreferences.width}rem`,
            borderTopWidth: `${editorPreferencesState.paperPreferences.paperBorderWidth}px`,
            borderRightWidth: `${editorPreferencesState.paperPreferences.paperBorderWidth}px`,
            borderBottomWidth: `${editorPreferencesState.paperPreferences.paperBorderWidth}px`,
            borderLeftWidth: `${editorPreferencesState.paperPreferences.paperBorderWidth}px`,
            borderTopColor: `${editorPreferencesState.paperPreferences.paperBorderColor}`,
            borderLeftColor: `${editorPreferencesState.paperPreferences.paperBorderColor}`,
            borderRightColor: `${editorPreferencesState.paperPreferences.paperBorderColor}`,
            marginTop: `${editorPreferencesState.paperPreferences.gapTop}rem`,
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

  // Get the font size of the current selection
  const domSelection = window.getSelection();
  const anchorNode = domSelection.anchorNode;

  if (anchorNode?.parentElement) {
    console.log("element and parent: ", anchorNode, anchorNode.parentElement);
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
