import { Extension } from "@tiptap/core";
import { max } from "lib0/math";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { motion } from "motion/react";
import { animate } from "motion";

const virtualCursorPluginKey = new PluginKey("virtualCursor");

const VirtualCursor = Extension.create({
  name: "virtualCursor",

  addProseMirrorPlugins() {
    // Reference to the virtual cursor DOM element
    let virtualCursorElement = null;

    return [
      new Plugin({
        key: virtualCursorPluginKey,
        state: {
          init(_, { doc }) {
            // Initialize an empty DecorationSet
            return DecorationSet.empty;
          },
          apply(tr, oldDecorations) {
            // Get the action metadata
            const action = tr.getMeta(virtualCursorPluginKey);

            if (action && action.type === "hideVirtualCursor") {
              virtualCursorElement.style.display = "none";
            }

            if (action && action.type === "addVirtualCursor") {
              const pos = action.position;

              if (
                virtualCursorElement &&
                document.querySelector(".virtual-cursor")
              ) {
                // Update the existing virtual cursor styles
                virtualCursorElement.style.display = "block";
                virtualCursorElement.style.top = `${pos.top - 1}px`;
                virtualCursorElement.style.left = `${pos.left - 1}px`;
                virtualCursorElement.style.height = `${pos.fontSize + 2}px`;

                // Return the existing DecorationSet
                return oldDecorations;
              } else {
                // Create a new virtual cursor decoration
                const cursorDecoration = Decoration.widget(0, () => {
                  const cursor = document.createElement("span");

                  cursor.className =
                    "absolute virtual-cursor w-[2px] bg-neutral-300 pointer-events-none select-none  animate-[blink_0.7s_ease-in-out_infinite] shadow-sm shadow-white";

                  cursor.style.top = `${pos.top - 1}px`;
                  cursor.style.left = `${pos.left - 1}px`;
                  cursor.style.height = `${pos.fontSize + 2}px`;

                  // Store reference to the DOM element
                  virtualCursorElement = cursor;

                  return cursor;
                });

                const newDecorations = DecorationSet.create(tr.doc, [
                  cursorDecoration,
                ]);

                return newDecorations;
              }
            }

            // Map decorations as the document changes
            return oldDecorations.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            const decorations = this.getState(state);
            return decorations;
          },
        },
      }),
    ];
  },

  // Add a command to update the virtual cursor
  addCommands() {
    return {
      addVirtualCursor:
        (position) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(virtualCursorPluginKey, {
              type: "addVirtualCursor",
              position,
            });
          }
          return true;
        },
      hideVirtualCursor:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(virtualCursorPluginKey, {
              type: "hideVirtualCursor",
            });
          }
          return true;
        },
    };
  },
});

export default VirtualCursor;
