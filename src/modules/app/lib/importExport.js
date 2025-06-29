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

export function exportToDocx(yXmlFragment) {
    const editor = spawnEditor(yXmlFragment);

    const json = editor.getJSON();

    console.log("JSON: ", json);


}