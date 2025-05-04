import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TipTapEditor from "../../../editor/TipTapEditor/TipTapEditor";
import { AnimatePresence, motion } from "motion/react";
import GrainyButton from "../../../design-system/GrainyButton";
import useOuterClick from "../../../design-system/useOuterClick";
import useTemplates from "../../hooks/useTemplates";
import { TipTapEditorDefaultPreferences } from "../../../editor/TipTapEditor/TipTapEditorDefaultPreferences";
import templateManager from "../../lib/templates";
import itemLocalStateManager from "../../lib/itemLocalState";
import { YTree } from "yjs-orderedtree";
import DetailsPanel from "../LayoutComponents/DetailsPanel.jsx/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelDivider";
import DetailsPanelBody from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelBody";
import {
  HoverListBody,
  HoverListButton,
  HoverListDivider,
  HoverListFooter,
  HoverListHeader,
  HoverListItem,
  HoverListShell,
} from "../LayoutComponents/HoverListShell";

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
const PaperSettingsPanel = ({ ytree, paperId }) => {
  console.log("library details panel rendering: ", paperId);

  const { deviceType } = useDeviceType();

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);

  const paperMapState = useYMap(ytree.getNodeValueFromKey(paperId));

  console.log("Paper Props Map STATE: ", paperMapState);

  return (
    <DetailsPanel>
      <DetailsPanelHeader>
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
          className="bg-appBackground grow text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 my-2 px-2 pr-1 transition-colors duration-200"
          id="item_title"
        >
          {paperMapState.item_title}
        </p>
      </DetailsPanelHeader>

      <DetailsPanelDivider />
      <DetailsPanelBody>
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
      </DetailsPanelBody>
    </DetailsPanel>
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
      className="relative mb-4 w-full h-fit border border-appLayoutBorder pt-detailsPanelPropLabelHeight rounded-md flex flex-col items-center"
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

      <HoverListShell condition={pickingEditorStyle}>
        <HoverListHeader>Pick an editor style:</HoverListHeader>
        <HoverListDivider />
        <HoverListBody>
          {Object.entries(templates).length > 0 &&
            Object.entries(templates).map(([templateId, template]) => {
              return (
                <HoverListButton
                  key={templateId}
                  onClick={() => {
                    itemLocalStateManager.setPaperEditorTemplate(
                      paperId,
                      templateId
                    );
                    setPickingEditorStyle(false);
                  }}
                >
                  {template.template_name}
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
