import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { templateStore } from "../../../stores/templateStore";
import { appStore } from "../../../stores/appStore";
import templateManager from "../../../lib/templates";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { TipTapEditorDefaultPreferences } from "../../../../editor/TIpTapEditor/TipTapEditorDefaultPreferences";
import { equalityDeep } from "lib0/function";

const TemplateManager = () => {
  console.log("Template Manager was rendered");
  const { deviceType } = useDeviceType();

  const prevTemplatesRef = useRef(null);

  const templates = useSyncExternalStore(
    (callback) => {
      templateManager.addCallback(callback);

      return () => {
        templateManager.removeCallback(callback);
      };
    },
    () => {
      const templates = templateManager.getTemplates();
      if (
        prevTemplatesRef.current !== null &&
        prevTemplatesRef.current !== undefined &&
        equalityDeep(prevTemplatesRef.current, templates)
      ) {
        return prevTemplatesRef.current;
      } else {
        prevTemplatesRef.current = templates;
        return prevTemplatesRef.current;
      }
    }
  );

  // Create a new template
  const handleCreateTemplate = () => {
    const templateProps = {
      template_name: "New Template",
      template_editor: "TipTapEditor",
      template_content: TipTapEditorDefaultPreferences,
    };
    templateManager.createTemplate(templateProps);
  };

  return (
    <div id="TemplateManagerContainer" className="h-full w-full flex flex-col">
      {/* Header */}
      <div
        id="TemplateManagerHeader"
        className="flex items-center justify-between px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-b border-appLayoutBorder"
        style={{
          boxShadow:
            deviceType === "desktop"
              ? "0 1px 6px -1px hsl(var(--appLayoutShadow))"
              : "", // bottom shadow
          clipPath: deviceType === "desktop" ? "inset(0 0 -10px 0)" : "", // Clip the shadow except at bottom
        }}
      >
        <h1 className="h-fit w-fit pt-1 pb-[0.38rem] ml-4 text-libraryManagerHeaderText text-neutral-300 order-2">
          Your Templates
        </h1>
        <button
          className="w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-4"
          onClick={handleCreateTemplate}
        >
          <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
      </div>

      {/* Body */}
      <div
        id="TemplateManagerBody"
        className={`flex-grow flex flex-col w-full justify-start items-center overflow-y-auto ${
          deviceType === "mobile" ? "no-scrollbar" : ""
        }`}
      >
        <div
          id="TemplateListContainer"
          className="w-full h-fit flex flex-col justify-start items-center"
        >
          {Object.keys(templates).map((templateId) => (
            <div
              key={templateId}
              id={`TemplateListNode-${templateId}`}
              className="w-full h-libraryManagerNodeHeight min-h-libraryManagerNodeHeight border-b border-appLayoutBorder"
            >
              <TemplateManagerNode
                templateId={templateId}
                template={templates[templateId]}
                key={templateId}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;

const TemplateManagerNode = ({ templateId, template }) => {
  const setTemplateId = templateStore((state) => state.setTemplateId);
  const setTemplateMode = templateStore((state) => state.setTemplateMode);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  return (
    <div className="w-full h-full flex flex-row items-center justify-between hover:bg-appLayoutHover transition-colors duration-200">
      <button
        className={`flex-grow h-full flex justify-start items-center pl-4 text-libraryManagerNodeText hover:text-appLayoutHighlight hover:bg-appLayoutHover transition-colors duration-200`}
        onClick={() => {
          setTemplateId(templateId);
          setTemplateMode("preview");
          setPanelOpened(false);
        }}
      >
        <div className="flex items-center gap-2">
          <span className="icon-[carbon--template] h-libraryManagerNodeIconSize w-libraryManagerNodeIconSize transition-colors duration-100"></span>
          <p className="transition-colors duration-100">
            {template.template_name}
          </p>
        </div>
      </button>
      <button
        className="h-libraryManagerNodeEditButtonWidth w-libraryManagerNodeEditButtonWidth transition-colors duration-200 px-2 m-2 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight"
        onClick={() => {
          setTemplateId(templateId);
          setTemplateMode("details");
          setPanelOpened(false);
        }}
      >
        <span className="icon-[mdi--edit-outline] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
      </button>
    </div>
  );
};
