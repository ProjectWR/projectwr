import {
    useEditor,
    useEditorState,
    EditorContent,
    mergeAttributes,
    BubbleMenu,
    FloatingMenu,
    Editor,
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
import { Indent } from "../../editor/TipTapEditor/Extensions/indent";
import suggestion from "../../editor/TipTapEditor/Extensions/MentionExtension/suggestion";
import { appStore } from "../stores/appStore";
import { getOrInitLibraryYTree } from "./ytree";
import { Document as docxDocument, Packer, Paragraph as docxParagrah, TextRun, HeadingLevel } from "docx";


const extensions = [
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
    Indent.configure({
        types: ["listItem", "paragraph"],
        minLevel: 0,
        maxLevel: 4,
    }),
    Mention.configure({
        HTMLAttributes: {
            class: "mention",
        },
        suggestion: suggestion,
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
];

function spawnEditor(yXmlFragment) {
    return new Editor({
        extensions: [...extensions, Collaboration.configure({
            fragment: yXmlFragment,
        }),]
    });
}
export function yXmlFragmentToDocx(yXmlFragment, baseHeadingLevel = 1) {
    const editor = spawnEditor(yXmlFragment);
    const json = editor.getJSON();

    console.log("EXPORT JSON: ", json);

    // Helper to convert marks to docx TextRun options
    function getTextRunOptions(node) {
        const options = {};
        if (node.marks) {
            for (const mark of node.marks) {
                if (mark.type === "bold") options.bold = true;
                if (mark.type === "italic") options.italics = true;
                if (mark.type === "underline") options.underline = {};
                if (mark.type === "strike") options.strike = true;
                // Add more marks as needed
            }
        }
        return options;
    }

    // Helper to convert inline content (text, mention, etc.) to TextRuns
    function parseInlineContent(content) {
        if (!content) return [];
        return content.map(node => {
            if (node.type === "text") {
                return new TextRun({
                    text: node.text,
                    ...getTextRunOptions(node)
                });
            }
            if (node.type === "mention") {
                // Render mention as label, could style differently if needed
                return new TextRun({
                    text: node.attrs && node.attrs.label ? node.attrs.label : "",
                    // Optionally, you can style mentions
                    bold: true,
                    color: "4472C4"
                });
            }
            return new TextRun({ text: "" });
        });
    }

    // Recursively parse block nodes
    function parseBlock(node) {
        if (!node) return [];
        if (node.type === "paragraph") {
            // Skip empty paragraphs
            if (!node.content || node.content.length === 0) {
                return [new docxParagrah({})];
            }
            return [
                new docxParagrah({
                    children: parseInlineContent(node.content),
                    alignment: node.attrs && node.attrs.textAlign ? node.attrs.textAlign : undefined,
                })
            ];
        }
        if (node.type === "heading") {
            // Adjust heading level based on baseHeadingLevel
            const origLevel = node.attrs && node.attrs.level ? node.attrs.level : 1;
            const docxLevel = Math.max(1, baseHeadingLevel + (origLevel - 1));
            let headingType;
            // Map docxLevel to docx HeadingLevel enum
            switch (docxLevel) {
                case 1: headingType = HeadingLevel.TITLE; break;
                case 2: headingType = HeadingLevel.HEADING_1; break;
                case 3: headingType = HeadingLevel.HEADING_2; break;
                case 4: headingType = HeadingLevel.HEADING_3; break;
                case 5: headingType = HeadingLevel.HEADING_4; break;
                case 6: headingType = HeadingLevel.HEADING_5; break;
                case 7: headingType = HeadingLevel.HEADING_6; break;
                default: headingType = undefined;
            }
            return [
                new docxParagrah({
                    children: parseInlineContent(node.content),
                    heading: headingType,
                    alignment: node.attrs && node.attrs.textAlign ? node.attrs.textAlign : undefined,
                })
            ];
        }
        if (node.type === "bulletList" || node.type === "orderedList") {
            const isOrdered = node.type === "orderedList";
            const items = [];
            if (node.content) {
                for (const listItem of node.content) {
                    // Each listItem contains a paragraph (or more)
                    if (listItem.content) {
                        for (const para of listItem.content) {
                            // Only parse paragraphs inside list items
                            if (para.type === "paragraph") {
                                items.push(
                                    new docxParagrah({
                                        children: parseInlineContent(para.content),
                                        bullet: isOrdered ? { level: 0, numbering: { reference: "ordered-list" } } : { level: 0 },
                                    })
                                );
                            }
                        }
                    }
                }
            }
            return items;
        }
        if (node.type === "horizontalRule") {
            return [new docxParagrah({ border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } } })];
        }
        // Recursively handle other block types if needed
        return [];
    }

    // Parse all top-level content nodes
    const docxChildren = [];
    if (json.content && Array.isArray(json.content)) {
        for (const node of json.content) {
            const blocks = parseBlock(node);
            if (blocks && blocks.length) {
                docxChildren.push(...blocks);
            }
        }
    }

    const doc = new docxDocument({
        sections: [
            {
                properties: {},
                children: docxChildren
            }
        ]
    });

    // Download the docx file
    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "export.docx";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    });
}