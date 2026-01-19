import { AnimatePresence, motion } from "motion/react";
import { GrainyElementButton } from "../GrainyHoverButton";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

export const DetailsPanelButtonsShell = ({ children }) => {
  const { deviceType } = useDeviceType();

  return (
    <div className="w-full h-full px-1 pt-1 flex flex-col items-start gap-2 border border-transparent rounded-md overflow-hidden">
      <h2 className="w-full h-fit px-2 pt-1 flex justify-start items-center text-detailsPanelPropLabelFontSize text-appLayoutTextMuted">
        Actions
      </h2>
      {children}
    </div>
  );
};

export const DetailsPanelButton = ({
  onClick,
  loading,
  icon,
  text,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="min-h-fit flex gap-2 items-center text-libraryDirectoryBookNodeFontSize p-2 px-3 rounded-lg border border-appLayoutBorder hover:bg-appLayoutInverseHover bg-transparent"
    >
      {loading && (<span className="icon-[line-md--loading-twotone-loop] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize"></span>)} <div className="w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize">{icon}</div> {text}
    </button>
  )

  return (
    <GrainyElementButton
      gradientSize={100}
      gradientSizeY={10}
      onClick={onClick}
      disabled={loading || disabled}
      className={`min-h-fit w-1/2 lg:w-full h-fit py-1 border border-appLayoutBorder rounded-lg overflow-hidden`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${loading}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="w-full h-fit flex items-center justify-center px-2 gap-2"
        >
          {loading && (
            <div className={`relative w-detailsPanelButtonIconHeight h-detailsPanelButtonIconHeight`}>
              <span
                className="w-full h-full"
              // animate={{ rotate: 360 }}
              // transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={"100%"}
                  height={"100%"}
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={0.3}
                  >
                    <path
                      strokeDasharray={16}
                      strokeDashoffset={16}
                      d="M12 3c4.97 0 9 4.03 9 9"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="16;0"
                      ></animate>
                      <animateTransform
                        attributeName="transform"
                        dur="1.5s"
                        repeatCount="indefinite"
                        type="rotate"
                        values="0 12 12;360 12 12"
                      ></animateTransform>
                    </path>
                    <path
                      strokeDasharray={64}
                      strokeDashoffset={64}
                      strokeOpacity={0.3}
                      d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="1.2s"
                        values="64;0"
                      ></animate>
                    </path>
                  </g>
                </svg>
              </span>
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.2,
                  ease: "linear",
                }}
                className="absolute w-full h-full top-0 left-0 flex items-center justify-center"
              >
                <span className="icon-[mingcute--quill-pen-line] h-[60%] w-[60%]"></span>
              </motion.div>
            </div>
          )}

          {!loading && (
            <>
              <span className="w-detailsPanelButtonIconHeight h-detailsPanelButtonIconHeight p-1 shrink-0 flex items-center justify-center">
                {icon}
              </span>
              <span className="verticalDivider h-full min-w-px w-[1px] shrink-0">
                <div className="h-full w-full bg-appLayoutInverseHover"></div>
              </span>
              <span className="grow min-w-0 flex items-center justify-start text-detailsPanelPropFontSize truncate">
                {text}
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </GrainyElementButton>
  );
};

export const DetailsPanelCenteredButton = ({
  onClick,
  loading,
  icon,
  rightIcon,
  text,
  disabled = false,
}) => {
  return (
    <GrainyElementButton
      gradientSize={100}
      gradientSizeY={10}
      onClick={onClick}
      disabled={loading || disabled}
      className={`h-[3rem] w-full border border-appLayoutBorder rounded-lg overflow-hidden`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${loading}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="w-full h-full flex items-center justify-center px-6 lg:px-3 gap-6 lg:gap-3"
        >
          {loading && (
            <div className={`relative w-full h-full`}>
              <span
                className="w-full h-full"
              // animate={{ rotate: 360 }}
              // transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={"100%"}
                  height={"100%"}
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={0.3}
                  >
                    <path
                      strokeDasharray={16}
                      strokeDashoffset={16}
                      d="M12 3c4.97 0 9 4.03 9 9"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="16;0"
                      ></animate>
                      <animateTransform
                        attributeName="transform"
                        dur="1.5s"
                        repeatCount="indefinite"
                        type="rotate"
                        values="0 12 12;360 12 12"
                      ></animateTransform>
                    </path>
                    <path
                      strokeDasharray={64}
                      strokeDashoffset={64}
                      strokeOpacity={0.3}
                      d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="1.2s"
                        values="64;0"
                      ></animate>
                    </path>
                  </g>
                </svg>
              </span>
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.2,
                  ease: "linear",
                }}
                className="absolute w-full h-full top-0 left-0 flex items-center justify-center"
              >
                <span className="icon-[mingcute--quill-pen-line] h-[60%] w-[60%]"></span>
              </motion.div>
            </div>
          )}

          {!loading && (
            <>
              <span className="w-[2.2rem] h-[2.2rem] flex items-center justify-center">
                {icon}
              </span>
              <span className="verticalDivider h-full min-w-px py-1">
                <div className="h-full w-full bg-appLayoutInverseHover"></div>
              </span>
              <span className="grow basis-0 flex items-center justify-center text-2xl md:text-xl lg:text-lg xl:text-[1rem]">
                {text}
              </span>
              <span className="verticalDivider h-full min-w-px py-1">
                <div className="h-full w-full bg-transparent"></div>
              </span>
              <span className="w-[2.2rem] h-[2.2rem] flex items-center justify-center">
                {rightIcon}
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </GrainyElementButton>
  );
};
