import { round } from "lib0/math";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import useZoom from "../../hooks/useZoom";
import { appStore } from "../../stores/appStore";

const Footer = () => {
  const { deviceType } = useDeviceType();

  const zoom = appStore((state) => state.zoom);

  const { zoomIn, zoomOut } = useZoom();

  if (deviceType === "mobile") return;

  return (
    <div
      id="FooterContainer"
      className="border-y basis-0 border-appLayoutBorder w-full h-footerHeight min-h-footerHeight grow-0 flex flex-row justify-end font-sans"
    >
      <div className="ZoomContainer w-fit h-full px-1 flex flex-row items-center">
        <button
          className="zoomInButton w-ZoomButtonWidth h-full flex items-center justify-center  border-appLayoutBorder hover:bg-appLayoutInverseHover"
          onClick={zoomIn}
        >
          <span className="icon-[material-symbols-light--add-rounded] w-ZoomIconSize h-ZoomIconSize"></span>
        </button>
        <div className="zoomDisplay text-ZoomDisplayFontSize w-ZoomDisplayWidth h-full pb-px flex items-center justify-center rounded-md select-none">
          {zoom && `${round(zoom * 100)}%`}
        </div>
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
