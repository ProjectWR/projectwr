import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../../stores/appStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { max, min } from "lib0/math";
import { YTree } from "yjs-orderedtree";
import useYMap from "../../../hooks/useYMap";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { equalityDeep } from "lib0/function";
import { DetailsPanelDescriptionProp } from "./DetailsPanelProps";

/**
 *
 * @param {{ytree: YTree, itemId: string, libraryId: string, notesPanelOpened: Function, isNotesPanelAwake: boolean, refreshNotesPanel: Function, keepNotesPanelAwake: Function}} param0
 * @returns
 */
export const DetailsPanelNotesPanel = ({
  libraryId,
  itemId,
  ytree,
  notesPanelOpened,
  isNotesPanelAwake,
  refreshNotesPanel,
  keepNotesPanelAwake,
}) => {
  const isMd = appStore((state) => state.isMd);
  const zoom = appStore((state) => state.zoom);

  const [notesPanelWidth, setNotesPanelWidth] = useState(360);

  const handleDrag = useCallback(
    (event, info) => {
      const rect = document
        .getElementById("NotesPanelMotionContainer")
        ?.getBoundingClientRect();

      const rectBody = document
        .getElementById("DetailsPanelBody")
        ?.getBoundingClientRect();

      if (!rect || !rectBody) return;

      let newWidth = info.point.x - rect.left;

      const MIN_WIDTH = 0.77 * zoom * 360;
      const MAX_WIDTH = 0.45 * rectBody.width;

      console.log("MIN AND MAX WIDTH: ", MIN_WIDTH, MAX_WIDTH);

      newWidth = min(MAX_WIDTH, max(MIN_WIDTH, newWidth));

      setNotesPanelWidth(newWidth);
    },
    [setNotesPanelWidth, zoom]
  );

  const noteIds = useMemo(() => {
    try {
      return ytree.getNodeChildrenFromKey(itemId);
    } catch (e) {
      console.error("Error fetching Note IDs in Notes Panel: ", e);
      return [];
    }
  }, [ytree, itemId]);

  return (
    <AnimatePresence mode="wait">
      {notesPanelOpened && (isMd || isNotesPanelAwake) && (
        <motion.div
          key="NotesPanelMotionContainer"
          id="NotesPanelMotionContainer"
          className={`h-full border-r border-appLayoutBorder z-5 bg-appBackgroundAccent ${
            !isMd &&
            "absolute top-0 left-0 bg-appBackgroundAccent/95 backdrop-blur-[1px]"
          } `}
          initial={{ opacity: 0, width: 0, minWidth: 0 }}
          animate={{
            opacity: 1,
            width: `${notesPanelWidth}px`,
            minWidth: `${notesPanelWidth}px`,
          }}
          exit={{ opacity: 0, width: 0, minWidth: 0 }}
          transition={{ duration: 0.05 }}
          onHoverStart={() => {
            keepNotesPanelAwake();
          }}
          onHoverEnd={() => {
            refreshNotesPanel();
          }}
        >
          <div className="w-full h-full flex flex-col relative">
            <div className="w-full h-[3rem] flex items-center justify-start px-3">
              Notes
            </div>
            <div className="grow w-full flex flex-col min-h-0 overflow-y-scroll">
              {noteIds &&
                noteIds.map((noteId) => (
                  <NoteCard
                    key={noteId}
                    noteId={noteId}
                    libraryId={libraryId}
                    ytree={ytree}
                  />
                ))}
            </div>
            <motion.div
              className="absolute h-full w-[6px] top-0 -right-[6px] z-50 hover:bg-sidePanelDragHandle cursor-w-resize"
              drag="x"
              dragConstraints={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              dragElastic={0}
              dragMomentum={false}
              onDrag={handleDrag}
            ></motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NoteCard = ({ noteId, libraryId, ytree }) => {
  const { deviceType } = useDeviceType();

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
    <div className="h-[20rem] w-full">
      <input
        className={`bg-appBackground w-full h-[2rem] text-detailsPanelNameFontSize text-center
                    focus:bg-appLayoutInputBackground rounded-t-lg focus:outline-none 
                     px-3 pb-1 transition-colors duration-200`}
        name={"item_title"}
        onChange={handleChange}
        value={itemProperties.item_title}
      />

      <DetailsPanelDescriptionProp
        itemProperties={itemProperties}
        setItemProperties={setItemProperties}
        label={"Note"}
      />
    </div>
  );
};
