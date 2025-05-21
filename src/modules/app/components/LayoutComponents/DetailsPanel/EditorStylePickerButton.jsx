import { useEffect, useMemo, useState } from "react";
import itemLocalStateManager from "../../../lib/itemLocalState";
import useOuterClick from "../../../../design-system/useOuterClick";
import templateManager from "../../../lib/templates";
import { TipTapEditorDefaultPreferences } from "../../../../editor/TipTapEditor/TipTapEditorDefaultPreferences";
import {
  HoverListBody,
  HoverListButton,
  HoverListDivider,
  HoverListFooter,
  HoverListHeader,
  HoverListShell,
} from "../HoverListShell";
import { motion } from "motion/react";

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
export const EditorStylePickerButton = ({ libraryId, ytree, paperId }) => {
  const [pickingEditorStyle, setPickingEditorStyle] = useState(false);
  const [paperEditorTemplateId, setPaperEditorTemplateId] = useState(
    itemLocalStateManager.getPaperEditorTemplate(paperId)
  );

  const EditorStylePickerRef = useOuterClick(() => {
    setPickingEditorStyle(false);
  });

  const [templates, setTemplates] = useState({});

  useEffect(() => {
    const callback = async () => {
      setTemplates(await templateManager.getTemplates());
    };

    templateManager.addCallback(callback);

    callback();

    return () => {
      templateManager.removeCallback(callback);
    };
  }, []);

  const templateOfPaperId = useMemo(() => {
    if (templates[paperEditorTemplateId]) {
      return templates[paperEditorTemplateId];
    } else {
      return null;
    }
  }, [templates, paperEditorTemplateId]);

  console.log("templates: ", Object.entries(templates));

  useEffect(() => {
    const updatePaperEditorTemplateId = () => {
      setPaperEditorTemplateId(
        itemLocalStateManager.getPaperEditorTemplate(paperId)
      );
    };

    if (!itemLocalStateManager.hasItemLocalState(paperId)) {
      itemLocalStateManager.createItemLocalState(paperId, {
        type: "paper",
        libraryId: ytree._ydoc.guid,
      });
    }

    itemLocalStateManager.on(paperId, updatePaperEditorTemplateId);

    return () => {
      itemLocalStateManager.off(paperId, updatePaperEditorTemplateId);
    };
  }, [paperId]);

  const handleCreateTemplate = () => {
    const templateProps = {
      template_name: "New Template",
      template_editor: "TipTapEditor",
      template_content: TipTapEditorDefaultPreferences,
    };
    templateManager.createTemplate(templateProps);
  };

  return (
    <div
      ref={EditorStylePickerRef}
      className="relative mb-4 font-serif w-full h-fit border border-appLayoutBorder pt-detailsPanelPropLabelHeight rounded-md flex flex-col items-center"
    >
      <div className="w-[98.5%] h-px bg-appLayoutBorder"></div>

      <button
        id="EditorPicker"
        className="w-full h-fit py-2 flex justify-start items-center text-detailsPanelPropLabelFontSize px-3 rounded-b-md bg-appBackground hover:bg-appLayoutInverseHover"
        onClick={() => {
          setPickingEditorStyle(!pickingEditorStyle);
        }}
      >
        {templateOfPaperId ? paperEditorTemplateId : "Default Editor style"}
      </button>
      <label
        htmlFor="EditorPicker"
        className="absolute top-0 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-detailsPanelPropLabelHeight pt-1 pointer-events-none flex items-center justify-center"
      >
        Editor Style:
      </label>

      <HoverListShell condition={pickingEditorStyle}>
        <HoverListHeader>Pick an editor style:</HoverListHeader>
        <HoverListDivider />
        <HoverListBody>
          {Object.entries(templates).length != 0 && (
            <HoverListButton
              key={`resetToDefault`}
              onClick={() => {
                itemLocalStateManager.setPaperEditorTemplate(
                  paperId,
                  null,
                  libraryId
                );
                setPickingEditorStyle(false);
              }}
            >
              Use the default editor style
            </HoverListButton>
          )}

          {Object.entries(templates).length > 0 &&
            Object.entries(templates).map(([templateId, template]) => {
              return (
                <HoverListButton
                  key={templateId}
                  onClick={() => {
                    itemLocalStateManager.setPaperEditorTemplate(
                      paperId,
                      templateId,
                      libraryId
                    );
                    setPickingEditorStyle(false);
                  }}
                >
                  {templateId}
                </HoverListButton>
              );
            })}

          {Object.entries(templates).length == 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="noResults"
              style={{
                paddingTop: `var(--scrollbarWidth)`,
                paddingBottom: `var(--scrollbarWidth)`,
              }}
              className="px-1 h-actionBarResultNodeHeight flex items-center justify-center text-appLayoutTextMuted"
            >
              No existing editor styles found :{"("}
            </motion.div>
          )}
        </HoverListBody>
        <HoverListDivider />
        <HoverListFooter />
      </HoverListShell>
    </div>
  );
};
