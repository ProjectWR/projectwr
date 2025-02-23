import { Editor } from '@tiptap/core'
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
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";

import * as Y from "yjs";
import { generateUUID } from "../utils/uuidUtil";
import { getHighestOrderIndex, insertBetween } from "../utils/orderUtil";
import { YTree } from "yjs-orderedtree";
import persistenceManagerForSubdocs from "./persistenceSubDocs";
import { fetchUserLibraryListStore } from "./libraries";
import ObservableMap from "./ObservableMap";
import { min } from 'lib0/math';

import {
  DocxSerializer,
  defaultNodes,
  defaultMarks
} from "prosemirror-docx";

import { Buffer } from 'buffer/';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile} from '@tauri-apps/plugin-fs';
import { Packer } from 'docx';

let instance;

class DataManagerSubdocs {
  constructor() {
    if (instance) {
      throw new Error(
        "DataManagerSubdocs is a singleton class. Use getInstance() instead."
      );
    }

    /**
     * @type {ObservableMap<string, Y.Doc>}
     */
    this.libraryYDocMap = new ObservableMap(); // Use ObservableMap
    instance = this;
  }

  /**
   * Add a callback to be triggered when the libraryYDocMap changes
   * @param {Function} callback
   */
  addLibraryYDocMapCallback(callback) {
    this.libraryYDocMap.addCallback(callback);
  }

  /**x`
   * Remove a callback
   * @param {Function} callback
   */
  removeLibraryYDocMapCallback(callback) {
    this.libraryYDocMap.removeCallback(callback);
  }

  /**
   * Initialize a library with a new Y.Doc
   * @param {string} libraryId
   */
  async initLibrary(libraryId) {

    if (this.libraryYDocMap.has(libraryId)) {
      console.log("library already intitiated: ", libraryId);
      return;
    }

    const ydoc = new Y.Doc({ guid: libraryId });
    ydoc.getMap("library_props");
    ydoc.getMap("library_directory");
    this.libraryYDocMap.set(libraryId, new Y.Doc({ guid: libraryId }));
  }

  /**
   * Destroy a library by removing its Y.Doc from the map
   * @param {string} libraryId
   */
  destroyLibrary(libraryId) {
    const ydoc = this.getLibrary(libraryId);
    ydoc.destroy();
    this.libraryYDocMap.delete(libraryId);
  }

  /**
   * Get a library Y.Doc by its ID
   * @param {string} libraryId
   * @returns {Y.Doc}
   */
  getLibrary(libraryId) {
    return this.libraryYDocMap.get(libraryId);
  }

  /**
   * Create an empty library with default properties
   */
  createEmptyLibrary() {
    const uuid = generateUUID();
    const ydoc = new Y.Doc({ guid: uuid });

    const libraryPropertiesYMap = ydoc.getMap("library_props");
    libraryPropertiesYMap.set("library_name", `Untitled Library #${this.libraryYDocMap.size}`);
    libraryPropertiesYMap.set(
      "library_description",
      ""
    );

    libraryPropertiesYMap.set(
      "order_index",
      insertBetween(
        getHighestOrderIndex(getArrayFromYDocMap(this.libraryYDocMap)),
        ""
      )
    );

    new YTree(ydoc.getMap("library_directory"));

    this.libraryYDocMap.set(uuid, ydoc);
    persistenceManagerForSubdocs.initLocalPersistenceForYDoc(ydoc);

    (async () => {
      console.log("starting to put library in store");
      const librariesStore = await fetchUserLibraryListStore();
      await librariesStore.set(uuid, "");
      console.log("set library in store");
    })();

    return uuid;
  }

  /**
   * 
   * @param {YTree} ytree 
   * @returns {string}
   */
  createEmptyBook(ytree) {
    const uuid = generateUUID();
    const bookMap = new Y.Map();
    bookMap.set("type", "book");
    bookMap.set("item_id", uuid);
    bookMap.set("item_title", "Book Title");
    bookMap.set("book_description", "Book Description");
    ytree.createNode("root", uuid, bookMap);

    return uuid;
  }

  /**
   * 
   * @param {YTree} ytree 
   * @param {string} bookId 
   */
  createEmptySection(ytree, bookId) {
    const uuid = generateUUID();
    const sectionMap = new Y.Map();
    sectionMap.set("type", "section");
    sectionMap.set("item_id", uuid);
    sectionMap.set("item_title", "Section Title");
    sectionMap.set("section_description", "Section Description")
    ytree.createNode(bookId, uuid, sectionMap);
    return uuid;
  }

