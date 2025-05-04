import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

const DetailsPanelBody = ({ children, className }) => {
  const { deviceType } = useDeviceType();

  return (
    <section
      id="DetailsPanelBody"
      className={`grow min-h-0 w-full flex flex-col items-center justify-start py-4 px-6 gap-4 ${className}`}
      style={
        deviceType === "desktop" && {
          width: `var(--detailsPanelWidth)`,
          maxWidth: `100%`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.25)`,
        }
      }
    >
      {children}
    </section>
  );
};

export default DetailsPanelBody;
