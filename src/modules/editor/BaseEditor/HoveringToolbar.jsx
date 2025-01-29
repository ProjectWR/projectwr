import { useSlate, useFocused } from "slate-react";
import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { cx, css } from "@emotion/css";
import { Editor, Range, Transforms, Element as SlateElement } from "slate";
import WritingAppButton from "../../design-system/WritingAppButton";

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const Button = React.forwardRef(
  ({ className, active, reversed, ...props }, ref) => {
    const getColor = () => {
      if (reversed) {
        return active ? "white" : "#aaa";
      }
      return active ? "black" : "#ccc";
    };

    return (
      <span
        {...props}
        ref={ref}
        className={cx(
          className,
          css`
            cursor: pointer;
            color: ${getColor()};
          `
        )}
      />
    );
  }
);

Button.displayName = "Button";

const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    data-test-id="menu"
    ref={ref}
    className={cx(
      className,
      css`
        & > * {
          display: inline-block;
        }

        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
));

Menu.displayName = "Menu";

const Portal = ({ children }) => {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

const FormatButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <WritingAppButton
      reversed
      isPressed={isMarkActive(editor, format)}
      onClick={() => toggleMark(editor, format)}
      buttonContent={icon}
    />
  );
};

FormatButton.propTypes = {
  format: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
};

const HoveringToolbar = () => {
  const ref = useRef();
  const editor = useSlate();
  const inFocus = useFocused();
  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;
    if (!el) {
      return;
    }

    if (
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.removeAttribute("style");
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = "1";
    el.style.top = `${rect.top + window.scrollY - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.scrollX - el.offsetWidth / 2 + rect.width / 2
    }px`;

    console.log("rendering hovering toolbar");
  });
  return (
    <Portal>
      <div
        ref={ref}
        className={` absolute z-1 top-[-10000px] left-[-10000px] opacity-0 bg-neutral-900 border-neutral-700 border shadow-sm shadow-black rounded-md transition-opacity duration-500 h-fit flex items-center justify-center w-fit`}
        onMouseDown={(e) => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault();
        }}
      >
        <WritingAppButton
          className="w-fit h-fit p-1 rounded-l-lg"
          reversed
          isPressed={isMarkActive(editor, "bold")}
          onClick={() => toggleMark(editor, "bold")}
          buttonContent={
            <span className="icon-[material-symbols-light--format-bold] w-[1.7rem] h-[1.7rem] text-white"></span>
          }
        />

        <WritingAppButton
          className="w-fit h-fit p-1"
          reversed
          isPressed={isMarkActive(editor, "italic")}
          onClick={() => toggleMark(editor, "italic")}
          buttonContent={
            <span className="icon-[material-symbols-light--format-italic] w-[1.7rem] h-[1.7rem] text-white"></span>
          }
        />

        <WritingAppButton
          className="w-fit h-fit p-1 rounded-r-lg"
          reversed
          isPressed={isMarkActive(editor, "underlined")}
          onClick={() => toggleMark(editor, "underlined")}
          buttonContent={
            <span className="icon-[material-symbols-light--format-underlined] w-[1.7rem] h-[1.7rem] text-white"></span>
          }
        />
      </div>
    </Portal>
  );
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};
export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  const isList = LIST_TYPES.includes(format);
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes(editor, newProperties);
  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );
  return !!match;
};

export default HoveringToolbar;
