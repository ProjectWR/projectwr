import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TipTapEditor from "../../../editor/TIpTapEditor/TipTapEditor";
import { AnimatePresence, motion } from "motion/react";
import { equalityDeep } from "lib0/function";
import itemLocalStateManager from "../../lib/itemLocalState";
import useTemplates from "../../hooks/useTemplates";

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
const PaperPanel = ({ ytree, paperId }) => {
  const { deviceType } = useDeviceType();
  console.log("library details panel rendering: ", paperId);

  const setShowActivityBar = appStore((state) => state.setShowActivityBar);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = appStore((state) => state.setItemId);
  const [headerOpened, setHeaderOpened] = useState(true);

  const templates = useTemplates();

  const preferences = useMemo(() => {
    if (templates[itemLocalStateManager.getPaperEditorTemplate(paperId)]) {
      return templates[itemLocalStateManager.getPaperEditorTemplate(paperId)]
        .template_content.desktopDefaultPreferences;
    } else {
      return null;
    }
  }, [templates, paperId]);

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

  console.log("Paper Props Map STATE: ", paperMapState);

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
    console.log(name, value);
    setPaperProperties({
      ...paperProperties,
      [name]: value,
    });
  };

  const handleSave = () => {
    const paperMap = ytree.getNodeValueFromKey(paperId);

    paperMap.set("item_title", paperProperties.item_title);
  };

  return (
    <div
      id="PaperDetailContainer"
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
        <motion.form
          noValidate
          onSubmit={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSave();
          }}
          animate={{
            height: headerOpened ? "var(--detailsPanelHeaderHeight)" : "0",
            maxHeight: headerOpened ? "var(--detailsPanelHeaderHeight)" : "0",
          }}
          transition={{ duration: 0.1 }}
          id="CreatePaperHeader"
          className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start py-1 px-1 flex-shrink-0
            ${deviceType === "desktop" && "px-6 py-1"}
          `}
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

          <input
            className="bg-appBackground text-center flex-grow h-full text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 px-2 transition-colors duration-200 order-2"
            name="item_title"
            onChange={handleChange}
            value={paperProperties.item_title}
          />

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
                    flex items-center justify-center order-3
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
        </motion.form>
      </AnimatePresence>

      <div className="w-full h-px bg-appLayoutBorder"></div>

      <motion.div
        id="CreatePaperBody"
        className="w-full flex-grow min-h-0 min-w-0 basis-0"
      >
        <TipTapEditor
          key={paperId}
          yXmlFragment={ytree.getNodeValueFromKey(paperId).get("paper_xml")}
          setHeaderOpened={setHeaderOpened}
          preferences={preferences}
        />
      </motion.div>
    </div>
  );
};

export default PaperPanel;
