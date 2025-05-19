import { useEffect, useMemo, useState } from "react";
import { appStore } from "../../../stores/appStore";
import { BubbleMenu, FloatingMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import ProsemirrorProofreadExtension from "../../../../editor/TipTapEditor/Extensions/ProsemirrorProofreadExtension";
import { RichTextEditor } from "@mantine/tiptap";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import useYMap from "../../../hooks/useYMap";
import { equalityDeep } from "lib0/function";
import { AnimatePresence, motion } from "motion/react";
import useMainPanel from "../../../hooks/useMainPanel";

const SortedNotes = ({ sortedNoteIds, libraryId, ytree }) => {
  return (
    <>
      {sortedNoteIds &&
        sortedNoteIds.map((noteId) => (
          <NoteCard
            key={noteId}
            noteId={noteId}
            libraryId={libraryId}
            ytree={ytree}
          />
        ))}
    </>
  );
};

export default SortedNotes;

const NoteCard = ({ noteId, libraryId, ytree }) => {
  const { deviceType } = useDeviceType();

  const { activatePanel } = useMainPanel();

  const itemMapState = useYMap(ytree.getNodeValueFromKey(noteId));

  const [initialItemProperties, setInitialItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
  });

  const [itemProperties, setItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
    item_description: itemMapState.item_properties.item_description,
  });

  useEffect(() => {
    setItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
    });

    setInitialItemProperties({
      item_title: itemMapState.item_properties.item_title,
      item_description: itemMapState.item_properties.item_description,
    });
  }, [noteId, itemMapState]);

  const unsavedChangesExist = useMemo(() => {
    console.log("CURRENTA ND INITIAL: ", itemProperties, initialItemProperties);
    return !equalityDeep(itemProperties, initialItemProperties);
  }, [itemProperties, initialItemProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setItemProperties({
      ...itemProperties,
      [name]: value,
    });
  };

  const handleSave = (e) => {
    const itemMap = ytree.getNodeValueFromKey(noteId);

    itemMap.set("item_properties", {
      item_title: itemProperties.item_title,
      item_description: itemProperties.item_description,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-fit bg-transparent shadow-lg shadow-appLayoutGentleShadow flex flex-col w-full border border-appLayoutBorder rounded-lg overflow-hidden"
      >
        <div className="h-noteCardHeaderHeight w-full flex pl-2">
          <input
            className={`bg-transparent  grow basis-0 min-w-0 h-full text-noteCardFontSizeThree  text-start
                    focus:bg-appLayoutInputBackground focus:outline-none text-appLayoutTextMuted focus:text-appLayoutText
                     px-1 py-px transition-colors duration-200`}
            name={"item_title"}
            onChange={handleChange}
            value={itemProperties.item_title}
          />
          <AnimatePresence>
            {unsavedChangesExist && (
              <motion.button
                onClick={handleSave}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: `var(--noteCardHeaderHeight)` }}
                exit={{ opacity: 0, width: 0 }}
                className="h-full p-px text-appLayoutText hover:text-appLayoutHighlight hover:bg-appLayoutInverseHover"
              >
                <span className="icon-[material-symbols-light--check-rounded] w-full h-full"></span>
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              console.log("LIBRARY ID AND NOTE ID", libraryId, noteId);
              activatePanel("libraries", "details", [libraryId, noteId]);
            }}
            className="w-fit px-1 h-full p-1 text-appLayoutText hover:text-appLayoutHighlight hover:bg-appLayoutInverseHover"
          >
            <span className="icon-[ion--enter-outline] w-noteCardHeaderHeight h-full"></span>
          </button>
        </div>

        <div className="divider w-full px-2">
          <div className="w-full h-px bg-appLayoutBorder"></div>
        </div>
        <NoteCardEditor
          itemProperties={itemProperties}
          setItemProperties={setItemProperties}
        />
      </motion.div>
    </AnimatePresence>
  );
};

const NoteCardEditor = ({
  itemProperties,
  setItemProperties,
  fixedSize = false,
  sizeMode = 3,
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
      console.log("Selecting Error Text:", errorText);
      setSelectingError(errorText);
    },
  });

  return (
    <div className="h-fit w-full">
      <RichTextEditor
        editor={editor}
        variant="subtle"
        classNames={{
          root: "bg-transparent border-none w-full border-appLayoutBorder rounded-none",
          toolbar: "bg-transparent border-b border-appLayoutBorder",
          content: `bg-transparent text-appLayoutText 
          ${fixedSize ? "h-nodeCardHeight" : " max-h-noteCardHeight min-h-fit"} 
          ${sizeMode === 1 && "text-noteCardFontSizeOne"} 
          ${sizeMode === 2 && "text-noteCardFontSizeTwo"} 
          ${sizeMode === 3 && "text-noteCardFontSizeThree"} 
          overflow-y-scroll p-2 NoteCardEditor`,
          controlsGroup: "bg-appBackground gap-1 rounded-lg",
          control:
            "bg-appBackground border-none border-appLayoutBorder text-appLayoutText overflow-hidden hover:bg-appLayoutInverseHover hover:text-appLayoutText  data-active:bg-appLayoutPressed data-active:shadow-inner shadow-appLayoutShadow",
        }}
      >
        <style>
          {`

          .NoteCardEditor > .tiptap.ProseMirror {
            padding: 0 0 0 0;
          }

          .NoteCardEditor > .spelling-error {
            background-color: #ff00001a;
            border-top-left-radius: calc(3px * var(--uiScale));
            border-top-right-radius: calc(3px * var(--uiScale));
            border-bottom: 1px solid #ff0000e6;
          }

          .NoteCardEditor > .tiptap.ProseMirror > h1 {
            font-size: calc(var(--uiScale) * 1.5rem);
            line-height: calc(var(--uiScale) * 1.5rem);
            padding-bottom: calc(var(--uiScale) * 0.25rem);
            margin-bottom: calc(var(--uiScale) * 0.5rem);
            font-family: serif;
            border-bottom: 1px solid hsl(var(--appLayoutBorder));

          }

          .NoteCardEditor > .tiptap.ProseMirror > h2 {
            font-size: calc(var(--uiScale) * 1.2rem);
            line-height: calc(var(--uiScale) * 1.2rem);
            padding-bottom: calc(var(--uiScale) * 0.1rem);
            margin-bottom: calc(var(--uiScale) * 0.25rem);
            font-family: serif;
            border-bottom: 1px solid hsl(var(--appLayoutBorder));

          }

          .NoteCardEditor > .tiptap.ProseMirror > ul {
            list-style: circle;
            padding-left: calc(1rem * var(--uiScale));
            margin: calc(0rem * var(--uiScale)) 1rem calc(0rem * var(--uiScale)) 0.4rem;
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
            <BubbleMenu editor={editor}>
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
            </FloatingMenu>
          </>
        )}

        <RichTextEditor.Content spellCheck={false} />
      </RichTextEditor>
    </div>
  );
};
