import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

const DetailsPanelHeader = ({ children}) => {
  const { deviceType } = useDeviceType();

  return (
    <section
      id="DetailsPanelHeader"
      className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-start justify-start relative
        ${deviceType === "desktop" && "px-0 "}
      `}
    >
      {children}
    </section>
  );
};

export default DetailsPanelHeader;
