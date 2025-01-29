import { ReactEditor, useFocused, useSelected, useSlate } from "slate-react";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Range } from "slate";

const Caret = (props) => {
  console.log("caret rendered");
  // Update the position of the caret
  const editor = useRef(useSlate());
  const caretRef = useRef(null);
  const updateCaretPosition = useCallback(() => {
    if (
      !editor.current.selection ||
      !Range.isCollapsed(editor.current.selection)
    ) {
      if (caretRef.current) {
        caretRef.current.style.display = "none"; // Hide if no selection or selection is expanded
      }
      return;
    }

    // Get the DOM range of the selection
    const editable = document.getElementById("Editable");
    const domRange = ReactEditor.toDOMRange(
      editor.current,
      editor.current.selection
    );
    const rect = domRange.getBoundingClientRect();
    const editableRect = editable.getBoundingClientRect();

    if (caretRef.current) {
      caretRef.current.style.display = "block";
      caretRef.current.style.top = `${rect.top - editableRect.top - 2}px`;
      caretRef.current.style.left = `${rect.left - editableRect.left - 1.5}px`;
    }
  }, []);

  useEffect(() => {
    updateCaretPosition();
  });

  // Use contentEditable={false} to make it truly non-editable
  return (
    <span
      {...props.attributes}
      id="caret"
      ref={caretRef}
      contentEditable={false}
      data-slate-void
      aria-hidden="true" // Hide from screen readers
      tabIndex={-1} // Exclude from tab navigation  
      className={`display-inline-block w-[2px] h-[20px] bg-neutral-300 absolute pointer-events-none select-none animate-[blink_0.7s_ease-in-out_infinite] shadow-sm shadow-white`}
    >
      {/* Void nodes require at least one text node inside for Slate internals */}
      {props.children}
    </span>
  );
};
Caret.propTypes = {
  attributes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default Caret;
