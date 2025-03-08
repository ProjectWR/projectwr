import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";

const Footer = () => {
  const { deviceType } = useDeviceType();
  if (deviceType === "mobile") return;

  return (
    <div
      id="footerContainer"
      className="border-t border-appLayoutBorder w-full h-footerHeight min-h-footerHeight"
    ></div>
  );
};

export default Footer;
