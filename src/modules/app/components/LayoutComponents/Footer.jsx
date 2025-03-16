import { round } from "lib0/math";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import useZoom from "../../hooks/useZoom";

const Footer = () => {
  const { deviceType } = useDeviceType();

  const { scale, setScale, zoomIn, zoomOut } = useZoom();

  if (deviceType === "mobile") return;

  return (
    <div
      id="FooterContainer"
      className="border-t border-appLayoutBorder w-full h-footerHeight min-h-footerHeight flex-grow-0 flex flex-row justify-end font-sans"
    >
      <div className="ZoomContainer w-fit h-full px-1 flex flex-row items-center">
        <button
          className="zoomInButton w-ZoomButtonWidth h-full flex items-center justify-center  border-appLayoutBorder hover:bg-appLayoutInverseHover"
          onClick={zoomIn}
        >
          <span className="icon-[material-symbols-light--add-rounded] w-ZoomIconSize h-ZoomIconSize"></span>
        </button>
        <div className="zoomDisplay text-ZoomDisplayFontSize w-ZoomDisplayWidth h-full pb-px flex items-center justify-center rounded-md select-none">{`${round(
          scale * 100
        )}%`}</div>
        <button
          className="zoomInButton w-ZoomButtonWidth h-full flex items-center justify-center    border-appLayoutBorder  hover:bg-appLayoutInverseHover"
          onClick={zoomOut}
        >
          <span className="icon-[material-symbols-light--remove-rounded] w-ZoomIconSize h-ZoomIconSize"></span>
        </button>
      </div>
    </div>
  );
};

export default Footer;
