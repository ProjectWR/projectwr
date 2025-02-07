import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";

const Footer = () => {
  const { deviceType } = useDeviceType();
  if (deviceType === "mobile") return;

  return (
    <div
      id="footerContainer"
      className="border-t border-appLayoutBorder w-full h-[1.5rem] min-h-[1.5rem] pt-1 pb-1 "
    ></div>
  );
};

export default Footer;
