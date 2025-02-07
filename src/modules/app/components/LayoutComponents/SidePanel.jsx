import { useRef } from "react";
import { appStore } from "../../stores/appStore";
import { libraryStore } from "../../stores/libraryStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import LibraryManager from "../SidePanels/LibraryManager/LibraryManager";
import { AnimatePresence, motion } from "motion/react";
import LibraryDirectory from "../SIdePanels/LibraryDirectory/LibraryDirectory";

const SidePanel = ({}) => {
  const { deviceType } = useDeviceType();
  const setPanelOpened = appStore((state) => state.setPanelOpened);
  const setLibraryId = libraryStore((state) => state.setLibraryId);

  const libraryId = libraryStore((state) => state.libraryId);
  const activity = appStore((state) => state.activity);

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
      key.current = "templates";
      return <p>templates side panel</p>;
    } else {
      key.current = "empty";
      return <p>Nothing</p>;
    }
  };

  return deviceType === "mobile" ? (
    <AnimatePresence mode="wait">
      <motion.div
        key={key.current}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -10, opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="w-full h-full bg-appBackground  border-appLayoutBorder"
      >
        {renderSidePanel()}
      </motion.div>
    </AnimatePresence>
  ) : (
    <div className="w-sidePanelWidth h-full bg-red-500">
      {renderSidePanel()}
    </div>
  );
};

export default SidePanel;
