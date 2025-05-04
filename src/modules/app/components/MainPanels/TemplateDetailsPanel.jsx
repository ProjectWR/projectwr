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
import { equalityDeep } from "lib0/function";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TemplateContentEditor from "./TemplateContentEditor";
import DetailsPanel from "../LayoutComponents/DetailsPanel.jsx/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelDivider";
import DetailsPanelBody from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelBody";

/**
 * TemplateDetailsPanel component for viewing and editing templates.
 * @param {{ templateId: string }} props
 * @returns {JSX.Element}
 */
const TemplateDetailsPanel = ({ templateId }) => {
  const { deviceType } = useDeviceType();

  console.log("TemplateDetailsPanel rendering: ", templateId);

  const setTemplateId = appStore((state) => state.setTemplateId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  if (templateManager.getTemplates()[templateId] === undefined) {
    setPanelOpened(true);
    setTemplateId("unselected");
    throw new Error("[templates] template id not found in local storage");
  }

  /* For useSyncExernalStore to check if object changed */
  const templateRef = useRef(templateManager.getTemplates()[templateId]);

  /* For the template edit form, should update everytime  */
  const [newTemplate, setNewTemplate] = useState(
    templateManager.getTemplates()[templateId]
  );

  const wasTemplateChanged = useMemo(
    () => !equalityDeep(templateRef.current, newTemplate),
    [newTemplate]
  );

  const [templateValid, setTemplateValid] = useState(true);

  const handleSave = useCallback(() => {
    if (templateValid && wasTemplateChanged) {
      templateManager.updateTemplate(templateId, newTemplate);
    }
  }, [newTemplate, templateId, wasTemplateChanged, templateValid]);

  useEffect(() => {
    const callback = () => {
      setNewTemplate(templateManager.getTemplates()[templateId]);
      templateRef.current = templateManager.getTemplates()[templateId];
    };

    templateManager.addCallback(callback);

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

        <input
          className="bg-appBackground grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 px-2 pr-1 transition-colors duration-200 order-2"
          name="template_name"
          onChange={handleChange}
          value={newTemplate.template_name}
        />

        <AnimatePresence>
          {templateValid && wasTemplateChanged && (
            <motion.button
              type="button"
              onClick={handleSave}
              initial={{
                width: 0,
                opacity: 0,

                padding: 0,
              }}
              animate={{
                width: "var(--libraryManagerAddButtonSize)",
                opacity: 1,

                padding: `0.25rem`,
              }}
              exit={{
                width: 0,
                opacity: 0,

                padding: 0,
              }}
              className={`h-libraryManagerAddButtonSize min-h-libraryManagerAddButtonSize transition-colors duration-100 rounded-full 
                hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                flex items-center justify-center shrink-0
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
            <TemplateContentEditor
              newTemplate={newTemplate}
              setNewTemplate={setNewTemplate}
              setTemplateValid={setTemplateValid}
            />
          </div>
        </div>
      </DetailsPanelBody>
    </DetailsPanel>
  );
};

export default TemplateDetailsPanel;
