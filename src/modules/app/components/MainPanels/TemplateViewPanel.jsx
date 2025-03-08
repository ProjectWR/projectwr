import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../stores/appStore";
import TipTapEditor from "../../../editor/TIpTapEditor/TipTapEditor"; // Assuming you have a TipTapEditor component
import templateManager from "../../lib/templates";
import { equalityDeep } from "lib0/function";
import { templateStore } from "../../stores/templateStore";
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
  const setTemplateId = templateStore((state) => state.setTemplateId);

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
      className="w-full h-full flex flex-col items-center justify-start"
    >
      <AnimatePresence>
        <motion.div
          animate={{
            height: headerOpened ? "var(--detailsPanelHeaderHeight)" : "0",
            maxHeight: headerOpened ? "var(--detailsPanelHeaderHeight)" : "0",
          }}
          transition={{ duration: 0.1 }}
          id="TemplateViewHeader"
          className="w-full flex items-center justify-start border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow px-1 gap-1 overflow-hidden"
        >
          <button
            className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 ml-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-first`}
            onClick={() => {
              setPanelOpened(true);
              setTemplateId("unselected");
            }}
          >
            <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>

          <p
            className="bg-appBackground flex-grow text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 my-2 px-2 pr-1 transition-colors duration-200"
            id="item_title"
          >
            {template.template_name}
          </p>
        </motion.div>
      </AnimatePresence>

      <motion.div
        id="TemplateViewBody"
        className="w-full flex-grow min-h-0 min-w-0 basis-0"
      >
        <TipTapEditor
          setHeaderOpened={setHeaderOpened}
          mode={"previewTemplate"}
          preferences={template.template_content.mobileDefaultPreferences}
        />
      </motion.div>
    </div>
  );
};

export default TemplateViewPanel;
