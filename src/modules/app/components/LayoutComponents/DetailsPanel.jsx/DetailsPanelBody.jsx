import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

const DetailsPanelBody = ({ children }) => {
  return (
    <section
      id="DetailsPanelBody"
      className="grow min-h-0 w-full flex flex-col items-center justify-start py-4 px-6"
    >
      {children}
    </section>
  );
};

export default DetailsPanelBody;
