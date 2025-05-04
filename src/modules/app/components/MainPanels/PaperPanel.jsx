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
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelNameInput";
import DetailsPanel from "../LayoutComponents/DetailsPanel.jsx/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelDivider";
import templateManager from "../../lib/templates";

const { desktopDefaultPreferences, mobileDefaultPreferences } =
  TipTapEditorDefaultPreferences;

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
const PaperPanel = ({ ytree, paperId }) => {
  const { deviceType } = useDeviceType();
  const isMobile = deviceType === "mobile";

  console.log("paper panel rendering: ", paperId);

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);
  const [headerOpened, setHeaderOpened] = useState(true);

  const [templateFromFile, setTemplateFromFile] = useState(null);

  const preferences = useMemo(() => {
    if (templateFromFile === null || templateFromFile === undefined) return null;
    return isMobile
      ? templateFromFile?.template_content.mobileDefaultPreferences
      : templateFromFile?.template_content.desktopDefaultPreferences;
  }, [templateFromFile, isMobile]);

  useEffect(() => { 
    const callback = async () => {
      try {
        const templateJSON = await templateManager.getTemplate(
          itemLocalStateManager.getPaperEditorTemplate(paperId)
        );
        console.log(
          "TEMPLATE JSON: ",
          itemLocalStateManager.getPaperEditorTemplate(paperId),
          templateJSON
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

  const [paperProperties, setPaperProperties] = useState({
    item_title: "",
  });

  const paperMapState = useYMap(ytree.getNodeValueFromKey(paperId));

  const initialPaperProperties = useRef({
    item_title: paperMapState.item_title,
  });

  useEffect(() => {
    setPaperProperties({
      item_title: paperMapState.item_title,
    });

    initialPaperProperties.current = {
      item_title: paperMapState.item_title,
    };
  }, [paperId, paperMapState]);

  const unsavedChangesExist = useMemo(() => {
    return !equalityDeep(paperProperties, initialPaperProperties.current);
  }, [paperProperties]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaperProperties({
      ...paperProperties,
      [name]: value,
    });
  };

  const handleSave = () => {
    const paperMap = ytree.getNodeValueFromKey(paperId);

    paperMap.set("item_title", paperProperties.item_title);
  };


  console.log("PREFERENCES ", preferences);

  return (
    <DetailsPanel>
      <AnimatePresence>
        <DetailsPanelHeader>
          <form
            noValidate
            onSubmit={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSave();
            }}
            className="w-full h-full flex items-center justify-start"
          >
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

            <AnimatePresence>
              {unsavedChangesExist && (
                <motion.button
                  type="submit"
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

            <DetailsPanelNameInput
              name="item_title"
              onChange={handleChange}
              value={paperProperties.item_title}
            />
          </form>
        </DetailsPanelHeader>
      </AnimatePresence>

      <DetailsPanelDivider />

      <motion.div
        id="PaperBody"
        className="w-full grow min-h-0 min-w-0 basis-0"
      >
        <TipTapEditor
          key={paperId}
          yXmlFragment={ytree.getNodeValueFromKey(paperId).get("paper_xml")}
          setHeaderOpened={setHeaderOpened}
          preferences={preferences}
        />
      </motion.div>
    </DetailsPanel>
  );
};

export default PaperPanel;
