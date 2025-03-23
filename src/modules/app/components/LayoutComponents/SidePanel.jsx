import { useRef } from "react";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import LibraryManager from "../SidePanels/LibraryManager/LibraryManager";
import { AnimatePresence, motion } from "motion/react";
import LibraryDirectory from "../SidePanels/LibraryDirectory/LibraryDirectory";
import TemplateManager from "../SidePanels/TemplateManager/TemplateManager";

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
    } else {
      key.current = "empty";
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p>Nothing</p>
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
        style={{
          minWidth: `calc(var(--sidePanelWidth) * 0.75)`,
        }}
        className="w-full h-full"
      >
        {renderSidePanel()}
      </motion.div>
    </AnimatePresence>
  );
};

export default SidePanel;
