import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TipTapEditor from "../../../editor/TipTapEditor/TipTapEditor";
import { AnimatePresence, motion } from "motion/react";
import { equalityDeep } from "lib0/function";
import useTemplates from "../../hooks/useTemplates";
import { TipTapEditorDefaultPreferences } from "../../../editor/TipTapEditor/TipTapEditorDefaultPreferences";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel/DetailsPanelNameInput";
import DetailsPanel, {
  formClassName,
} from "../LayoutComponents/DetailsPanel/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel/DetailsPanelDivider";
import useMainPanel from "../../hooks/useMainPanel";
import { getAncestorsForBreadcrumbs } from "../../lib/util";
import {
  DetailsPanelButtonOnClick,
  DetailsPanelButtonPlaceHolder,
  DetailsPanelSubmitButton,
  PopOverTargetButton,
} from "../LayoutComponents/DetailsPanel/DetailsPanelSubmitButton";
import { DetailsPanelBody } from "../LayoutComponents/DetailsPanel/DetailsPanelBody";
import { DetailsPanelNotesPanel } from "../LayoutComponents/DetailsPanel/DetailsPanelNotesPanel";
import useRefreshableTimer from "../../hooks/useRefreshableTimer";
import { Popover, PopoverDropdown, Text } from "@mantine/core";
import { EditorStylePickerButton } from "../LayoutComponents/DetailsPanel/EditorStylePickerButton";
import { useFullscreen } from "@mantine/hooks";
import { useViewportSize } from "@mantine/hooks";
import { getCurrentWindow } from "@tauri-apps/api/window";
import templateManager from "../../lib/templates";
import { useKeyLocalState } from "../../hooks/useLocalState";
import useItemContextMenu from "../../hooks/useItemContextMenu";
import ContextMenuWrapper from "../LayoutComponents/ContextMenuWrapper";
import DialogWrapper from "../LayoutComponents/DialogWrapper";
import driveOrchestrator from "../../lib/drive/driveOrchestrator";
import persistenceManagerForSubdocs from "../../lib/persistenceSubDocs";

/**
 *
 * @param {{ytree: YTree, paperId: string, libraryId: string}} param0
 * @returns
 */
