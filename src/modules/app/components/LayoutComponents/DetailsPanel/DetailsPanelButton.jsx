import { AnimatePresence, motion } from "motion/react";
import { GrainyElementButton } from "../GrainyHoverButton";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

export const DetailsPanelButtonsShell = ({ children }) => {
  const { deviceType } = useDeviceType();

  return (
    <section
      id="DetailsPanelButtonsShell"
      className={`w-full h-fit grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-6`}
      style={
        deviceType === "desktop" && {
          width: `var(--detailsPanelWidth)`,
          maxWidth: `100%`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.25)`,
        }
      }
    >
      {children}
    </section>
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
    <GrainyElementButton
      gradientSize={100}
      gradientSizeY={10}
      onClick={onClick}
      disabled={loading || disabled}
      className={`h-[3rem] border border-appLayoutBorder rounded-lg overflow-hidden`}
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
                <span className="icon-[ph--flower-tulip-thin] h-[60%] w-[60%]"></span>
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
              <span className="grow basis-0 flex items-center justify-start text-2xl md:text-xl lg:text-lg xl:text-[1rem]">
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
  text,
  disabled = false,
}) => {
  return (
    <GrainyElementButton
      gradientSize={100}
      gradientSizeY={10}
      onClick={onClick}
      disabled={loading || disabled}
      className={`h-[3rem] border border-appLayoutBorder rounded-lg overflow-hidden`}
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
                <span className="icon-[ph--flower-tulip-thin] h-[60%] w-[60%]"></span>
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
              <span className="w-[2.2rem] h-[2.2rem] flex items-center justify-center"></span>
              <span className="verticalDivider h-full min-w-px py-1">
                <div className="h-full w-full bg-transparent"></div>
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </GrainyElementButton>
  );
};
