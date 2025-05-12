import { useRef } from "react";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import LibraryManager from "../SidePanels/LibraryManager/LibraryManager";
import { AnimatePresence, motion } from "motion/react";
import LibraryDirectory from "../SidePanels/LibraryDirectory/LibraryDirectory";
import TemplateManager from "../SidePanels/TemplateManager/TemplateManager";
import DictionaryManager from "../SidePanels/DictionaryManager/DictionaryManager";

const SidePanel = ({}) => {
  const { deviceType } = useDeviceType();
  const libraryId = appStore((state) => state.libraryId);
  const templateId = appStore((state) => state.templateId);
  const activity = appStore((state) => state.activity);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const key = useRef("empty");

  const renderSidePanel = () => {
    if (activity === "libraries") {
      if (libraryId !== "unselected") {
        key.current = "librarySelected-" + libraryId;
        return <LibraryDirectory libraryId={libraryId} />;
      } else {
        key.current = "libraryManager";
        return <LibraryManager />;
      }
    } else if (activity === "templates") {
      key.current = "templateManager";
      return <TemplateManager />;
    } else if (activity === "dictionary") {
      key.current = "dictionaryManager";
      return <DictionaryManager />;
    } else {
      key.current = "empty";
      return (
        <div className="h-full w-full flex flex-col items-center justify-start py-5 md:py-10 text-appLayoutTextMuted">
          {/* <p> The cake is a lie </p> */}
        </div>
      );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key.current}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 10, opacity: 0 }}
        transition={{ duration: 0.1, bounce: 0 }}
        className="w-full h-full"
      >
        {renderSidePanel()}
      </motion.div>
    </AnimatePresence>
  );
};

export default SidePanel;
