import { appStore } from "../../stores/appStore";
import SidePanel from "./SidePanel";
import MobileDockBar from "./MobileDockBar";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

const MobileSidePanelDrawer = () => {
  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  useEffect(() => {
    const mainPanel = document.getElementById("MainPanelContainer");
    const handleClick = () => setPanelOpened(false);
    mainPanel?.addEventListener("click", handleClick);
    return () => mainPanel?.removeEventListener("click", handleClick);
  }, [setPanelOpened]);

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1, y: panelOpened ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
        className="z-[100] h-[80%] border-t border-appLayoutBorder w-full absolute bottom-0 left-0 right-0 outline-none flex flex-col"
      >
        <div className="h-4 w-full bg-appBackground" />
        <div className="grow w-full bg-appBackground">
          <SidePanel />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileSidePanelDrawer;
