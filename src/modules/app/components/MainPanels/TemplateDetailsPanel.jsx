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
import TipTapEditor from "../../../editor/TIpTapEditor/TipTapEditor";
import templateManager from "../../lib/templates";
import { equalityDeep } from "lib0/function";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TemplateContentEditor from "./TemplateContentEditor";

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
    () => equalityDeep(templateRef.current, newTemplate),
    [newTemplate]
  );

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setNewTemplate({
      ...newTemplate,
      [name]: value,
    });
  };

  return (
    <div
      id="TemplateDetailsContainer"
      className={`h-full max-h-full flex flex-col items-center justify-start 
        ${deviceType === "mobile" && "w-full"}   
      `}
      style={
        deviceType === "desktop" && {
          width: `var(--detailsPanelWidth)`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
        }
      }
    >
      <div
        id="TemplateDetailsHeader"
        className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start py-1 px-1 
          ${deviceType === "desktop" && "px-6 mt-10"}
        `}
      >
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
          className="bg-appBackground flex-grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 px-2 pr-1 transition-colors duration-200 order-2"
          name="template_name"
          onChange={handleChange}
          value={newTemplate.template_name}
        />
      </div>

      <div className="w-[93.5%] h-px flex-shrink-0 bg-appLayoutBorder"></div>

      <motion.div
        id="TemplateDetailsBody"
        className="flex-grow min-h-0 w-full flex flex-col items-center justify-start py-4 px-6"
      >
        <AnimatePresence>
          {!wasTemplateChanged && (
            <motion.button
              initial={{
                height: 0,
                opacity: 0,
                marginTop: 0,
                marginBottom: 0,
                padding: 0,
              }}
              animate={{
                height: "var(--libraryManagerAddButtonSize)",
                opacity: 1,
                marginTop: `0`,
                marginBottom: "1rem",
                padding: `0.25rem`,
              }}
              exit={{
                height: 0,
                opacity: 0,
                marginTop: 0,
                marginBottom: 0,
                padding: 0,
              }}
              className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize transition-colors duration-100 rounded-full 
                hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight 
                flex items-center justify-center flex-shrink-0
            `}
              onClick={() => {
                templateManager.updateTemplate(templateId, newTemplate);
              }}
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
        <div className="w-full flex-grow min-h-0 border border-appLayoutBorder rounded-md">
          <div
            className="h-full w-full min-h-0 pr-3 py-4 overflow-y-scroll"
            style={{
              paddingLeft: `calc(0.75rem + 0.25rem + var(--libraryManagerAddButtonSize) / 2 - var(--libraryDirectoryBookNodeIconSize) / 2)`,
            }}
          >
            <TemplateContentEditor
              newTemplate={newTemplate}
              setNewTemplate={setNewTemplate}
              handleSave={() => {
                templateManager.updateTemplate(templateId, newTemplate);
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateDetailsPanel;
