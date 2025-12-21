import { Drawer } from "vaul";
import { appStore } from "../../stores/appStore";
import SidePanel from "./SidePanel";
import MobileDockBar from "./MobileDockBar";

const MobileSidePanelDrawer = () => {
  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  return (
    <Drawer.Root open={panelOpened} onOpenChange={setPanelOpened}>
      <Drawer.Overlay className="absolute inset-0 bg-black/40 z-[100]" />
      <Drawer.Content className="bg-gray-100 z-[100] h-[80%] w-full absolute bottom-0 left-0 right-0 outline-none flex flex-col">
        <div className="grow w-full bg-appBackground">
          <SidePanel />
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default MobileSidePanelDrawer;
