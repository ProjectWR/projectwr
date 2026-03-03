import { motion } from "motion/react";
import Footer from "./LayoutComponents/Footer";
import { ActionBarRightSideOnlyWindowButtons } from "./LayoutComponents/ActionBar";

const LoadingScreen = (loading, loadingStage) => {
  return (
    <motion.div
      data-tauri-drag-region
      key="WritingAppLoading"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="flex flex-col justify-center items-center h-screen max-h-screen w-screen max-w-screen bg-appBackground text-appLayoutText"
    >
      <div className="w-full bg-appBackgroundAccent h-actionBarHeight min-h-actionBarHeight basis-actionBarHeight flex justify-end">
        <ActionBarRightSideOnlyWindowButtons />
      </div>
      <div
        id="AppBodyContainer"
        className={`w-full grow min-h-0 bg-appBackgroundAccent overflow-hidden basis-0 flex relative items-center justify-center`}
      >
        <div className={`relative w-loadingSpinnerSize h-loadingSpinnerSize`}>
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
                stroke={`#a3a3a3`}
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
            className="absolute w-full h-full p-[20%] top-0 left-0"
          >
            <span className="icon-[mingcute--quill-pen-line] h-full w-full"></span>
          </motion.div>
        </div>
        <div className="mt-4 text-appLayoutTextMuted text-sm font-medium animate-pulse">
          {loadingStage}
        </div>
      </div>
      <Footer />
    </motion.div>
  );
};

export default LoadingScreen;
