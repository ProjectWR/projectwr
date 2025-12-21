import { Drawer } from "vaul";
import { appStore } from "../../stores/appStore";
import SidePanel from "./SidePanel";
import MobileDockBar from "./MobileDockBar";

const MobileSidePanelDrawer = () => {
  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  return (
    <Drawer.Root
      direction="left"
      open={panelOpened}
      onOpenChange={setPanelOpened}
    >
      <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
      <Drawer.Content className="z-[100] h-[90%] w-[90%] fixed bottom-1/2 translate-y-1/2 left-0 right-0 outline-none flex flex-col">
        <div className="grow w-full bg-appBackground">
          <SidePanel />
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default MobileSidePanelDrawer;
