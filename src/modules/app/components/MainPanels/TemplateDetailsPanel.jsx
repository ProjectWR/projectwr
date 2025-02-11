import React, {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../stores/appStore";
import TipTapEditor from "../../../editor/TIpTapEditor/TipTapEditor";
import templateManager from "../../lib/templates";
import { equalityDeep } from "lib0/function";
import { templateStore } from "../../stores/templateStore";
import TemplateContentEditor from "./TemplateContentEditor"; // adjust the path as needed

/**
 * TemplateDetailsPanel component for viewing and editing templates.
 * @param {{ templateId: string }} props
 * @returns {JSX.Element}
 */
const TemplateDetailsPanel = ({ templateId }) => {
  console.log("TemplateDetailsPanel rendering: ", templateId);

  const setTemplateId = templateStore((state) => state.setTemplateId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const prevTemplateRef = useRef(null);

  const template = useSyncExternalStore(
    (callback) => {
      templateManager.addCallback(callback);
      return () => {
        templateManager.removeCallback(callback);
      };
    },
    () => {
      const t = templateManager.getTemplates()[templateId];
      if (
        prevTemplateRef.current !== undefined &&
        prevTemplateRef.current !== t &&
        equalityDeep(prevTemplateRef.current, t)
      ) {
        return prevTemplateRef.current;
      } else {
        prevTemplateRef.current = t;
        return prevTemplateRef.current;
      }
    }
  );

  const saveContentChanges = useCallback(
    (newContent) => {
      templateManager.updateTemplate(templateId, {
        template_content: newContent,
      });
    },
    [templateId]
  );

  return (
    <div
      id="TemplateDetailsContainer"
      className="w-full h-full  min-h-0 flex flex-col items-center justify-start"
    >
      <AnimatePresence>
        <motion.div
          animate={{
            height: "var(--detailsPanelHeaderHeight)",
            maxHeight: "var(--detailsPanelHeaderHeight)",
          }}
          transition={{ duration: 0.1 }}
          id="TemplateDetailsHeader"
          className="w-full flex items-center justify-start border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow px-1 gap-1 overflow-hidden"
        >
          <button
            className="w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 ml-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-first"
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
        id="TemplateDetailsBody"
        className="w-full flex-grow min-h-0 min-w-0 basis-0 p-4 overflow-y-auto"
      >
        <TemplateContentEditor
          initialContent={template.template_content}
          onSave={saveContentChanges}
        />
      </motion.div>
    </div>
  );
};

export default TemplateDetailsPanel;
