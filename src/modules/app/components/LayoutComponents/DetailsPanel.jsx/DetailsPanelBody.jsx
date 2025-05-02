import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

const DetailsPanelBody = ({ children }) => {
  return (
    <section
      id="DetailsPanelBody"
      className="grow w-full flex flex-col items-center justify-start border-b border-appLayoutBorder py-4 px-6"
    >
      {children}
    </section>
  );
};

export default DetailsPanelBody;
