import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { libraryStore } from "../../stores/libraryStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TipTapEditor from "../../../editor/TIpTapEditor/TipTapEditor";
import { AnimatePresence, motion } from "motion/react";
import GrainyButton from "../../../design-system/GrainyButton";
import useOuterClick from "../../../design-system/useOuterClick";
import useTemplates from "../../hooks/useTemplates";
import { TipTapEditorDefaultPreferences } from "../../../editor/TIpTapEditor/TipTapEditorDefaultPreferences";
import templateManager from "../../lib/templates";
import itemLocalStateManager from "../../lib/itemLocalState";
import { YTree } from "yjs-orderedtree";

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
const PaperSettingsPanel = ({ ytree, paperId }) => {
  console.log("library details panel rendering: ", paperId);

  const { deviceType } = useDeviceType();

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = libraryStore((state) => state.setItemId);

  const paperMapState = useYMap(ytree.getNodeValueFromKey(paperId));

  console.log("Paper Props Map STATE: ", paperMapState);

  return (
    <div
      id="PaperSettingsContainer"
      className={`h-full flex flex-col items-center justify-start 
      ${deviceType === "mobile" && "w-full"}   
      ${deviceType === "desktop" && "mt-10"}       
    `}
      style={
        deviceType === "desktop" && {
          width: `var(--detailsPanelWidth)`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
        }
      }
    >
      <div
        id="PaperSettingsHeader"
        className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start py-1 px-1 
          ${deviceType === "desktop" && "px-6"}
        `}
      >
        {deviceType === "mobile" && (
          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 ml-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center
             order-first
          `}
            onClick={() => {
              setPanelOpened(true);
              setItemId("unselected");
            }}
          >
            <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
        )}

        <p
          className="bg-appBackground flex-grow text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 my-2 px-2 pr-1 transition-colors duration-200"
          id="item_title"
        >
          {paperMapState.item_title}
        </p>
      </div>

      <div className="w-[93.5%] h-px bg-appLayoutBorder"></div>

      <div
        id="PaperSettingsBody"
        className="flex-grow w-full flex flex-col items-center justify-start border-b border-appLayoutBorder py-4 gap-3 px-6"
      >
        <EditorStylePickerButton ytree={ytree} paperId={paperId} />

        <div className="PaperActionButtons w-full h-fit flex flex-wrap items-center justify-start font-sans gap-4">
          <PaperActionButton
            onClick={() => {
              console.log("export paper button");
              dataManagerSubdocs.exportAllChildrenToDocx(ytree, paperId);
            }}
          >
            <div className="w-full h-full px-2 flex flex-col items-center justify-center text-libraryDetailsActionButtonFontSize">
              <span className="icon-[ph--download-thin] h-libraryDetailsActionButtonIconSize w-libraryDetailsActionButtonIconSize"></span>
              <span className="text-wrap">Export as .docx</span>
            </div>
          </PaperActionButton>
          <PaperActionButton
            onClick={() => {
              console.log("import paper button");
              console.log(
                dataManagerSubdocs.setHtmlToPaper(
                  ytree,
                  paperId,
                  "<p> Imported Content </p>"
                )
              );
            }}
          >
            <div className="w-full h-full px-1 flex flex-col items-center justify-center text-libraryDetailsActionButtonFontSize">
              <span className="icon-[ph--upload-thin] h-libraryDetailsActionButtonIconSize w-libraryDetailsActionButtonIconSize"></span>
              <span className="text-wrap">Import from .docx</span>
            </div>
          </PaperActionButton>
        </div>
      </div>
    </div>
  );
};

export default PaperSettingsPanel;

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
const EditorStylePickerButton = ({ ytree, paperId }) => {
  const [pickingEditorStyle, setPickingEditorStyle] = useState(false);
  const [paperEditorTemplateId, setPaperEditorTemplateId] = useState(
    itemLocalStateManager.getPaperEditorTemplate(paperId)
  );

  const EditorStylePickerRef = useOuterClick(() => {
    setPickingEditorStyle(false);
  });

  const templates = useTemplates();

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
      className="relative w-full h-fit border border-appLayoutBorder pt-detailsPanelPropLabelHeight rounded-md flex flex-col items-center"
    >
      <div className="w-[98.5%] h-px bg-appLayoutBorder"></div>
      <button
        id="EditorPicker"
        className="w-full h-templateDetailsPreferenceInputHeight flex justify-start items-center text-detailsPanelPropsFontSize px-3 rounded-b-md bg-appBackground hover:bg-appLayoutInverseHover"
        onClick={() => {
          setPickingEditorStyle(!pickingEditorStyle);
        }}
      >
        {templateOfPaperId?.template_name || "No editor style selected"}
      </button>
      <label
        htmlFor="EditorPicker"
        className="absolute top-0 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-detailsPanelPropLabelHeight pt-1 pointer-events-none flex items-center justify-center"
      >
        Editor Style:
      </label>

      <AnimatePresence>
        {pickingEditorStyle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute top-[105%] pt-1 px-1 h-fit w-full bg-appBackground rounded-md z-[1000] border border-appLayoutInverseHover overflow-hidden shadow-2xl shadow-appLayoutGentleShadow flex items-center flex-col"
          >
            <div className="w-full px-2 h-actionBarSearchHeaderHeight text-actionBarResultHeaderTextSize text-appLayoutTextMuted flex items-center">
              Pick an editor style:
            </div>
            <div className="w-[98.5%] h-px flex-shrink-0 bg-appLayoutBorder"></div>
            <div
              style={{
                paddingLeft: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                maxHeight: `calc(var(--actionBarSearchMaxHeight) / 2)`,
              }}
              className="w-full overflow-y-scroll text-actionBarResultTextSize flex flex-col py-1"
            >
              {Object.entries(templates).length > 0 &&
                Object.entries(templates).map(([templateId, template]) => {
                  return (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={templateId}
                      style={{
                        paddingTop: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                        paddingBottom: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                      }}
                      className="px-3 h-actionBarResultNodeHeight w-full flex items-center hover:bg-appLayoutInverseHover rounded-md "
                      onClick={() => {
                        itemLocalStateManager.setPaperEditorTemplate(
                          paperId,
                          templateId
                        );
                        setPickingEditorStyle(false);
                      }}
                    >
                      {template.template_name}
                    </motion.button>
                  );
                })}

              {Object.entries(templates).length == 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="noResults"
                  style={{
                    paddingTop: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                    paddingBottom: `calc(0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
                  }}
                  className="px-1 h-actionBarResultNodeHeight flex items-center justify-center text-appLayoutTextMuted"
                >
                  No existing editor styles found :{"("}
                </motion.div>
              )}
            </div>
            <div className="w-[98.5%] h-px flex-shrink-0 bg-appLayoutBorder"></div>

            <div className="w-full px-2 h-actionBarSearchFooterHeight text-actionBarResultHeaderTextSize flex items-center"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const PaperActionButton = ({ children, onClick, disabled = false }) => (
  <GrainyButton
    disabled={disabled}
    size={10}
    onClick={onClick}
    className={`h-libraryDetailsActionButtonHeight w-libraryDetailsActionButtonWidth rounded-lg overflow-hidden border border-appLayoutBorder`}
  >
    <div className="h-full w-full">{children}</div>
  </GrainyButton>
);
