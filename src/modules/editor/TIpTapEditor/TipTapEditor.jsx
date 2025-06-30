import React, { useEffect, useMemo, useRef, useState } from "react";
import TipTapToolbar from "./TipTapToolbar";

import {
  useEditor,
  useEditorState,
  EditorContent,
  mergeAttributes,
  BubbleMenu,
  FloatingMenu,
} from "@tiptap/react";
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
import Mention from "@tiptap/extension-mention";

import { ContextMenu } from "radix-ui";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";

import CharacterCount from "@tiptap/extension-character-count";
import DragHandle from "@tiptap/extension-drag-handle-react";
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
import suggestion from "./Extensions/MentionExtension/suggestion";
import { getOrInitLibraryYTree } from "../../app/lib/ytree";
import dataManagerSubdocs from "../../app/lib/dataSubDoc";
import useMainPanel from "../../app/hooks/useMainPanel";
import { TableOfContentsPanel } from "./TableOfContentsPanel";
import useRefreshableTimer from "../../app/hooks/useRefreshableTimer";
import SearchAndReplace from "@sereneinserenade/tiptap-search-and-replace";
import TiptapFloatingToolbar from "./TiptapFloatingToolbar";
import TiptapUtilityToolbar from "./TiptapUtilityToolbar";
import { StatisticsPanel } from "./StatisticsPanel";
import { SearchReplacePanel } from "./SearchReplacePanel";

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

  const { activatePanel } = useMainPanel();

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

  const proofreadContextItems = appStore(
    (state) => state.proofreadContextItems
  );

  const setProofreadContextItems = appStore(
    (state) => state.setProofreadContextItems
  );

  const setSearchQuery = appStore((state) => state.setSearchQuery);
  const [selectingError, setSelectingError] = useState("");

  const [
    isTOCPanelAwake,
    refreshTOCPanel,
    keepTOCPanelAwake,
    forceCloseTOCPanel,
  ] = useRefreshableTimer({ time: 2000 });

  const [
    isStatsPanelAwake,
    refreshStatsPanel,
    keepStatsPanelAwake,
    forceCloseStatsPanel,
  ] = useRefreshableTimer({ time: 2000 });

  const [
    isSearchReplacePanelAwake,
    refreshSearchReplacePanel,
    keepSearchReplacePanelAwake,
    forceCloseSearchReplacePanel,
  ] = useRefreshableTimer({ time: 2000 });

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
    CharacterCount,
    SearchAndReplace.configure({
      searchResultClass: "search-result", // class to give to found items. default 'search-result'
      caseSensitive: false, // no need to explain
      disableRegex: false, // also no need to explain
    }),
    Indent.configure({
      types: ["listItem", "paragraph"],
      minLevel: 0,
      maxLevel: 4,
    }),
    Mention.configure({
      HTMLAttributes: {
        class: "mention",
      },
      suggestion,
      renderText({ options, node }) {
        console.log("NODE ATTRS: ", node.attrs);

        const libraryId = appStore.getState().libraryId;

        const id = node.attrs.id;

        if (!id) {
          return "-error-";
        }

        const libraryYTree = getOrInitLibraryYTree(libraryId);

        const label =
          libraryId === id
            ? dataManagerSubdocs
              .getLibrary(libraryId)
              ?.getMap("library_props")
              ?.toJSON().item_properties.item_title
            : libraryYTree.getNodeValueFromKey(id)?.toJSON()?.item_properties
              ?.item_title;

        return label;

        // return [
        //   "button",
        //   mergeAttributes(
        //     {
        //       onclick: `console.log("Clicked mention button");`,
        //     },
        //     options.HTMLAttributes
        //   ),
        //   `${options.suggestion.char}${label}`,
        // ];
      },
      renderHTML({ options, node }) {
        console.log("NODE ATTRS: ", node.attrs);

        const libraryId = appStore.getState().libraryId;

        const id = node.attrs.id;

        if (!id) {
          return ["span", mergeAttributes(options.HTMLAttributes), `Error`];
        }

        const libraryYTree = getOrInitLibraryYTree(libraryId);

        const label =
          libraryId === id
            ? dataManagerSubdocs
              .getLibrary(libraryId)
              ?.getMap("library_props")
              ?.toJSON().item_properties.item_title
            : libraryYTree.getNodeValueFromKey(id)?.toJSON()?.item_properties
              ?.item_title;

        const elem = document.createElement("span");

        elem.innerText = `${label}`;

        elem.wordBreak = `break-word`;

        elem.whiteSpace = `normal`;

        elem.addEventListener("click", () => {
          console.log("Clicked mention link");
          activatePanel("libraries", "details", [libraryId, id]);
        });

        elem.className = "mention";

        node.attrs.label = label;

        elem.dataset.id = id;
        elem.dataset.label = label;
        elem.dataset.type = "mention";

        return elem;

        // return [
        //   "button",
        //   mergeAttributes(
        //     {
        //       onclick: `console.log("Clicked mention button");`,
        //     },
        //     options.HTMLAttributes
        //   ),
        //   `${options.suggestion.char}${label}`,
        // ];
      },
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
      const selection = editor.state.selection;
      const coords = editor.view.coordsAtPos(selection.from);
      const container = document.getElementById("EditableContainer");
      if (!container) return;
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
        setTimeout(() => {
          container.scrollBy({
            top: scrollAdjustment,
            behavior: "smooth",
          });
        }, 2);
      }
    },
    onSelectionUpdate({ editor }) {
      setProofreadContextItems([]);
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
    }),
  });

  const options = useMemo(() => {
    const options = [];

    for (const contextItem of proofreadContextItems) {
      if (contextItem && contextItem.label) {
        if (contextItem.action) {
          options.push({
            label: contextItem.label,
            disabled: false,
            action: contextItem.action,
          });
        } else {
          options.push({
            label: contextItem.label,
            disabled: true,
          });
        }
      }
    }

    if (proofreadContextItems.length > 0) {
      options.push({
        label: "proofreadContextMenuDivider",
        isDivider: true,
      });
    }

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

    return options;
  }, [editor, selectingError, setSearchQuery, proofreadContextItems]);

  return (
    <ContextMenuWrapper options={options}>
      <div
        id="EditorContainer"
        className="h-full EditorStyles w-full max-w-full flex flex-col items-center bg-appBackgroundAccent relative"
      >
        <style>
          {`

          #EditableToolbar * {
            pointer-events: auto !important;
          }

          .EditorStyles .tiptap {
            pointer-events: auto !important;
            min-height: calc(20rem * var(--uiScale));
            padding: calc(${paddingTop}rem * var(--uiScale))
                     calc(${paddingRight}rem * var(--uiScale))
                     calc(${paddingBottom}rem / var(--uiScale))
                     calc(${paddingLeft}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }

          .EditorStyles h1 {
            font-size: calc(${h1FontSize}rem * var(--uiScale));
            line-height: calc(${h1LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h1MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }
          .EditorStyles h2 {
            font-size: calc(${h2FontSize}rem * var(--uiScale));
            line-height: calc(${h2LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h2MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }
          .EditorStyles h3 {
            font-size: calc(${h3FontSize}rem * var(--uiScale));
            line-height: calc(${h3LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h3MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }
          .EditorStyles h4 {
            font-size: calc(${h4FontSize}rem * var(--uiScale));
            line-height: calc(${h4LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h4MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }
          .EditorStyles h5 {
            font-size: calc(${h5FontSize}rem * var(--uiScale));
            line-height: calc(${h5LineHeight}rem * var(--uiScale));
            margin-bottom: calc(${h5MarginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
          }

          .EditorStyles p {
            font-size: calc(${fontSize}rem * var(--uiScale));
            line-height: calc(${lineHeight}rem * var(--uiScale));
            margin-bottom: calc(${marginBottom}rem * var(--uiScale));
            font-family: ${font}, serif ;
            margin: 0;
          }

          .EditorStyles {
            font-size: calc(${fontSize}rem * var(--uiScale));
            line-height: calc(${lineHeight}rem * var(--uiScale));
          }

          .EditorStyles ol,
          .EditorStyles ul {
            padding-left: calc(${listPaddingLeft}rem * var(--uiScale));
            margin: calc(${listMarginTop}rem * var(--uiScale)) 1rem calc(${listMarginBottom}rem * var(--uiScale)) 0.4rem;
          }

          .EditorStyles ul {
            list-style: circle;
          }

          .EditorStyles ol {
            list-style: lower;
          }

          .EditorStyles hr {
            cursor: pointer;
            margin: calc(${hrMarginTop}rem * var(--uiScale)) 0 calc(${hrMarginBottom}rem * var(--uiScale)) 0;
            border-top: 1px solid ${hrBorderColor};
          }

          .EditorStyles blockquote {
            padding-left: ${blockquotePadding}rem;
            border-left: ${blockquoteBorderWidth}rem solid ${blockquoteBorderColor};
          }

          .spelling-error {
            background-color: #ff00001a;
            border-top-left-radius: calc(3px * var(--uiScale));
            border-top-right-radius: calc(3px * var(--uiScale));
            border-bottom: 1px solid #ff0000e6;
          }

          .spelling-warning {
            background-color: #00FFFF1a;
            border-top-left-radius: calc(3px * var(--uiScale));
            border-top-right-radius: calc(3px * var(--uiScale));
            border-bottom: 1px solid #00FFFFe6;
          }

          .mention {
            background-color: #00FF331a;
            border-radius: 0.4rem;
            box-decoration-break: clone;
            padding: 0 0.25rem;
          }

          .mention:after{
            content: "\u200B";} 

          .mention:hover {
            background-color: #00FF3346;
          }

          .mention:active {
            background-color: #00FF33a6;
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

          
          .ProseMirror-focused {
            /* Color of the virtual cursor */
            --prosemirror-virtual-cursor-color: white;
          }

          .ProseMirror .prosemirror-virtual-cursor {
            position: absolute;
            cursor: text;
            pointer-events: none;
            transform: translate(-1px);
            user-select: none;
            -webkit-user-select: none;
            border-left: 2px solid var(--prosemirror-virtual-cursor-color);
          }

          .ProseMirror .prosemirror-virtual-cursor-left {
            width: 1ch;
            transform: translate(calc(-1ch + -1px));
            border-bottom: 2px solid var(--prosemirror-virtual-cursor-color);
            border-right: 2px solid var(--prosemirror-virtual-cursor-color);
            border-left: none;
          }

          .ProseMirror .prosemirror-virtual-cursor-right {
            width: 1ch;
            border-bottom: 2px solid var(--prosemirror-virtual-cursor-color);
            border-left: 2px solid var(--prosemirror-virtual-cursor-color);
            border-right: none;
          }

          .ProseMirror-focused .prosemirror-virtual-cursor-animation {
            animation: prosemirror-virtual-cursor-blink 1s linear infinite;
            animation-delay: 0.5s;
          }

          .search-result {
            background-color: #0000FFaa;
          }


          
        `}
        </style>

        {editor && (
          <>
            <div
              id="EditorTopPanelsContainer"
              className="absolute top-0 left-0 -translate-y-full w-full z-[3] h-[20rem] flex gap-1 justify-center items-center"
            >
              <SearchReplacePanel
                visible={isSearchReplacePanelAwake}
                refreshSearchReplacePanel={refreshSearchReplacePanel}
                keepSearchReplacePanelAwake={keepSearchReplacePanelAwake}
                editor={editor}
                toolbarPreferences={toolbarPreferences}
              />
            </div>

            <div
              id="EditorSidePanelsContainer"
              className="absolute top-0 right-0 translate-x-full w-[20rem] z-[3] h-full flex flex-col gap-1 justify-center items-center"
            >
              <StatisticsPanel
                visible={isStatsPanelAwake}
                refreshStatsPanel={refreshStatsPanel}
                keepStatsPanelAwake={keepStatsPanelAwake}
                editor={editor}
                toolbarPreferences={toolbarPreferences}
              />
              <TableOfContentsPanel
                visible={isTOCPanelAwake}
                refreshTOCPanel={refreshTOCPanel}
                keepTOCPanelAwake={keepTOCPanelAwake}
                editor={editor}
                toolbarPreferences={toolbarPreferences}
              />
            </div>
          </>
        )}

        {editor && (
          <div
            id="EditableUtilityToolbarWrapper"
            className="w-fit h-fit absolute top-2 right-5 z-[3]"
          >
            <div
              id="EditableUtilityToolbar"
              className="w-fit rounded-lg border shadow-md shadow-appLayoutGentleShadow"
              style={{
                height: `calc(${toolbarPreferences.toolbarHeight}rem * var(--uiScale))`,
                minHeight: `calc(${toolbarPreferences.toolbarHeight}rem * var(--uiScale))`,
                backgroundColor: `${toolbarPreferences.backgroundColor}`,
                borderColor: `${dividerColor}`,
              }}
            >
              <TiptapUtilityToolbar
                editor={editor}
                yXmlFragment={yXmlFragment}
                toolbarPreferences={toolbarPreferences}
                keepTOCPanelAwake={keepTOCPanelAwake}
                isTOCPanelAwake={isTOCPanelAwake}
                forceCloseTOCPanel={forceCloseTOCPanel}
                refreshTOCPanel={refreshTOCPanel}
                keepStatsPanelAwake={keepStatsPanelAwake}
                isStatsPanelAwake={isStatsPanelAwake}
                forceCloseStatsPanel={forceCloseStatsPanel}
                refreshStatsPanel={refreshStatsPanel}
                keepSearchReplacePanelAwake={keepSearchReplacePanelAwake}
                isSearchReplacePanelAwake={isSearchReplacePanelAwake}
                forceCloseSearchReplacePanel={forceCloseSearchReplacePanel}
                refreshSearchReplacePanel={refreshSearchReplacePanel}
              />
            </div>
          </div>
        )}

        {editor && (
          <BubbleMenu

            className="h-fit z-[10000] bg-transparent"
            editor={editor}
     
          >
        <div
          id="EditableToolbar"
          style={{
            height: `calc(${toolbarPreferences.toolbarHeight}rem * var(--uiScale))`,
            minHeight: `calc(${toolbarPreferences.toolbarHeight}rem * var(--uiScale))`,
            backgroundColor: `${toolbarPreferences.backgroundColor}`,
            borderColor: `${dividerColor}`,
          }}
          className={`
                overflow-y-hidden
                min-w-0 sticky
                ${isMobile
              ? "order-1 w-full"
              : "order-0 w-fit rounded-lg backdrop-blur-[2px] border z-[10000]"
            }
              `}
        >
          <TipTapToolbar
            editor={editor}
            toolbarPreferences={toolbarPreferences}
          />
        </div>
      </BubbleMenu>
        )}

      <div
        id="EditableContainer"
        className={`h-full w-full max-w-full z-[2] flex justify-start flex-col items-center relative
           overflow-y-scroll min-h-0 text-neutral-200
          `}
        style={{
          paddingLeft: `calc(1.1 * var(--scrollbarWidth))`,
          paddingRight: `calc(1 * var(--scrollbarWidth))`,
          backgroundColor: backgroundColor,
        }}
      >
        {/* <div
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
                : "order-0 w-fit max-w-[99%] rounded-lg border shadow-md shadow-appLayoutGentleShadow relative z-2"
            }
          `}
          >
            <TipTapToolbar
              editor={editor}
              toolbarPreferences={toolbarPreferences}
            />
          </div> */}


        {editor && (
          <FloatingMenu editor={editor} tippyOptions={{ duration: 200 }}>
            <div
              id="FloatingMenuToolbar"
              style={{
                height: `calc(var(--uiScale) * ${lineHeight}rem)`,
              }}
              className="h-full w-fit bg-transparent border-transparent min-w-0"
            >
              <TiptapFloatingToolbar
                editor={editor}
                toolbarPreferences={toolbarPreferences}
              />
            </div>
          </FloatingMenu>
        )}

        <EditorContent
          spellCheck={false}
          editor={editor}
          id="PaperEditorContent"
          className={`h-fit outline-none focus:outline-none z-1 transition-all duration-200
                  `}
          style={{
            width: width.endsWith("%")
              ? `${width}`
              : `calc(${width} * var(--uiScale))`,
            maxWidth: "100%",
            backgroundColor: `${paperColor}`,
            borderTopWidth: `${paperBorderWidth}px`,
            borderRightWidth: `${paperBorderWidth}px`,
            borderBottomWidth: `0`,
            borderLeftWidth: `${paperBorderWidth}px`,
            borderTopColor: `${paperBorderColor}`,
            borderLeftColor: `${paperBorderColor}`,
            borderRightColor: `${paperBorderColor}`,
            marginTop: `calc(${gapTop}rem * var(--uiScale))`,
            borderTopRightRadius: `${roundRadius}rem`,
            borderTopLeftRadius: `${roundRadius}rem`,
            boxShadow: `0px 0px ${paperShadow}rem ${paperShadowColor}`,
          }}
        />
      </div>
    </div>
    </ContextMenuWrapper >
  );
};

export default React.memo(TiptapEditor);

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};
