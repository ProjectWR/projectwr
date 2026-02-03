import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import GrainyButton from "../../../design-system/GrainyButton";
import useOuterClick from "../../../design-system/useOuterClick";
import useTemplates from "../../hooks/useTemplates";
import { TipTapEditorDefaultPreferences } from "../../../editor/TipTapEditor/TipTapEditorDefaultPreferences";
import templateManager from "../../lib/templates";
import { YTree } from "yjs-orderedtree";
import DetailsPanel from "../LayoutComponents/DetailsPanel/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel/DetailsPanelDivider";
import { DetailsPanelBody } from "../LayoutComponents/DetailsPanel/DetailsPanelBody";
import {
  HoverListBody,
  HoverListButton,
  HoverListDivider,
  HoverListFooter,
  HoverListHeader,
  HoverListItem,
  HoverListShell,
} from "../LayoutComponents/HoverListShell";
import { DetailsPanelNameLabel } from "../LayoutComponents/DetailsPanel/DetailsPanelNameInput";

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
const PaperSettingsPanel = ({ libraryId, ytree, paperId }) => {
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

        <DetailsPanelNameLabel>
          {paperMapState.item_properties.item_title}
        </DetailsPanelNameLabel>
      </DetailsPanelHeader>

      <DetailsPanelDivider />
      <DetailsPanelBody>
        <div className="PaperActionButtons w-full h-fit flex flex-wrap items-center justify-start  gap-4">
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
                  "<p> Imported Content </p>",
                ),
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
