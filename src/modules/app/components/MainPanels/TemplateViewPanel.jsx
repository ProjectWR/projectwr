import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../stores/appStore";
import TipTapEditor from "../../../editor/TipTapEditor/TipTapEditor"; // Assuming you have a TipTapEditor component
import templateManager from "../../lib/templates";
import { equalityDeep } from "lib0/function";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";

/**
 * TemplateViewPanel component for viewing and editing templates.
 * @param {{ templateId: string }} props - The templateId of the template to display.
 * @returns {JSX.Element}
 */
const TemplateViewPanel = ({ templateId }) => {
  const { deviceType } = useDeviceType();
  console.log("TemplateViewPanel rendering: ", templateId);

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);
  const setTemplateId = appStore((state) => state.setTemplateId);

  // Hide the activity bar when the panel is mounted
  useEffect(() => {
    if (deviceType === "mobile") {
      setShowActivityBar(false);
    }
    return () => {
      setShowActivityBar(true);
    };
  }, [setShowActivityBar, deviceType]);

  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const [headerOpened, setHeaderOpened] = useState(true);

  const prevTemplateRef = useRef(null);

  const template = useSyncExternalStore(
    (callback) => {
      templateManager.addCallback(callback);

      return () => {
        templateManager.removeCallback(callback);
      };
    },
    () => {
      console.log("Template: ", templateManager.getTemplates()[templateId]);
      const template = templateManager.getTemplates()[templateId];
      if (
        prevTemplateRef !== undefined &&
        prevTemplateRef.current !== template &&
        equalityDeep(prevTemplateRef.current, template)
      ) {
        return prevTemplateRef.current;
      } else {
        prevTemplateRef.current = template;
        return prevTemplateRef.current;
      }
    }
  );

  return (
    <div
      id="TemplateViewContainer"
      className={`h-full flex flex-col items-center justify-start 
        ${deviceType === "mobile" && "w-full"}   
        ${deviceType === "desktop" && ""}       
      `}
      style={
        deviceType === "desktop" && {
          width: `100%`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
        }
      }
    >
      <AnimatePresence>
        <motion.div
          animate={{
            height: headerOpened ? "var(--detailsPanelHeaderHeight)" : "0",
            maxHeight: headerOpened ? "var(--detailsPanelHeaderHeight)" : "0",
          }}
          transition={{ duration: 0.1 }}
          id="TemplateViewHeader"
          className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start py-1 px-1 shrink-0
            ${deviceType === "desktop" && "px-6 py-1"}
          `}
        >
          {deviceType === "mobile" && (
            <button
              className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 ml-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-first`}
              onClick={() => {
                setPanelOpened(true);
                setTemplateId("unselected");
              }}
            >
              <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
            </button>
          )}

          <p
            className="bg-appBackground text-center grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 px-2 transition-colors duration-200 order-2"
            id="template_name"
          >
            {template.template_name}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div>
      
      <motion.div
        id="TemplateViewBody"
        className="w-full grow min-h-0 min-w-0 basis-0"
      >
        <TipTapEditor
          key={templateId}
          setHeaderOpened={setHeaderOpened}
          mode={"previewTemplate"}
          preferences={template.template_content.desktopDefaultPreferences}
        />
      </motion.div>
    </div>
  );
};

export default TemplateViewPanel;
