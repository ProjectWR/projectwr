import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import useYMap from "../../hooks/useYMap";
import dataManagerSubdocs from "../../lib/dataSubDoc";
import { appStore } from "../../stores/appStore";
import { libraryStore } from "../../stores/libraryStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import TipTapEditor from "../../../editor/TIpTapEditor/TipTapEditor";
import { AnimatePresence, motion } from "motion/react";

/**
 *
 * @param {{ytree: YTree, paperId: string}} param0
 * @returns
 */
const PaperSettingsPanel = ({ ytree, paperId }) => {
  console.log("library details panel rendering: ", paperId);
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setItemId = libraryStore((state) => state.setItemId);

  const paperMapState = useYMap(ytree.getNodeValueFromKey(paperId));

  console.log("Paper Props Map STATE: ", paperMapState);

  return (
    <div
      id="PaperSettingsContainer"
      className="w-full h-full flex flex-col items-center justify-start"
    >
      <div
        id="PaperSettingsHeader"
        className="h-detailsPanelHeaderHeight w-full flex items-center justify-start border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow px-1 gap-1 overflow-hidden"
      >
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

        <p
          className="bg-appBackground flex-grow text-detailsPanelNameFontSize focus:bg-appLayoutInputBackground rounded-lg focus:outline-none py-1 my-2 px-2 pr-1 transition-colors duration-200"
          id="item_title"
        >
          {paperMapState.item_title}
        </p>
      </div>

      <div
        id="PaperSettingsBody"
        className="w-full flex-grow min-h-0 min-w-0 basis-0"
      ></div>
    </div>
  );
};

export default PaperSettingsPanel;
