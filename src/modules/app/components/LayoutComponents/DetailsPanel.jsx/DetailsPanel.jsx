import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { Breadcrumbs } from "../Breadcrumbs";

const DetailsPanel = ({ children, breadcrumbs }) => {
  const { deviceType } = useDeviceType();

  return (
    <main className="w-full h-full flex flex-col items-center">
      <section
        id="DetailsPanel"
        className={`h-full flex flex-col items-center justify-start 
        ${deviceType === "mobile" && "w-full"}   
        ${deviceType === "desktop" && "pt-5"}       
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
    </main>
  );
};

export default DetailsPanel;
