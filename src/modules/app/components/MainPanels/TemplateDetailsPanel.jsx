import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../stores/appStore";
import TipTapEditor from "../../../editor/TipTapEditor/TipTapEditor";
import templateManager from "../../lib/templates";
import { equalityDeep, equalityFlat } from "lib0/function";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TemplateContentEditor from "./TemplateContentEditor";
import DetailsPanel from "../LayoutComponents/DetailsPanel.jsx/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelDivider";
import DetailsPanelBody from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelBody";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelNameInput";
import useMainPanel from "../../hooks/useMainPanel";

/**
 * TemplateDetailsPanel component for viewing and editing templates.
 * @param {{ templateId: string }} props
 * @returns {JSX.Element}
 */
const TemplateDetailsPanel = ({ templateId }) => {
  const { deviceType } = useDeviceType();

  const { activatePanel } = useMainPanel();

  console.log("TemplateDetailsPanel rendering: ", templateId);

  const setTemplateId = appStore((state) => state.setTemplateId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const [templateName, setTemplateName] = useState(templateId);

  const [templateFromFile, setTemplateFromFile] = useState(null);

  /* For the template edit form, should update everytime  */
  const [newTemplate, setNewTemplate] = useState(null);

  const wasTemplateNameChanged = useMemo(
    () => !equalityFlat(templateName, templateId),
    [templateId, templateName]
  );

  const wasTemplateChanged = useMemo(
    () => !equalityDeep(templateFromFile, newTemplate),
    [newTemplate, templateFromFile]
  );

  const [templateValid, setTemplateValid] = useState(true);

  const handleSave = useCallback(() => {
    if (templateValid && wasTemplateChanged) {
      templateManager.updateTemplate(templateId, newTemplate);
    }
  }, [newTemplate, templateId, wasTemplateChanged, templateValid]);

  useEffect(() => {
    const callback = async () => {
      try {
        const templateJSON = await templateManager.getTemplate(templateId);
        console.log("TEMPLATE JSON: ", templateJSON);
        setTemplateFromFile(templateJSON);
        setNewTemplate(templateJSON);
      } catch (e) {
        console.error(`Error finding template with name ${templateId}:`, e);
        setTemplateFromFile(null);
        setNewTemplate(null);
      }
    };

    templateManager.addCallback(callback);

    callback();

    return () => {
      templateManager.removeCallback(callback);
    };
  }, [templateId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setNewTemplate({
      ...newTemplate,
      [name]: value,
    });
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    setTemplateName(value);
  };

  const handleNameSave = useCallback(async () => {
    activatePanel("home", "", []);

    await templateManager.renameTemplate(templateId, templateName);
  }, [activatePanel, templateId, templateName]);

  return (
    <DetailsPanel>
      <DetailsPanelHeader>
        {deviceType === "mobile" && (
          <button
            className="w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-first"
            onClick={() => {
              setPanelOpened(true);
              setTemplateId("unselected");
            }}
          >
            <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
        )}

        <DetailsPanelNameInput
          name="template_name"
          onChange={handleNameChange}
          value={templateName}
        />

        <AnimatePresence>
          {templateValid && wasTemplateChanged && (
            <motion.button
              type="button"
              onClick={handleSave}
              initial={{
                width: 0,
                opacity: 0,
                marginLeft: 0,
                marginBottom: 0,
                padding: 0,
              }}
              animate={{
                width: "var(--libraryManagerAddButtonSize) ",
                opacity: 1,
                marginLeft: `0.5rem`,
                marginBottom: 0,
                padding: `0.25rem`,
              }}
              exit={{
                width: 0,
                opacity: 0,
                marginLeft: 0,
                marginBottom: 0,
                padding: 0,
              }}
              className={`h-libraryManagerAddButtonSize min-h-libraryManagerAddButtonSize transition-colors duration-100 rounded-full 
                hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                flex items-center justify-center order-3 mx-2
                `}
            >
              <motion.span
                animate={{
                  opacity: 1,
                }}
                className={`icon-[material-symbols-light--check-rounded] ${"hover:text-appLayoutHighlight"} rounded-full w-full h-full`}
              ></motion.span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wasTemplateNameChanged && (
            <motion.button
              type="button"
              onClick={handleNameSave}
              initial={{
                width: 0,
                opacity: 0,
                marginLeft: 0,
                marginBottom: 0,
                padding: 0,
              }}
              animate={{
                width: "var(--libraryManagerAddButtonSize) ",
                opacity: 1,
                marginLeft: `0.5rem`,
                marginBottom: 0,
                padding: `0.25rem`,
              }}
              exit={{
                width: 0,
                opacity: 0,
                marginLeft: 0,
                marginBottom: 0,
                padding: 0,
              }}
              className={`h-libraryManagerAddButtonSize min-h-libraryManagerAddButtonSize transition-colors duration-100 rounded-full 
                hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                flex items-center justify-center order-0 mx-2
                `}
            >
              <motion.span
                animate={{
                  opacity: 1,
                }}
                className={`icon-[material-symbols-light--check-rounded] ${"hover:text-appLayoutHighlight"} rounded-full w-full h-full`}
              ></motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </DetailsPanelHeader>

      <DetailsPanelDivider />

      <DetailsPanelBody>
        <div className="w-full grow min-h-0 border border-appLayoutBorder bg-appBackgroundAccent rounded-md">
          <div
            className="h-full w-full min-h-0 pr-1 py-4 overflow-y-scroll"
            style={{
              paddingLeft: `calc(0.25rem + var(--scrollbarWidth))`,
            }}
          >
            {templateFromFile && newTemplate && (
              <TemplateContentEditor
                newTemplate={newTemplate ? newTemplate : null}
                setNewTemplate={setNewTemplate}
                setTemplateValid={setTemplateValid}
              />
            )}
          </div>
        </div>
      </DetailsPanelBody>
    </DetailsPanel>
  );
};

export default TemplateDetailsPanel;
