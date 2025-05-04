import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { Breadcrumbs } from "../Breadcrumbs";

const DetailsPanel = ({ children, breadcrumbs, className }) => {
  const { deviceType } = useDeviceType();

  return (
    <main className="w-full h-full flex flex-col items-start">
      <section
        id="DetailsPanel"
        className={`h-full w-full flex flex-col items-start justify-start 
        ${deviceType === "mobile" && "w-full"}   
        ${deviceType === "desktop" && "pt-0"}    
        ${className}   
      `}
        style={
          deviceType === "desktop" && {
            maxWidth: `100%`,
            minWidth: `calc(var(--detailsPanelWidth) * 0.25)`,
          }
        }
      >
        {children}
      </section>
    </main>
  );
};

export default DetailsPanel;
