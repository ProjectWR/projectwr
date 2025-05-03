import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { appStore } from "../../../stores/appStore";
import templateManager from "../../../lib/templates";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { TipTapEditorDefaultPreferences } from "../../../../editor/TipTapEditor/TipTapEditorDefaultPreferences";
import { equalityDeep } from "lib0/function";
import useStoreHistory from "../../../hooks/useStoreHistory";
import useMainPanel from "../../../hooks/useMainPanel";

const TemplateManager = () => {
  console.log("Template Manager was rendered");
  const { deviceType } = useDeviceType();

  const prevTemplatesRef = useRef(null);

  const { activatePanel } = useMainPanel();

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
    <div
      id="TemplateManagerContainer"
      className="h-full max-h-full w-full flex flex-col items-center"
    >
      <div
        id="TemplateManagerHeader"
        className={`flex items-center justify-start w-full gap-2 px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-appLayoutBorder`}
      >
        <h1
          className={`h-fit grow pt-1 text-libraryManagerHeaderText text-appLayoutText order-2 ${
            deviceType === "mobile" ? "ml-3" : "ml-6"
          }`}
        >
          Your Editor Styles
        </h1>

        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize text-appLayoutTextMuted transition-colors duration-0 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-4`}
          onClick={handleCreateTemplate}
        >
          <span className="icon-[material-symbols-light--add-2-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
      </div>

      <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div>
      <div
        id="TemplateManagerBody"
        className={`grow flex flex-col w-full justify-start items-center overflow-y-scroll pt-1 ${
          deviceType === "mobile" ? "no-scrollbar" : ""
        }`}
        style={{
          paddingLeft: `var(--scrollbarWidth)`,
        }}
      >
        <div
          id="TemplateListContainer"
          className="w-full h-fit flex flex-col justify-start items-center"
        >
          {Object.keys(templates).map((templateId) => (
            <div
              key={templateId}
              id={`TemplateListNode-${templateId}`}
              className="w-full h-libraryManagerNodeHeight min-h-libraryManagerNodeHeight"
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
  const { deviceType } = useDeviceType();

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const setTemplateId = appStore((state) => state.setTemplateId);
  const appStoreTemplateId = appStore((state) => state.appStoreTemplateId);
  const setTemplateMode = appStore((state) => state.setTemplateMode);
  const templateMode = appStore((state) => state.templateMode);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const panelOpened = appStore((state) => state.panelOpened);

  const { activatePanel } = useMainPanel();

  return (
    <div className="w-full h-full flex flex-row items-center justify-between hover:bg-appLayoutHover transition-colors duration-0 rounded-lg">
      <button
        className={`grow h-full flex justify-start items-center pl-4 text-libraryManagerNodeText hover:text-appLayoutHighlight hover:bg-appLayoutHover transition-colors duration-0 rounded-l-lg`}
        onClick={() => {
          if (appStoreTemplateId !== templateId || templateMode !== "preview") {
            setTemplateId(templateId);
            setTemplateMode("preview");
            if (deviceType === "mobile") {
              setPanelOpened(false);
            }
            setPanelOpened(true);

            activatePanel("templates", "preview", [templateId]);
          }
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
        className="h-libraryManagerNodeEditButtonWidth w-libraryManagerNodeEditButtonWidth transition-colors duration-0 px-2 m-2 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight"
        onClick={() => {
          if (appStoreTemplateId !== templateId || templateMode !== "details") {
            setTemplateId(templateId);
            setTemplateMode("details");
            if (deviceType === "mobile") {
              setPanelOpened(false);
            }
            setPanelOpened(true);

            activatePanel("templates", "details", [templateId]);
          }
        }}
      >
        <span className="icon-[mdi--edit-outline] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
      </button>
    </div>
  );
};
