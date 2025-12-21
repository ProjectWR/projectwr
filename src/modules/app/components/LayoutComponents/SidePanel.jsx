import { useRef } from "react";
import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import LibraryManager from "../SidePanels/LibraryManager/LibraryManager";
import { AnimatePresence, motion } from "motion/react";
import LibraryDirectory from "../SidePanels/LibraryDirectory/LibraryDirectory";
import TemplateManager from "../SidePanels/TemplateManager/TemplateManager";
import DictionaryManager from "../SidePanels/DictionaryManager/DictionaryManager";
import SearchSidePanel from "../SIdePanels/Search/SearchSidePanel";
import LibraryDirectoryHeader from "../SIdePanels/LibraryDirectory/LibraryDirectoryHeader";

const SidePanel = ({}) => {
  const { deviceType } = useDeviceType();
  const libraryId = appStore((state) => state.libraryId);
  const activity = appStore((state) => state.activity);
  const isDesktop = ["windows", "macos", "linux"].includes(deviceType);

  const key = useRef("empty");

  const renderSidePanel = () => {
    if (activity === "libraries") {
      key.current = "librarySelected-" + libraryId;
      return <LibraryDirectory libraryId={libraryId} />;
    } else if (activity === "search") {
      key.current = "searchSelected-" + libraryId;

      return <SearchSidePanel libraryId={libraryId} />;
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
      <div className="w-full h-full z-[49] flex flex-col items-center">
        <div
          id="LibraryDirectoryHeaderContainer"
          className="h-fit min-h-fit w-full"
        >
          <LibraryDirectoryHeader
            key={`libraryDirectoryHeader`}
            currentLibraryId={libraryId}
          />
        </div>

        <motion.div
          key={key.current}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.1, bounce: 0 }}
          className="w-full grow z-[49]"
        >
          {renderSidePanel()}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SidePanel;
