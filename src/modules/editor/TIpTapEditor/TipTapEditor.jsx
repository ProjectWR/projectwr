import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FocusTrap } from "@mantine/core";
import localStateManager from "../../app/lib/localState";
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
import imageManager from "../../app/lib/image";
import videoManager from "../../app/lib/video";
import { wait } from "lib0/promise";
import { appStore } from "../../app/stores/appStore";
import { useImages } from "../../app/hooks/useImages";
import { useVideos } from "../../app/hooks/useVideos";
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
import { useDebouncedCallback } from "use-debounce";

const content = "<p>Hello World!</p>";

const { desktopDefaultPreferences, mobileDefaultPreferences } =
  TipTapEditorDefaultPreferences;

const TiptapEditor = ({
  hunspell,
  yXmlFragment,
  setHeaderOpened,
  mode = "editPaper",
  preferences,
  saveScrollPosition,
  libraryId,
  paperId,
  lastSelectionPosition,
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
    (state) => state.proofreadContextItems,
  );

  const setProofreadContextItems = appStore(
    (state) => state.setProofreadContextItems,
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

  const debouncedUpdateSelectionPosition = useDebouncedCallback(
    (libraryId, paperId, position) => {
      localStateManager.updateLastSelectionPosition(
        libraryId,
        paperId,
        position,
      );
    },
    1500,
  );

  const {
    width,
    gapTop,
    paddingTop, // Updated from marginTop
    paddingLeft, // Updated from marginLeft
    paddingRight, // Updated from marginRight
    paddingBottom, // Updated from marginBottom
    font,
    fontWeight,
    fontColor,
    caretColor,
    fontSize,
    lineHeight,
    scale,
    marginBottom,
    backgroundColor,
    backgroundColorOpacity,
    backgroundImage,
    backgroundVideo,
    backgroundVideoPlaybackSpeed,
    paperBorderWidth,
    paperColor,
    paperColorOpacity,
    paperBlur,
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
    borderImageTopLeft,
    borderImageTop,
    borderImageTopRight,
    borderImageRight,
    borderImageBottomRight,
    borderImageBottom,
    borderImageBottomLeft,
    borderImageLeft,
    borderImageWidth,
    borderImageOutset,
    borderImageRepeat,
    borderImageKeepBottomFixed,
    mentionColor,
    spellingErrorColor,
    spellingWarningColor,
    backgroundRepeat,
    backgroundPosition,
    backgroundSize,
  } = paperPreferences;

  const {
    dividerColor,
    borderColor,
    iconColor,
    scrollbarThumbColor,
    fontColor: toolbarFontColor,
    backgroundColor: toolbarBgColor,
    backgroundColorOpacity: toolbarBgOpacity,
    toolbarBlur,
  } = toolbarPreferences;

  console.log("Width: ", width);

  useImages(); // Subscribe to image changes
  useVideos(); // Subscribe to video changes

  // Resolve image IDs to URLs
  const resolvedBackgroundImage = useMemo(() => {
    if (!backgroundImage) return null;
    if (
      backgroundImage.startsWith("blob:") ||
      backgroundImage.startsWith("http")
    )
      return backgroundImage;
    return imageManager.getImageUrl(backgroundImage);
  }, [backgroundImage]);

  // Resolve border image IDs to URLs
  const resolvedBorderImages = useMemo(() => {
    const resolve = (img) => {
      if (!img) return null;
      if (img.startsWith("blob:") || img.startsWith("http")) return img;
      return imageManager.getImageUrl(img);
    };

    return {
      topLeft: resolve(borderImageTopLeft),
      top: resolve(borderImageTop),
      topRight: resolve(borderImageTopRight),
      right: resolve(borderImageRight),
      bottomRight: resolve(borderImageBottomRight),
      bottom: resolve(borderImageBottom),
      bottomLeft: resolve(borderImageBottomLeft),
      left: resolve(borderImageLeft),
    };
  }, [
    borderImageTopLeft,
    borderImageTop,
    borderImageTopRight,
    borderImageRight,
    borderImageBottomRight,
    borderImageBottom,
    borderImageBottomLeft,
    borderImageLeft,
  ]);

  const resolvedBackgroundVideo = useMemo(() => {
    if (!backgroundVideo) return null;
    if (
      backgroundVideo.startsWith("blob:") ||
      backgroundVideo.startsWith("http")
    )
      return backgroundVideo;
    return videoManager.getVideoUrl(backgroundVideo);
  }, [backgroundVideo]);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = backgroundVideoPlaybackSpeed || 1;
    }
  }, [backgroundVideoPlaybackSpeed, resolvedBackgroundVideo]);

  console.log("Editor Preferences: ", editorPreferences);

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

        let label = "";

        try {
          label =
            libraryId === id
              ? dataManagerSubdocs
                  .getLibrary(libraryId)
                  ?.getMap("library_props")
                  ?.toJSON().item_properties.item_title
              : libraryYTree.getNodeValueFromKey(id)?.toJSON()?.item_properties
                  ?.item_title;
        } catch {
          label = "Error fetching link label";
        }

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
        let label = "";

        try {
          label =
            libraryId === id
              ? dataManagerSubdocs
                  .getLibrary(libraryId)
                  ?.getMap("library_props")
                  ?.toJSON().item_properties.item_title
              : libraryYTree.getNodeValueFromKey(id)?.toJSON()?.item_properties
                  ?.item_title;
        } catch {
          label = "Error rendering label";
        }

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
    content: mode === "previewTemplate" ? "<p></p>" : content,
    extensions:
      mode === "previewTemplate"
        ? previewTemplateExtensions.current
        : extensions.current,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === "Tab" && event.ctrlKey) {
          event.stopPropagation();
        }
        return false;
      },
    },
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

      if (editor && libraryId && paperId) {
        const { from } = editor.state.selection;
        debouncedUpdateSelectionPosition(libraryId, paperId, from);
      }
    },
  });

  // Restore selection position on init
  useEffect(() => {
    if (
      editor &&
      lastSelectionPosition !== null &&
      lastSelectionPosition !== undefined
    ) {
      console.log("last Selection Position: ", lastSelectionPosition);
      // Small timeout to ensure document is fully loaded/synced
      if (!editor.isDestroyed) {
        editor.commands.setTextSelection(lastSelectionPosition);
        // Also try to scroll if needed, though setTextSelection usually handles viewport
      }
    }
  }, [editor, lastSelectionPosition]);

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
      ],
    );

    return options;
  }, [editor, selectingError, setSearchQuery, proofreadContextItems]);

  return (
    <ContextMenuWrapper options={options}>
      <FocusTrap active={true}>
        <div
          id="EditorContainer"
          className="h-full EditorStyles w-full max-w-full flex flex-col items-center relative"
        >
          <style>
            {`

          #EditableToolbar * {
            pointer-events: auto !important;
          }

          #EditableContainer { 
            padding-top: calc(${gapTop}px * ${scale} * var(--uiScale));
          }

          #EditorContainer {
            background-color: color-mix(in srgb, ${backgroundColor} ${
              backgroundColorOpacity !== undefined
                ? backgroundColorOpacity
                : 100
            }%, transparent);
            ${
              resolvedBackgroundImage
                ? `background-image: url(${resolvedBackgroundImage});`
                : ""
            }
            background-size: ${backgroundSize || "auto"};
            background-position: ${backgroundPosition || "center"};
            background-repeat: ${backgroundRepeat || "repeat"};
          }

          #EditableUtilityToolbarWrapper {
            height: calc(${
              toolbarPreferences.toolbarHeight
            }px * var(--uiScale));
          }

          #EditableUtilityToolbar {
            height: calc(${
              toolbarPreferences.toolbarHeight
            }px * var(--uiScale));
            min-height: calc(${
              toolbarPreferences.toolbarHeight
            }px * var(--uiScale));
            background-color: color-mix(in srgb, ${toolbarBgColor} ${
              toolbarBgOpacity !== undefined ? toolbarBgOpacity : 100
            }%, transparent);
            backdrop-filter: blur(${toolbarBlur || 0}px);
            border-color: ${borderColor};
            color: ${toolbarFontColor};
          }

          #EditableUtilityToolbar span[class^="icon-"], 
          #EditableUtilityToolbar span[class*=" icon-"] {
            background-color: ${iconColor};
          }

          #EditableToolbar {
            height: calc(${
              toolbarPreferences.toolbarHeight
            }px * var(--uiScale));
            min-height: calc(${
              toolbarPreferences.toolbarHeight
            }px * var(--uiScale));
            background-color: color-mix(in srgb, ${toolbarBgColor} ${
              toolbarBgOpacity !== undefined ? toolbarBgOpacity : 100
            }%, transparent);
            backdrop-filter: blur(${toolbarBlur || 0}px);
            border-color: ${borderColor};
            box-shadow: 0px 0px 0.5px ${paperShadowColor};
            color: ${toolbarFontColor};
          }

          #EditableToolbar span[class^="icon-"], 
          #EditableToolbar span[class*=" icon-"] {
            background-color: ${iconColor};
          }

          #FloatingMenuToolbar {
            height: calc(var(--uiScale) * ${scale} * ${lineHeight}px);
          }
            
          .TOCPOI {
            background-color: ${iconColor}DD;
          }

          .TOCPOI:hover {
            background-color: ${iconColor}FF;
          }

          #TOCVirtualScrollThumb {
            background-color: ${scrollbarThumbColor}AA;
          }

          #TOCVirtualScrollThumb:hover {
            background-color: ${scrollbarThumbColor}FF;
          }

          #TOCVirtualScrollTrack {
            background-image: linear-gradient(to bottom, transparent, ${scrollbarThumbColor} 50%, transparent)
          }

          .paper-border {
            position: absolute;
            pointer-events: none;
            z-index: 1;
          }

          .paper-border-bottom,
          .paper-border-bottom-left,
          .paper-border-bottom-right {
            ${
              borderImageKeepBottomFixed
                ? "position: absolute !important; bottom: 0 !important; z-index: 2 !important;"
                : ""
            }
          }

          #BottomBorderImageContainer {
            position: sticky;
            width: calc(var(--uiScale) * ${scale} * max(400px, ${width}));
            max-width: 100%;
            height: calc(${
              String(borderImageWidth).split(" ")[2] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            border-right-width: calc(${
              String(paperBorderWidth).split(" ")[1] ||
              String(paperBorderWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale))!important;
            border-bottom-width: calc(${
              String(paperBorderWidth).split(" ")[2] ||
              String(paperBorderWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale))!important;
            border-left-width: calc(${
              String(paperBorderWidth).split(" ")[3] ||
              String(paperBorderWidth).split(" ")[1] ||
              String(paperBorderWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale))!important;
          }

          .paper-border-top-left {
            top: calc(-1 * ${
              String(borderImageOutset).split(" ")[0] || 0
            }px * ${scale} * var(--uiScale));
            left: calc(-1 * ${
              String(borderImageOutset).split(" ")[3] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            width: calc(${
              String(borderImageWidth).split(" ")[3] ||
              String(borderImageWidth).split(" ")[1] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            height: calc(${
              String(borderImageWidth).split(" ")[0] || 0
            }px * ${scale} * var(--uiScale));
            background-image: url(${resolvedBorderImages.topLeft});
            background-size: 100% 100%;
            background-repeat: no-repeat;
          }

          .paper-border-top {
            top: calc(-1 * ${
              String(borderImageOutset).split(" ")[0] || 0
            }px * ${scale} * var(--uiScale));
            left: 0;
            right: 0;
            height: calc(${
              String(borderImageWidth).split(" ")[0] || 0
            }px * ${scale} * var(--uiScale));
            background-image: url(${resolvedBorderImages.top});
            background-repeat: ${
              borderImageRepeat === "stretch"
                ? "no-repeat"
                : borderImageRepeat || "repeat"
            }-x;
            background-size: ${
              borderImageRepeat === "stretch" ? "100% 100%" : "auto 100%"
            };
            background-position: top;
          }

          .paper-border-top-right {
            top: calc(-1 * ${
              String(borderImageOutset).split(" ")[0] || 0
            }px * ${scale} * var(--uiScale));
            right: calc(-1 * ${
              String(borderImageOutset).split(" ")[1] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            width: calc(${
              String(borderImageWidth).split(" ")[1] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            height: calc(${
              String(borderImageWidth).split(" ")[0] || 0
            }px * ${scale} * var(--uiScale));
            background-image: url(${resolvedBorderImages.topRight});
            background-size: 100% 100%;
            background-repeat: no-repeat;
          }

          .paper-border-right {
            top: calc((-1 * ${
              String(borderImageOutset).split(" ")[0] || 0
            }px + ${
              String(borderImageWidth).split(" ")[0] || 0
            }px) * ${scale} * var(--uiScale));
            bottom: 0;
            right: calc(-1 * ${
              String(borderImageOutset).split(" ")[1] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            width: calc(${
              String(borderImageWidth).split(" ")[1] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            background-image: url(${resolvedBorderImages.right});
            background-repeat: ${
              borderImageRepeat === "stretch"
                ? "no-repeat"
                : borderImageRepeat || "repeat"
            }-y;
            background-size: ${
              borderImageRepeat === "stretch" ? "100% 100%" : "100% auto"
            };
            background-position: top;
          }

          .paper-border-bottom-right {
            bottom: calc(-1 * ${
              String(borderImageOutset).split(" ")[2] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            right: calc(-1 * ${
              String(borderImageOutset).split(" ")[1] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            width: calc(${
              String(borderImageWidth).split(" ")[1] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            height: calc(${
              String(borderImageWidth).split(" ")[2] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            background-image: url(${resolvedBorderImages.bottomRight});
            background-size: 100% 100%;
            background-repeat: no-repeat;
          }

          .paper-border-bottom {
            bottom: calc(-1 * ${
              String(borderImageOutset).split(" ")[2] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            left: 0;
            right: 0;
            height: calc(${
              String(borderImageWidth).split(" ")[2] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            background-image: url(${resolvedBorderImages.bottom});
            background-repeat: ${
              borderImageRepeat === "stretch"
                ? "no-repeat"
                : borderImageRepeat || "repeat"
            }-x;
            background-size: ${
              borderImageRepeat === "stretch" ? "100% 100%" : "auto 100%"
            };
            background-position: bottom;
          }

          .paper-border-bottom-left {
            bottom: calc(-1 * ${
              String(borderImageOutset).split(" ")[2] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            left: calc(-1 * ${
              String(borderImageOutset).split(" ")[3] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            width: calc(${
              String(borderImageWidth).split(" ")[3] ||
              String(borderImageWidth).split(" ")[1] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            height: calc(${
              String(borderImageWidth).split(" ")[2] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            background-image: url(${resolvedBorderImages.bottomLeft});
            background-size: 100% 100%;
            background-repeat: no-repeat;
          }

          .paper-border-left {
            top: calc((-1 * ${
              String(borderImageOutset).split(" ")[0] || 0
            }px + ${
              String(borderImageWidth).split(" ")[0] || 0
            }px) * ${scale} * var(--uiScale));
            bottom: 0;
            left: calc(-1 * ${
              String(borderImageOutset).split(" ")[3] ||
              String(borderImageOutset).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            width: calc(${
              String(borderImageWidth).split(" ")[3] ||
              String(borderImageWidth).split(" ")[1] ||
              String(borderImageWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale));
            background-image: url(${resolvedBorderImages.left});
            background-repeat: ${
              borderImageRepeat === "stretch"
                ? "no-repeat"
                : borderImageRepeat || "repeat"
            }-y;
            background-size: ${
              borderImageRepeat === "stretch" ? "100% 100%" : "100% auto"
            };
            background-position: top;
          }

          #PaperContentWrapper {
            ${width?.endsWith("%") ? `width: ${width};` : ``}
          }

          #PaperEditorContent {
            ${width?.endsWith("%") ? `width: ${width};` : ``}
          }

          #PaperEditorContent > div.tiptap.ProseMirror {
            z-index: 1;
            width: calc(var(--uiScale) * ${scale} * max(400px, ${width}));
            max-width: 100%;
            background-color: color-mix(in srgb, ${paperColor} ${
              paperColorOpacity !== undefined ? paperColorOpacity : 100
            }%, transparent);
            backdrop-filter: blur(${paperBlur || 0}px);
            border-top-width: calc(${
              String(paperBorderWidth).split(" ")[0] || 0
            }px * ${scale} * var(--uiScale))!important;
            caret-color: ${caretColor || "currentColor"};
            border-right-width: calc(${
              String(paperBorderWidth).split(" ")[1] ||
              String(paperBorderWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale))!important;
            border-bottom-width: calc(${
              String(paperBorderWidth).split(" ")[2] ||
              String(paperBorderWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale))!important;
            border-left-width: calc(${
              String(paperBorderWidth).split(" ")[3] ||
              String(paperBorderWidth).split(" ")[1] ||
              String(paperBorderWidth).split(" ")[0] ||
              0
            }px * ${scale} * var(--uiScale))!important;
            border-color: ${paperBorderColor}!important;
            border-style: solid!important;
            border-top-right-radius: calc(${roundRadius}px * ${scale} * var(--uiScale));
            border-top-left-radius: calc(${roundRadius}px * ${scale} * var(--uiScale));
            box-shadow: ${
              paperShadow
                ? `0 0 calc(${paperShadow}px * ${scale} * var(--uiScale)) ${
                    paperShadowColor || "transparent"
                  }`
                : "none"
            };
            

            height: fit-content !important;

            pointer-events: auto !important;
            padding: calc(${paddingTop}px * ${scale} * var(--uiScale))
                     calc(${paddingRight}px * ${scale} * var(--uiScale))
                     50%
                     calc(${paddingLeft}px * ${scale} * var(--uiScale));
            font-family: ${font}, serif ;
          }

          .EditorStyles .tiptap {
            min-height: 100%;
            height: fit-content;
          }

          .EditorStyles h1 {
            font-size: calc(${h1FontSize}px * ${scale} * var(--uiScale));
            line-height: calc(${h1LineHeight}px * ${scale} * var(--uiScale));
            margin-bottom: calc(${h1MarginBottom}px * ${scale} * var(--uiScale));
            font-family: ${font}, serif ;
            color: ${fontColor};
          }

          .EditorStyles h2 {
            font-size: calc(${h2FontSize}px * ${scale} * var(--uiScale));
            line-height: calc(${h2LineHeight}px * ${scale} * var(--uiScale));
            margin-bottom: calc(${h2MarginBottom}px * ${scale} * var(--uiScale));
            font-family: ${font}, serif ;
            color: ${fontColor};
          }

          .EditorStyles h3 {
            font-size: calc(${h3FontSize}px * ${scale} * var(--uiScale));
            line-height: calc(${h3LineHeight}px * ${scale} * var(--uiScale));
            margin-bottom: calc(${h3MarginBottom}px * ${scale} * var(--uiScale));
            font-family: ${font}, serif ;
            color: ${fontColor};
          }

          .EditorStyles h4 {
            font-size: calc(${h4FontSize}px * ${scale} * var(--uiScale));
            line-height: calc(${h4LineHeight}px * ${scale} * var(--uiScale));
            margin-bottom: calc(${h4MarginBottom}px * ${scale} * var(--uiScale));
            font-family: ${font}, serif ;
            color: ${fontColor};
          }

          .EditorStyles h5 {
            font-size: calc(${h5FontSize}px * ${scale} * var(--uiScale));
            line-height: calc(${h5LineHeight}px * ${scale} * var(--uiScale));
            margin-bottom: calc(${h5MarginBottom}px * ${scale} * var(--uiScale));
            font-family: ${font}, serif ;
            color: ${fontColor};
          }

          .EditorStyles p {
            font-size: calc(${fontSize}px * ${scale} * var(--uiScale));
            line-height: calc(${lineHeight}px * ${scale} * var(--uiScale));
            margin-bottom: calc(${marginBottom}px * ${scale} * var(--uiScale));
            font-family: ${font}, serif ;
            font-weight: ${fontWeight || "normal"};
            color: ${fontColor};
            margin: 0;
          }

          .EditorStyles {
            font-size: calc(${fontSize}px * ${scale} * var(--uiScale));
            line-height: calc(${lineHeight}px * ${scale} * var(--uiScale));
            color: ${fontColor};
          }

          .EditorStyles ol,
          .EditorStyles ul {
            padding-left: calc(${listPaddingLeft}px * ${scale} * var(--uiScale));
            margin: calc(${listMarginTop}px * ${scale} * var(--uiScale)) 1rem calc(${listMarginBottom}px * ${scale} * var(--uiScale)) 0.4rem;
          }

          .EditorStyles ul {
            list-style: circle;
          }

          .EditorStyles ol {
            list-style: lower;
          }

          .EditorStyles hr {
            cursor: pointer;
            margin: calc(${hrMarginTop}px * ${scale} * var(--uiScale)) 0 calc(${hrMarginBottom}px * ${scale} * var(--uiScale)) 0;
            border-top: 1px solid ${hrBorderColor};
          }

          .EditorStyles blockquote {
            padding-left: calc(${blockquotePadding}px * ${scale} * var(--uiScale));
            border-left: calc(${blockquoteBorderWidth}px * ${scale} * var(--uiScale)) solid ${blockquoteBorderColor};
          }

          .spelling-error {
            background-color: color-mix(in srgb, ${spellingErrorColor} 10%, transparent);
            border-top-left-radius: calc(3px * ${scale} * var(--uiScale));
            border-top-right-radius: calc(3px * ${scale} * var(--uiScale));
            border-bottom: 1px solid ${spellingErrorColor};
          }

          .spelling-warning {
            background-color: color-mix(in srgb, ${spellingWarningColor} 10%, transparent);
            border-top-left-radius: calc(3px * ${scale} * var(--uiScale));
            border-top-right-radius: calc(3px * ${scale} * var(--uiScale));
            border-bottom: 1px solid ${spellingWarningColor};
          }

          .mention {
            color: ${mentionColor};
            border-radius: 0.4rem;
            box-decoration-break: clone;
            cursor: pointer;
          }

          .mention:after {
            content: "\u200B";
          }

          .mention:hover {
            color: color-mix(in srgb, ${mentionColor} 80%, white);
          }

          [data-indent='1'] {
            padding-left: calc(1 * 48px);
          }

          [data-indent='2'] {
            padding-left: calc(2 * 48px);
          }

          [data-indent='3'] {
            padding-left: calc(3 * 48px);
          }

          [data-indent='4'] {
            padding-left: calc(4 * 48px);
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
            border-left: 2px solid ${caretColor};
          }

          .ProseMirror .prosemirror-virtual-cursor-left {
            width: 1ch;
            transform: translate(calc(-1ch + -1px));
            border-bottom: 2px solid ${caretColor};
            border-right: 2px solid ${caretColor};
            border-left: none;
          }

          .ProseMirror .prosemirror-virtual-cursor-right {
            width: 1ch;
            border-bottom: 2px solid ${caretColor};
            border-left: 2px solid ${caretColor};
            border-right: none;
          }

          .ProseMirror-focused .prosemirror-virtual-cursor-animation {
            animation: prosemirror-virtual-cursor-blink 1s linear infinite;
            animation-delay: 0.5s;
          }

          .search-result {
            background-color: #0000FFaa;
          }

          .hide-scrollbar::-webkit-scrollbar {
           -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
            display: none;
            scrollbar-gutter: 0;
          }

        `}
          </style>

          {editor && (
            <>
              <div
                id="EditorTopPanelsContainer"
                className="absolute top-0 left-0 -translate-y-full w-full z-2 h-[20rem] flex gap-1 justify-center items-center"
              >
                {mode == "editPaper" && (
                  <SearchReplacePanel
                    visible={isSearchReplacePanelAwake}
                    refreshSearchReplacePanel={refreshSearchReplacePanel}
                    keepSearchReplacePanelAwake={keepSearchReplacePanelAwake}
                    editor={editor}
                    toolbarPreferences={toolbarPreferences}
                  />
                )}
              </div>

              <div
                id="EditorSidePanelsContainer"
                className="absolute top-0 right-0 translate-x-full w-[20rem] z-2 h-full flex flex-col gap-1 justify-center items-center"
              ></div>
            </>
          )}

          {editor && (
            <div
              id="EditableUtilityToolbarWrapper"
              className="w-fit h-fit absolute top-2 left-2 z-2"
            >
              <div
                id="EditableUtilityToolbar"
                className="w-fit rounded-lg border"
                style={{
                  boxShadow: toolbarPreferences.toolbarShadow
                    ? `0 0 calc(${toolbarPreferences.toolbarShadow}px * ${scale} * var(--uiScale)) ${
                        toolbarPreferences.toolbarShadowColor || "transparent"
                      }`
                    : "none",
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
              tippyOptions={{
                duration: 200,
              }}
              className="h-fit p-2 z-[10000] bg-transparent"
              editor={editor}
            >
              <div
                id="EditableToolbar"
                className={`
                overflow-y-hidden
                min-w-0 sticky
                z-[10000]
                order-0 w-fit max-w-[99%] rounded-lg border z-[10000]
              `}
              >
                <TipTapToolbar
                  editor={editor}
                  toolbarPreferences={toolbarPreferences}
                />
              </div>
            </BubbleMenu>
          )}

          {resolvedBackgroundVideo && (
            <video
              ref={videoRef}
              id="BackgroundVideo"
              src={resolvedBackgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[-1]"
            />
          )}

          <div
            id="EditableContainer"
            className={`h-full w-full max-w-full z-1 flex justify-start flex-col items-center relative
           overflow-y-scroll min-h-0 text-neutral-200 hide-scrollbar translate-z-0 bg-transparent
          `}
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
                  className="h-full w-fit bg-transparent border-transparent min-w-0"
                >
                  <TiptapFloatingToolbar
                    editor={editor}
                    toolbarPreferences={toolbarPreferences}
                  />
                </div>
              </FloatingMenu>
            )}

            <div className="PaperContentContainer h-fit w-full grow flex flex-col items-center outline-none focus:outline-none z-1 transition-all duration-200">
              <div
                id="PaperContentWrapper"
                className="relative h-fit grow w-fit transition-all z-1 duration-200 flex flex-col"
              >
                <div className="paper-border paper-border-top-left z-2" />
                <div className="paper-border paper-border-top z-1" />
                <div className="paper-border paper-border-top-right z-2" />
                <div className="paper-border paper-border-right z-1" />
                {!borderImageKeepBottomFixed && (
                  <>
                    <div className="paper-border paper-border-bottom-right z-2" />
                    <div className="paper-border paper-border-bottom z-1" />
                    <div className="paper-border paper-border-bottom-left z-2" />
                  </>
                )}
                <div className="paper-border paper-border-left z-1" />
                <EditorContent
                  spellCheck={false}
                  editor={editor}
                  id="PaperEditorContent"
                  className={`h-fit w-fit grow flex justify-center outline-none focus:outline-none z-0 transition-all duration-200`}
                />
              </div>
            </div>
          </div>

          {borderImageKeepBottomFixed && (
            <div
              id="BottomBorderImageContainer"
              className="bottom-0 left-0 right-0"
            >
              <div
                id="BottomBorderImageInnerWrapper"
                className="relative w-full h-full top-0"
              >
                <div className="paper-border paper-border-bottom-right z-2" />
                <div className="paper-border paper-border-bottom z-2" />
                <div className="paper-border paper-border-bottom-left z-2" />
              </div>
            </div>
          )}
          {editor && (
            <TableOfContentsPanel
              editor={editor}
              toolbarPreferences={toolbarPreferences}
            />
          )}
          {editor && (
            <StatisticsPanel
              mode={mode}
              editor={editor}
              toolbarPreferences={toolbarPreferences}
            />
          )}
        </div>
      </FocusTrap>
    </ContextMenuWrapper>
  );
};

export default React.memo(TiptapEditor);

TiptapEditor.propTypes = {
  hunspell: PropTypes.object,
  yXmlFragment: PropTypes.object.isRequired,
  setHeaderOpened: PropTypes.func.isRequired,
  mode: PropTypes.string,
  preferences: PropTypes.object,
  saveScrollPosition: PropTypes.func,
  libraryId: PropTypes.string,
  paperId: PropTypes.string,
  lastSelectionPosition: PropTypes.number,
};

const useFocus = () => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};
