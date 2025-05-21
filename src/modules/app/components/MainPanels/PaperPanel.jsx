import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TipTapEditor from "../../../editor/TipTapEditor/TipTapEditor";
import { AnimatePresence, motion } from "motion/react";
import { equalityDeep } from "lib0/function";
import itemLocalStateManager from "../../lib/itemLocalState";
import useTemplates from "../../hooks/useTemplates";
import { TipTapEditorDefaultPreferences } from "../../../editor/TipTapEditor/TipTapEditorDefaultPreferences";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel/DetailsPanelNameInput";
import DetailsPanel, {
  formClassName,
} from "../LayoutComponents/DetailsPanel/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel/DetailsPanelDivider";
import templateManager from "../../lib/templates";
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

const { desktopDefaultPreferences, mobileDefaultPreferences } =
  TipTapEditorDefaultPreferences;

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
const PaperPanel = ({ ytree, paperId, libraryId }) => {
  const { deviceType } = useDeviceType();
  const isMd = appStore((state) => state.isMd);

  const isMobile = deviceType === "mobile";

  console.log("paper panel rendering: ", paperId);

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);
  const setPanelOpened = appStore((state) => state.setPanelOpened);


  const setItemId = appStore((state) => state.setItemId);
  const [headerOpened, setHeaderOpened] = useState(true);

  const appStoreItemId = appStore((state) => state.appStoreItemId);
  const setItemMode = appStore((state) => state.setItemMode);
  const { activatePanel } = useMainPanel();
  const itemMode = appStore((state) => state.itemMode);

  const [templateFromFile, setTemplateFromFile] = useState(null);

  const preferences = useMemo(() => {
    if (
      !itemLocalStateManager.getPaperEditorTemplate(paperId) ||
      templateFromFile === null ||
      templateFromFile === undefined
    )
      return null;
    return isMobile
      ? templateFromFile?.template_content.mobileDefaultPreferences
      : templateFromFile?.template_content.desktopDefaultPreferences;
  }, [templateFromFile, isMobile, paperId]);

  useEffect(() => {
    const callback = async () => {
      try {
        const templateJSON = await templateManager.getTemplate(
          itemLocalStateManager.getPaperEditorTemplate(paperId)
        );
        setTemplateFromFile(templateJSON);
      } catch (e) {
        console.error(
          `Error finding template with name ${itemLocalStateManager.getPaperEditorTemplate(
            paperId
          )}:`,
          e
        );
        setTemplateFromFile(null);
      }
    };

    templateManager.addCallback(callback);

    callback();

    return () => {
      templateManager.removeCallback(callback);
    };
  }, [paperId]);

  useEffect(() => {
    if (deviceType === "mobile") {
      setShowActivityBar(false);
    }

    return () => {
      setShowActivityBar(true);
    };
  }, [setShowActivityBar, deviceType]);

  const itemMapState = useYMap(ytree.getNodeValueFromKey(paperId));

  const initialItemProperties = useRef({
    item_title: itemMapState.item_properties.item_title,
  });

  const [itemProperties, setItemProperties] = useState({
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

  console.log("PREFERENCES ", preferences);

  return (
    <DetailsPanel>
      <form
        noValidate
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleSave();
        }}
        className={formClassName}
      >
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
          />

          <DetailsPanelSubmitButton unsavedChangesExist={unsavedChangesExist} />

          <DetailsPanelButtonPlaceHolder />
          {/* <motion.div
            animate={{
              width:
                notesPanelOpened && (isMd || isNotesPanelAwake)
                  ? `${notesPanelWidth}px`
                  : 0,
            }}
            transition={{ ease: "linear", duration: 0.1 }}
          ></motion.div> */}
          {/* 
          <DetailsPanelButtonOnClick
            onClick={() => {
              if (isMd) {
                setNotesPanelOpened(!notesPanelOpened);
              } else {
                if (!(notesPanelOpened && isNotesPanelAwake)) {
                  setNotesPanelOpened(true);
                  refreshNotesPanel();
                }
              }
            }}
            exist={true}
            icon={
              notesPanelOpened && (isMd || isNotesPanelAwake) ? (
                <span className="icon-[bi--collection-fill] w-9/12 h-9/12"></span>
              ) : (
                <span className="icon-[bi--collection] w-9/12 h-9/12"></span>
              )
            }
          /> */}
        </DetailsPanelHeader>

        <DetailsPanelDivider />
        <DetailsPanelBody>
          <motion.div
            id="PaperBody"
            className="grow h-full  min-w-0 minbasis-0"
          >
            <TipTapEditor
              key={paperId}
              yXmlFragment={ytree.getNodeValueFromKey(paperId).get("paper_xml")}
              setHeaderOpened={setHeaderOpened}
              preferences={preferences}
            />
          </motion.div>
          {/* <DetailsPanelNotesPanel
            libraryId={libraryId}
            itemId={ytree.getNodeParentFromKey(paperId)}
            ytree={ytree}
            notesPanelWidth={notesPanelWidth}
            setNotesPanelWidth={setNotesPanelWidth}
            notesPanelOpened={notesPanelOpened}
            isNotesPanelAwake={isNotesPanelAwake}
            refreshNotesPanel={refreshNotesPanel}
            keepNotesPanelAwake={keepNotesPanelAwake}
          /> */}
        </DetailsPanelBody>
      </form>
    </DetailsPanel>
  );
};

export default PaperPanel;
