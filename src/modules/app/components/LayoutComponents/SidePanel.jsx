import { useRef } from "react";
import { appStore } from "../../stores/appStore";
import { libraryStore } from "../../stores/libraryStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import LibraryManager from "../SidePanels/LibraryManager/LibraryManager";
import { AnimatePresence, motion } from "motion/react";
import LibraryDirectory from "../SIdePanels/LibraryDirectory/LibraryDirectory";
import { templateStore } from "../../stores/templateStore";
import TemplateManager from "../SIdePanels/TemplateManager/TemplateManager";

const SidePanel = ({}) => {
  const { deviceType } = useDeviceType();
  const libraryId = libraryStore((state) => state.libraryId);
  const templateId = templateStore((state) => state.templateId);
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
      if (templateId !== "unselected") {
        key.current = "templateSelected-" + templateId;
        return <TemplateManager templateId={templateId} />;
      } else {
        key.current = "templateManager";
        return <TemplateManager />;
      }
    } else {
      key.current = "empty";
      setPanelOpened(false);
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
        exit={{ x: -10, opacity: 0 }}
        transition={{ duration: 0.1 }}
        style={{
          minWidth: `calc(var(--sidePanelWidth) * 0.75)`
        }}
        className="w-full h-full bg-appBackground border-appLayoutBorder"
      >
        {renderSidePanel()}
      </motion.div>
    </AnimatePresence>
  );
};

export default SidePanel;