  /**
   * 
   * @param {YTree} ytree 
   * @param {string} parentId 
   */
  createEmptyPaper(ytree, parentId) {
    const uuid = generateUUID();
    const paperMap = new Y.Map();
    paperMap.set("type", "paper");
    paperMap.set("item_id", uuid);
    paperMap.set("item_title", "Paper Title");
    paperMap.set("paper_xml", new Y.XmlFragment());
    ytree.createNode(parentId, uuid, paperMap);
    return uuid;
  }

  /**
  * 
  * @param {YTree} ytree 
  * @param {string} parentId 
  */
  async exportAllChildrenToDocx(ytree, parentId) {

    let finalHTML = "";

    /**
     * @param {string} nodeId 
     */
    const processNode = (nodeId, nodeLevel) => {
      const level = min(nodeLevel, 6);
      const nodeMap = ytree.getNodeValueFromKey(nodeId);
      if (nodeMap.get("type") === 'paper') {
        const html = this.getHtmlFromPaper(ytree, nodeId);
        finalHTML += `<h${level}> ${nodeMap.get("item_title")} </h${level}>`
        finalHTML += html;
      }
      else if (nodeMap.get("type") === 'section') {
        finalHTML += `<h${level}> ${nodeMap.get("item_title")} </h${level}>`
      }
      else if (nodeMap.get("type") === 'book') {
        finalHTML += `<h1> ${nodeMap.get("item_title")} </h1>`
      }
    }

    const nodeDescendants = [[parentId, 1]];
    while (nodeDescendants.length > 0) {
      const nodeChild = nodeDescendants.shift();
      if (nodeChild[0] != parentId) finalHTML += "<br>"
      processNode(nodeChild[0], nodeChild[1]);
      const nodeGrandChildren = ytree.sortChildrenByOrder(ytree.getNodeChildrenFromKey(nodeChild[0]), nodeChild[0])
        .map((nodeId) => [nodeId, nodeChild[1] + 1]);
      nodeDescendants.unshift(...nodeGrandChildren);
    }

    console.log("Final HTML:", finalHTML);

    const editor = new Editor({
      content: finalHTML,
      extensions: [
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
      ]
    });

    // If there are images, we will need to preload the buffers
    const opts = {
      getImageBuffer(src) {
        return Buffer.from(src);
      }
    };

    const nodeSerializer = {
      ...defaultNodes,
      hardBreak: defaultNodes.hard_break,
      codeBlock: defaultNodes.code_block,
      orderedList: defaultNodes.ordered_list,
      listItem: defaultNodes.list_item,
      bulletList: defaultNodes.bullet_list,
      horizontalRule: defaultNodes.horizontal_rule,
      image(state, node) {
        // No image
        state.renderInline(node);
        state.closeBlock(node);
      }
    };

    const docxSerializer = new DocxSerializer(nodeSerializer, defaultMarks);

    const wordDoc = docxSerializer.serialize(editor.state.doc, opts);

    // Prompt to save a 'My Filter' with extension .png or .jpeg
    const path = await save({
      filters: [
        {
          name: 'docx',
          extensions: ['docx'],
        },
      ],
    });

    console.log(path);

    const data = await Packer.toBuffer(wordDoc)

    await writeFile(
      path,
      data
    );
  }

  /**
  * 
  * @param {YTree} ytree 
  * @param {string} paperId 
  * 
  * @returns {string}
  */
  getHtmlFromPaper(ytree, paperId) {
    const paperMap = ytree.getNodeValueFromKey(paperId);

    const editor = new Editor({
      content: '<p>Getting HTML from paper</p>',
      extensions: [
        Collaboration.configure({
          fragment: paperMap.get("paper_xml"),
        }),
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
      ]
    });

    return editor.getHTML();
  }

  /**
  * 
  * @param {YTree} ytree 
  * @param {string} paperId 
  * @param {string} html 
  * 
  * @returns {string}
  */
  setHtmlToPaper(ytree, paperId, html) {
    const paperMap = ytree.getNodeValueFromKey(paperId);

    const editor = new Editor({
      content: '<p>Getting HTML from paper</p>',
      extensions: [
        Collaboration.configure({
          fragment: paperMap.get("paper_xml"),
        }),
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
      ]
    });

    editor.commands.setContent(html);

    return editor.getHTML();
  }
}

const dataManagerSubdocs = Object.freeze(new DataManagerSubdocs());

export default dataManagerSubdocs;



/**
 * Convert a Y.Doc Map to an array of [id, order_index] pairs
 * @param {Map<string, Y.Doc>} ydocMap
 */
export function getArrayFromYDocMap(ydocMap) {
  const array = new Array();

  for (const [id, ydoc] of ydocMap.entries()) {
    if (ydoc.getMap("library_props").has("order_index")) {
      array.push([id, ydoc.getMap("library_props").get("order_index")]);
    }
  }

  return array;
}
