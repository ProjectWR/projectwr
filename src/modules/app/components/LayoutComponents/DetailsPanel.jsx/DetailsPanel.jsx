import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

const DetailsPanel = ({ children }) => {
  const { deviceType } = useDeviceType();

  return (
    <section
      id="DetailsPanel"
      className={`h-full flex flex-col items-center justify-start 
        ${deviceType === "mobile" && "w-full"}   
        ${deviceType === "desktop" && "mt-10"}       
      `}
      style={
        deviceType === "desktop" && {
          width: `var(--detailsPanelWidth)`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
        }
      }
    >
      {children}
    </section>
  );
};

export default DetailsPanel;
