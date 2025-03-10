import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { appStore } from "../../stores/appStore";
import { motion, AnimatePresence } from "motion/react";

const ActionBar = () => {
  const { deviceType } = useDeviceType();
  const appWindow = getCurrentWindow();
  const setActivity = appStore((state) => state.setActivity);

  const sideBarOpened = appStore((state) => state.sideBarOpened);
  const setSideBarOpened = appStore((state) => state.setSideBarOpened);

  return (
    <div
      data-tauri-drag-region
      id="actionBarContainer"
      className="border-b border-appLayoutBorder w-full h-actionBarHeight min-h-actionBarHeight text-appLayoutText"
    >
      <div
        data-tauri-drag-region
        id="actionBar"
        className="w-full h-full flex justify-start items-center font-sans"
      >
        <div
          className={`logo h-full w-actionBarLogoSize flex items-center justify-center ml-2 mr-px font-serif pointer-events-none select-none`}
        >
          <span className="icon-[ph--flower-tulip-thin] h-actionBarLogoSize w-actionBarLogoSize"></span>
        </div>

        <ActionButton onClick={() => setSideBarOpened(!sideBarOpened)}>
          <div className="h-full w-actionBarButtonIconSize relative">
            <AnimatePresence mode="sync">
              {sideBarOpened && (
                <motion.span
                  initial={{ opacity: 0.6, rotate: 180 }}
                  animate={{ opacity: 1, rotate: 180 }}
                  exit={{ opacity: 0.6, rotate: 180 }}
                  transition={{ duration: 0.05 }}
                  key="sideBarOpened"
                  className="icon-[octicon--sidebar-collapse-24] w-full h-full top-0 left-0 absolute"
                ></motion.span>
              )}
              {!sideBarOpened && (
                <motion.span
                  initial={{ opacity: 0.6, rotate: 180 }}
                  animate={{ opacity: 1, rotate: 180 }}
                  exit={{ opacity: 0.6, rotate: 180 }}
                  transition={{ duration: 0.05 }}
                  key="sideBarClosed"
                  className="icon-[octicon--sidebar-expand-24] w-full h-full top-0 left-0 absolute"
                ></motion.span>
              )}
            </AnimatePresence>
          </div>
        </ActionButton>

        <div className="flex-grow"></div>

        <ActionButton>
          <span className="icon-[line-md--question] h-actionBarButtonIconSize w-actionBarButtonIconSize"></span>
        </ActionButton>

        {deviceType !== "mobile" && (
          <>
            <WindowButton
              className={`ml-1`}
              buttonContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <path fill="#fbfafa" d="M20 14H4v-4h16"></path>
                </svg>
              }
              onClick={() => {
                appWindow.minimize();
              }}
            />
            <WindowButton
              className={``}
              buttonContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <path fill="#fbfafa" d="M4 4h16v16H4zm2 4v10h12V8z"></path>
                </svg>
              }
              onClick={() => {
                appWindow.toggleMaximize();
              }}
            />
            <WindowButton
              destructive={true}
              className={``}
              buttonContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#fbfafa"
                    d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"
                  ></path>
                </svg>
              }
              onClick={() => {
                appWindow.close();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ActionBar;

const ActionButton = ({ onClick, className, children }) => {
  return (
    <button
      className={`h-full px-4 w-fit ml-1 hover:bg-appLayoutInverseHover flex items-center justify-center ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const WindowButton = ({
  onClick,
  className,
  buttonContent,
  destructive = false,
}) => {
  return (
    <button
      className={`h-full px-4 w-fit ${
        destructive
          ? "hover:bg-appLayoutDestruct hover:bg-opacity-70"
          : "hover:bg-appLayoutInverseHover"
      } ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};