const PaperPanel = ({ ytree, paperId, libraryId }) => {
  const { deviceType } = useDeviceType();

  const { ref, toggle, fullscreen } = useFullscreen();
  useViewportSize();

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const setItemId = appStore((state) => state.setItemId);
  const [headerOpened, setHeaderOpened] = useState(true);

  const { editorStyle: paperEditorTemplateId, lastSelectionPosition } =
    useKeyLocalState(libraryId, paperId);

  const [templateContent, setTemplateContent] = useState(null);

  console.log("paper panel rendering: ", paperId, lastSelectionPosition);

  const itemMapState = useYMap(ytree.getNodeValueFromKey(paperId));

  const [itemProperties, setItemProperties] = useState({
    item_title: itemMapState.item_properties.item_title,
  });

  const {
    options,
    deleteConfirmDialog,
    setDeleteConfirmDialog,
    deleteFromDrive,
    setDeleteFromDrive,
    userProfile,
    driveSyncLoading,
  } = useItemContextMenu({
    itemId: paperId,
    itemType: "paper",
    libraryId: libraryId,
    ytree: ytree,
    itemTitle: itemProperties.item_title,
    formId: "PaperDetailsContent",
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      if (paperEditorTemplateId && paperEditorTemplateId !== "unselected") {
        try {
          const template = await templateManager.getTemplate(
            paperEditorTemplateId,
          );
          setTemplateContent(template);
        } catch (e) {
          console.error("Error fetching template", e);
          setTemplateContent(null);
        }
      } else {
        setTemplateContent(null);
      }
    };
    fetchTemplate();
  }, [paperEditorTemplateId]);

  const preferences = useMemo(() => {
    if (!templateContent) return null;
    return deviceType === "mobile"
      ? templateContent.template_content.mobileDefaultPreferences
      : templateContent.template_content.desktopDefaultPreferences;
  }, [templateContent, deviceType]);

  useEffect(() => {
    if (deviceType === "mobile") {
      setShowActivityBar(false);
    }

    return () => {
      setShowActivityBar(true);
    };
  }, [setShowActivityBar, deviceType]);

  const initialItemProperties = useRef({
    item_title: itemMapState.item_properties.item_title,
  });

  useEffect(() => {
    setItemProperties({
      item_title: itemMapState.item_properties.item_title,
    });

    initialItemProperties.current = {
      item_title: itemMapState.item_properties.item_title,
    };
  }, [paperId, itemMapState]);

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(itemProperties, initialItemProperties.current);
  }, [itemProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemProperties({
      ...itemProperties,
      [name]: value,
    });
  };

  const handleSave = () => {
    const paperMap = ytree.getNodeValueFromKey(paperId);

    paperMap.set("item_properties", {
      item_title: itemProperties.item_title,
    });
  };

  return (
    <ContextMenuWrapper triggerClassname="w-full h-full" options={options}>
      <DetailsPanel>
        <form
          noValidate
          onSubmit={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSave();
          }}
          className={formClassName}
          id="PaperDetailsContent"
        >
          <DetailsPanelHeader>
            <Popover
              offset={{ mainAxis: 6, crossAxis: 5 }}
              classNames={{
                dropdown:
                  "w-[30rem] min-w-[30rem] h-[30rem] shadow-md shadow-appLayoutGentleShadow bg-appBackgroundAccent/90 border border-appLayoutBorder text-appLayoutText backdrop-blur-sm",
                arrow: "border border-appLayoutBorder",
              }}
              position="bottom-start"
            >
              {" "}
              <PopOverTargetButton>
                <span className="icon-[bi--sliders2] w-[70%] h-[70%]"></span>
              </PopOverTargetButton>
              <PopoverDropdown>
                <EditorStylePickerButton
                  ytree={ytree}
                  paperId={paperId}
                  libraryId={libraryId}
                />
              </PopoverDropdown>
            </Popover>

            <DetailsPanelNameInput
              name="item_title"
              onChange={handleChange}
              value={itemProperties.item_title}
              unsavedChangesExist={unsavedChangesExist}
            />

            <DetailsPanelSubmitButton
              unsavedChangesExist={unsavedChangesExist}
            />

            <DetailsPanelButtonOnClick
              exist={true}
              onClick={async () => {
                await getCurrentWindow().setDecorations(true);
                await getCurrentWindow().setFullscreen(!fullscreen);
                await toggle();
              }}
              icon={
                <span className="icon-[material-symbols-light--fullscreen] w-9/12 h-9/12"></span>
              }
            />
          </DetailsPanelHeader>

          <DetailsPanelDivider />
          <DetailsPanelBody>
            <motion.div
              id="PaperBody"
              ref={ref}
              className="grow h-full min-h-0 min-w-0 minbasis-0"
            >
              <TipTapEditor
                key={`${paperId}-${paperEditorTemplateId}`}
                libraryId={libraryId}
                paperId={paperId}
                yXmlFragment={ytree
                  .getNodeValueFromKey(paperId)
                  .get("paper_xml")}
                setHeaderOpened={setHeaderOpened}
                preferences={preferences}
                lastSelectionPosition={lastSelectionPosition}
              />
            </motion.div>
          </DetailsPanelBody>
        </form>
      </DetailsPanel>

      <DialogWrapper
        open={deleteConfirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmDialog({
              open: false,
              itemId: null,
              itemType: null,
              itemTitle: null,
            });
          }
        }}
        title={`Delete ${deleteConfirmDialog.itemType}`}
        description={`Are you sure you want to delete "${
          deleteConfirmDialog.itemTitle
        }"? This action cannot be undone.`}
        onSubmit={async () => {
          dataManagerSubdocs.deleteItem(ytree, deleteConfirmDialog.itemId);
          setDeleteConfirmDialog({
            open: false,
            itemId: null,
            itemType: null,
            itemTitle: null,
          });
          setPanelOpened(true);
        }}
        submitLabel="Delete"
        destructive={true}
      />
    </ContextMenuWrapper>
  );
};

export default PaperPanel;

PaperPanel.propTypes = {
  ytree: PropTypes.object.isRequired,
  paperId: PropTypes.string.isRequired,
  libraryId: PropTypes.string.isRequired,
};
