import { motion } from "motion/react";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, FloatingMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RichTextEditor } from "@mantine/tiptap";
import ProsemirrorProofreadExtension from "../../../../editor/TipTapEditor/Extensions/ProsemirrorProofreadExtension";
import { appStore } from "../../../stores/appStore";
import { useMemo, useState } from "react";
import dictionaryManager from "../../../lib/dictionary";
import { wait } from "lib0/promise";
import ContextMenuWrapper from "../ContextMenuWrapper";

const progress_values = [
  { value: 0, weight: 2, color: "lightgray", label: "Drafting" },
  { value: 1, weight: 1, color: "peach", label: "Editing" },
  { value: 2, weight: 1, color: "lightgreen", label: "Done" },
];

export const DetailsPanelStatusProp = ({
  itemProperties,
  setItemProperties,
}) => {
  const item_progress = itemProperties.item_progress;
  const setItemProgress = (val) => {
    setItemProperties({
      ...itemProperties,
      item_progress: val,
    });
  };
  return (
    <div className="w-full h-fit">
      <div className="w-full h-[3rem] px-1 py-1 flex items-center gap-2 border border-appLayoutBorder rounded-md">
        <h2 className="w-fit h-fit px-2 flex justify-start items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
          Book Status
        </h2>
        {progress_values.map((progress) => {
          const selected = progress.value === item_progress;
          return (
            <motion.button
              type="button"
              key={progress.value}
              style={{
                flexGrow: progress.weight,
              }}
              className={`basis-0 h-full text-detailsPanelPropsFontSize text-appBackground relative rounded-md bg-appBackground transition-colors duration-500 ${
                !selected && "hover:bg-appLayoutInverseHover text-appLayoutText"
              }
              ${selected && ""}
          
              `}
              onClick={() => {
                setItemProgress(progress.value);
              }}
            >
              <span className="w-fit h-fit m-auto relative z-[2]">
                {progress.label}
              </span>
              {selected && (
                <motion.div
                  className="absolute h-full w-full top-0 left-0 z-[1] border border-appLayoutText bg-appLayoutHighlight rounded-md shadow-none shadow-appLayoutShadow"
                  layoutId="statusBackground"
                  id="statusBackground"
                ></motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export const DetailsPanelWordCountProp = ({
  currentWordCount,
  itemProperties,
  onChange,
}) => {
  return (
    <div className="w-full h-fit">
      <div className="w-full h-[3rem] px-1 py-1 flex items-center gap-2 border border-appLayoutBorder rounded-md">
        <h2 className="w-fit h-fit px-2 flex justify-start items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
          Word Count
        </h2>
        <span className="grow basis-0 h-fit px-2 flex justify-center items-center text-detailsPanelPropLabelFontSize text-appLayoutText">
          {currentWordCount}
        </span>
        <span className="w-fit h-fit px-2 flex justify-center items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
          /
        </span>
        <input
          value={itemProperties.item_goal}
          name={"item_goal"}
          onChange={onChange}
          className="grow basis-0 h-fit px-2 text-center focus:outline-none rounded-md text-detailsPanelPropLabelFontSize text-appLayoutTextMuted focus:text-appLayoutText focus:bg-appLayoutInputBackground transition-colors duration-200"
        />
      </div>
    </div>
  );
};

// const useStyles = createStyles((theme) => ({
//   RichTextEditor: {
//     root: {
//       backgroundColor: "hsl(var(--appBackground))",
//     },
//     content: {
//       backgroundColor: "hsl(var(--appBackground))",
//     },
//     toolbar: {
//       backgroundColor: "hsl(var(--appBackground))",
//     },
//   },
// }));

export const DetailsPanelDescriptionProp = ({
  itemProperties,
  setItemProperties,
  label = "Synopsis",
}) => {
  const setSearchQuery = appStore((state) => state.setSearchQuery);
  const [selectingError, setSelectingError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      ProsemirrorProofreadExtension,
    ],
    content: itemProperties.item_description,
    onUpdate: ({ editor }) => {
      setItemProperties({
        ...itemProperties,
        item_description: editor.getJSON(),
      });
    },
    onSelectionUpdate({ editor }) {
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

  const options = useMemo(() => {
    const options = [];

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
  }, [editor, selectingError, setSearchQuery]);

  return (
    <div className="w-full h-fit">
      <div className="w-full h-fit px-1 py-1 flex flex-col items-start gap-2 border border-appLayoutBorder rounded-md overflow-hidden">
        <h2 className="w-fit h-fit px-2 pt-1 flex justify-start items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
          {label}
        </h2>
        <ContextMenuWrapper options={options} triggerClassname="w-full h-fit">
          <RichTextEditor
            editor={editor}
            variant="subtle"
            classNames={{
              root: "bg-appBackground border border-appLayoutBorder rounded-lg px-1",
              toolbar: "bg-appBackground border-b border-appLayoutBorder",
              content:
                "bg-appBackground text-appLayoutText  max-h-[30rem] min-h-fit overflow-y-scroll px-3 py-3 text-detailsPanelPropFontSize DetailsPanelDescriptionProp",
              controlsGroup: "bg-appBackground gap-1",
              control:
                "bg-appBackground border-none border-appLayoutBorder text-appLayoutText overflow-hidden hover:bg-appLayoutInverseHover hover:text-appLayoutText  data-active:bg-appLayoutPressed data-active:shadow-inner shadow-appLayoutShadow",

            }}
          >
            <style>
              {`

          .DetailsPanelDescriptionProp > .tiptap.ProseMirror {
            padding: 0 0 0 0;
          }

          .DetailsPanelDescriptionProp > .spelling-error {
            background-color: #ff00001a;
            border-top-left-radius: calc(3px * var(--uiScale));
            border-top-right-radius: calc(3px * var(--uiScale));
            border-bottom: 1px solid #ff0000e6;
          }

          .DetailsPanelDescriptionProp > .tiptap.ProseMirror > h1 {
            font-size: calc(var(--uiScale) * 2rem);
            line-height: calc(var(--uiScale) * 2rem);
            padding-bottom: calc(var(--uiScale) * 0.5rem);
            margin-bottom: calc(var(--uiScale) * 1rem);
            font-family: serif;
            border-bottom: 1px solid hsl(var(--appLayoutBorder));

          }

          .DetailsPanelDescriptionProp > .tiptap.ProseMirror > h2 {
            font-size: calc(var(--uiScale) * 1.5rem);
            line-height: calc(var(--uiScale) * 1.5rem);
            padding-bottom: calc(var(--uiScale) * 0.25rem);
            margin-bottom: calc(var(--uiScale) * 0.5rem);
            font-family: serif;
            border-bottom: 1px solid hsl(var(--appLayoutBorder));

          }

          .DetailsPanelDescriptionProp > .tiptap.ProseMirror > ul {
            list-style: circle;
            padding-left: calc(2rem * var(--uiScale));
            margin: calc(0.5rem * var(--uiScale)) 1rem calc(0.5rem * var(--uiScale)) 0.4rem;
        
          }

          `}
            </style>
            {/* <RichTextEditor.Toolbar sticky stickyOffset="1rem">
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar> */}

            {editor && (
              <>
                <RichTextEditor.Toolbar sticky stickyOffset="1rem">
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.BulletList />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                {/* <BubbleMenu editor={editor}>
                  <RichTextEditor.ControlsGroup
                    classNames={{
                      controlsGroup:
                        "border border-appLayoutBorder shadow-xl shadow-appLayoutGentleShadow rounded-lg overflow-hidden",
                    }}
                  >
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.BulletList />
                  </RichTextEditor.ControlsGroup>
                </BubbleMenu>
                <FloatingMenu editor={editor}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.Highlight />
                  </RichTextEditor.ControlsGroup>
                </FloatingMenu> */}
              </>
            )}

            <RichTextEditor.Content spellCheck={false} />
          </RichTextEditor>
        </ContextMenuWrapper>
      </div>
    </div>
  );
};
