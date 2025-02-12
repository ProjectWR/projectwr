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
import { templateStore } from "../../stores/templateStore";
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

  const setTemplateId = templateStore((state) => state.setTemplateId);
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
      className="w-full h-full flex flex-col items-center justify-start"
    >
      <AnimatePresence>
        <motion.div
          style={{
            height: "var(--detailsPanelHeaderHeight)",
            minHeight: "var(--detailsPanelHeaderHeight)",
          }}
          transition={{ duration: 0.1 }}
          id="TemplateDetailsHeader"
          className="w-full flex items-center justify-start border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow py-2 px-1"
        >
          <button
            className="w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-first"
            onClick={() => {
              setPanelOpened(true);
              setTemplateId("unselected");
            }}
          >
            <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>

          <input
            className="bg-appBackground flex-grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 pb-2 px-2 pr-1 transition-colors duration-200 order-2"
            name="template_name"
            onChange={handleChange}
            value={newTemplate.template_name}
          />

          <div
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 mr-2 rounded-full order-last`}
          >
            {!wasTemplateChanged && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{
                  opacity: wasTemplateChanged ? 0 : 1,
                }}
                exit={{ opacity: 0 }}
                className={`h-full w-full transition-colors duration-200 p-1 rounded-full ${
                  wasTemplateChanged
                    ? ""
                    : " hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight "
                } flex items-center justify-center`}
                onClick={() => {
                  templateManager.updateTemplate(templateId, newTemplate);
                }}
              >
                <motion.span
                  className={`icon-[material-symbols-light--check-rounded] ${
                    wasTemplateChanged ? "" : "hover:text-appLayoutHighlight"
                  } rounded-full w-full h-full`}
                ></motion.span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        id="TemplateDetailsBody"
        className="w-full flex-grow min-h-0 min-w-0 basis-0 py-2 px-4 overflow-y-auto no-scrollbar"
      >
        <TemplateContentEditor
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          handleSave={() => {
            templateManager.updateTemplate(templateId, newTemplate);
          }}
        />
      </motion.div>
    </div>
  );
};

export default TemplateDetailsPanel;
