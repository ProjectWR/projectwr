import React, { useCallback, useEffect, useMemo } from "react";
import { createEditor, Editor, Transforms, Range } from "slate";
import {
  DefaultElement,
  Editable,
  ReactEditor,
  Slate,
  withReact,
} from "slate-react";
import { withYHistory, withYjs, YjsEditor } from "@slate-yjs/core";
import PropTypes from "prop-types";
import Caret from "./Caret";
import HoveringToolbar, {
  toggleMark,
  toggleBlock,
  isMarkActive,
  isBlockActive,
} from "./HoveringToolbar";
import WritingAppButton from "../../design-system/WritingAppButton";

const initialValue = [
  {
    type: "caret",
    children: [{ text: "" }],
  },
  {
    children: [{ text: "" }],
  },
];

const BaseEditor = ({ sharedType }) => {
  const editor = useMemo(() => {
    const e = withYHistory(withReact(withYjs(createEditor(), sharedType)));

    const { isVoid, apply, normalizeNode, deleteBackward } = e;

    e.isVoid = (element) => {
      return element.type === "caret" || isVoid(element);
    };

    e.apply = (operation) => {
      const { node } = operation;
      if (operation.type === "remove_node" && node && node.type === "caret") {
        return;
      }

      apply(operation);
    };

    e.normalizeNode = (entry) => {
      const [node] = entry;

      // Ensure caret exists as the first node
      if (Editor.isEditor(node)) {
        if (!node.children.some((n) => n.type === "caret")) {
          Transforms.insertNodes(
            e,
            { type: "caret", children: [{ text: "" }] },
            { at: [0] }
          );
        }

        // Ensure there is always one empty text node
        const hasTextNode = node.children.some(
          (n) => Editor.isBlock(e, n) && n.type !== "caret"
        );

        if (!hasTextNode) {
          Transforms.insertNodes(
            e,
            {
              children: [{ text: "" }],
            },
            { at: [1] }
          );
        }
      }

      normalizeNode(entry);
    };

    e.deleteBackward = (unit) => {
      if (
        editor.selection &&
        Range.isCollapsed(editor.selection) && // Ensure selection is collapsed
        Editor.isStart(editor, editor.selection.anchor, [1, 0]) // Check if selection is at start of block [1]
      ) {
        console.log("Preventing backspace at the start of block [1]");
        return; // Block the backspace
      }

      deleteBackward(unit); // Default behavior for all other cases
    };

    return e;
  }, [sharedType]);

  useEffect(() => {
    console.log("editor changed");
    YjsEditor.connect(editor);

    return () => {
      YjsEditor.disconnect(editor);
    };
  }, [editor]);

  useEffect(() => {
    console.log("Editor was rerendered");
  });

  const focusOnSelection = () => {
    console.log("focusing on Selection");
    if (!editor.selection || !Range.isCollapsed(editor.selection)) {
      return;
    }

    // Get DOM elements
    const container = document.getElementById("EditableContainer");
    const domRange = ReactEditor.toDOMRange(editor, editor.selection);
    const rect = domRange.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate relative position
    const relativeY = rect.top - containerRect.top;
    const buffer = 150; // pixels from bottom before scrolling

    // Calculate desired scroll adjustments
    let scrollAdjustment = 0;

    // Too close to bottom
    if (relativeY + rect.height + buffer > container.clientHeight) {
      scrollAdjustment =
        relativeY + rect.height + buffer - container.clientHeight;
    }
    // Too close to top
    else if (relativeY < buffer) {
      scrollAdjustment = relativeY - buffer;
    }

    // Apply scroll if needed
    if (scrollAdjustment !== 0) {
      container.scrollBy({
        top: scrollAdjustment,
        behavior: "smooth",
      });
    }
  };

  const preventCaretSelect = () => {
    if (!editor.selection?.anchor || !Range.isCollapsed(editor.selection)) {
      return;
    }

    if (
      editor.selection.anchor.path[0] === 0 &&
      editor.selection.anchor.path[1] === 0 &&
      editor.selection.focus.path[0] === 0 &&
      editor.selection.focus.path[1] === 0
    ) {
      Transforms.select(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    }
  };

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={() => {
        if (editor.operations.every((op) => op.type === "set_selection")) {
          console.log("SELECTION CHANGED!");
          console.log("location: ", editor.selection);
          focusOnSelection();
        }
      }}
    >
      <div id="EditableContainer" className="h-full w-full flex flex-col">
        <div
          id="EditableToolbar"
          className={`h-[2.5rem] min-h-[2.5rem] pl-1 border-t border-x border-border rounded-t-[0.75rem] flex justify-start items-center`}
        >
          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleMark(editor, "bold")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-bold] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleMark(editor, "italic")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-italic] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleMark(editor, "underlined")}
            buttonContent={
              <span className="w-[1.9rem] h-[1.7rem] flex items-center justify-center">
                {" "}
                <span className="icon-[proicons--text-underline] w-[1.5rem] h-[1.5rem] text-white"></span>
              </span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "heading-one")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-h1] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "heading-two")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-h2] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "block-quote")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-quote] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "numbered-list")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-list-numbered] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "bulleted-list")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-list-bulleted] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "left")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-align-left] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "right")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-align-right] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "center")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-align-center] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <WritingAppButton
            className="w-fit h-fit p-1 border-r border-border hover:bg-hover"
            reversed
            onClick={() => toggleBlock(editor, "justify")}
            buttonContent={
              <span className="icon-[material-symbols-light--format-align-justify] w-[1.9rem] h-[1.7rem] text-white"></span>
            }
          />

          <div className="w-[20rem] h-full p-1">
            <input
              className="w-full h-full bg-neutral-800 rounded-sm px-2 focus:outline-none"
              placeholder="Search"
            />
          </div>
        </div>
        <div className="flex-grow w-full flex justify-center border border-neutral-800 rounded-b-lg  overflow-y-scroll min-h-0 text-neutral-400 shadow-inner shadow-black">
          <HoveringToolbar />
          <Editable
            id="Editable"
            renderLeaf={(props) => <Leaf {...props} />}
            renderElement={Element}
            scrollSelectionIntoView={focusOnSelection}
            className="caret-transparent min-h-full h-fit w-[55rem] focus:outline-none border border-neutral-600 my-[2rem] px-[6rem] pt-[5rem] pb-[50%] text-xl shadow-xl rounded-[0.75rem] shadow-black relative"
            onDOMBeforeInput={(event) => {
              switch (event.inputType) {
                case "formatBold":
                  event.preventDefault();
                  return toggleMark(editor, "bold");
                case "formatItalic":
                  event.preventDefault();
                  return toggleMark(editor, "italic");
                case "formatUnderline":
                  event.preventDefault();
                  return toggleMark(editor, "underlined");
              }
            }}
          />
        </div>
      </div>
    </Slate>
  );
};
BaseEditor.propTypes = {
  sharedType: PropTypes.object.isRequired,
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underlined) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};
Leaf.propTypes = {
  attributes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  leaf: PropTypes.object.isRequired,
};

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case "caret":
      return <Caret {...attributes} />;
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

export default React.memo(BaseEditor);
