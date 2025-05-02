import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

const DetailsPanelHeader = ({ children }) => {
  const { deviceType } = useDeviceType();

  return (
    <section
      id="DetailsPanelHeader"
      className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start py-1 px-1 
        ${deviceType === "desktop" && "px-6"}
      `}
    >
      {children}
    </section>
  );
};

export default DetailsPanelHeader;
