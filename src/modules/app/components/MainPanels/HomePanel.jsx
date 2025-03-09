import {
  useMotionTemplate,
  useMotionValue,
  motion,
  useSpring,
  AnimatePresence,
} from "motion/react";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";


const HomePanel = () => {
  const { deviceType } = useDeviceType();

  return (
    <AnimatePresence mode="wait">
      <div
        id="HomeContainer"
        className={`h-full flex flex-col items-center justify-center 
        ${deviceType === "mobile" && "w-full"}   
        ${deviceType === "desktop" && "mt-0 pb-20 px-8"}       
      `}
        style={
          deviceType === "desktop" && {
            width: `var(--detailsPanelWidth)`,
            minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
          }
        }
      >        
        <div
          id="HomeHeader"
          className={`h-fit min-h-fit w-full flex flex-col items-start
            ${deviceType === "desktop" && "px-6"}
          `}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ bounce: 0 }}
            className="text-homePanelHeaderFontSize select-none pointer-events-none"
          >
            Tulip Writer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, bounce: 0 }}
            className="text-homePanelSubtitleFontSize text-appLayoutTextMuted pl-1"
          >
            &nbsp;
            <q>
              The problems of the human heart in conflict with itself… alone can
              make good writing because only that is worth writing about, worth
              the agony and the sweat.
            </q>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, bounce: 0 }}
            className="text-homePanelSubtitleFontSize text-appLayoutText flex flex-row w-full"
          >
            <span className="flex-grow"></span>
            <span className="w-fit">- Rohit Kottamasu</span>
          </motion.p>
        </div>

        <div
          id="HomeBody"
          className="h-fit min-h-fit w-full flex flex-col items-center justify-start px-6 mt-12"
        >
          {/* <div className="h-[10rem] w-full isolate relative rounded-lg overflow-hidden">
          <div className="h-full w-full noise"></div>
          <div className="h-full w-full absolute top-0 overlay"></div>
        </div> */}

          {/* <div className="w-full h-fit flex flex-row">
          <div className="h-fit flex-grow flex flex-col items-start justify-start">
            <GrainyButton
              className={`h-[5rem] w-[25rem] rounded-lg overflow-hidden border border-appLayoutBorder`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <h1 className="text-4xl">Button</h1>
              </div>
            </GrainyButton>

            <GrainyButton
              className={`h-[5rem] w-[25rem] rounded-lg overflow-hidden border border-appLayoutBorder mt-4`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <h1 className="text-4xl">Button</h1>
              </div>
            </GrainyButton>

            <GrainyButton
              className={`h-[5rem] w-[25rem] rounded-lg overflow-hidden border border-appLayoutBorder mt-4`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <h1 className="text-4xl">Button</h1>
              </div>
            </GrainyButton>

            <GrainyButton
              className={`h-[5rem] w-[25rem] rounded-lg overflow-hidden border border-appLayoutBorder mt-4`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <h1 className="text-4xl">Button</h1>
              </div>
            </GrainyButton>
          </div>
          <div className="h-fit flex-grow flex flex-col items-start justify-start"></div>
        </div> */}
        </div>
      </div>
    </AnimatePresence>
  );
};

export default HomePanel;

const GrainyButton = ({ children, className }) => {
  const grainyButtonRef = useRef(null);

  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(-400);
  const mouseXSpring = useSpring(mouseX, { stiffness: "400", damping: "50" });
  const mouseYSpring = useSpring(mouseY, { stiffness: "400", damping: "50" });

  const [hover, setHover] = useState(false);

  const hoverColor = useMemo(() => {
    if (hover) return `#232323`;
    else return "#171717";
  }, [hover]);

  const hoverColorSpring = useSpring(hover, {
    stiffness: "400",
    damping: "50",
  });

  const handleMouseMove = ({ clientX, clientY, currentTarget }) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    mouseX.set(((clientX - left) / width) * 100);
    mouseY.set(((clientY - top) / height) * 100);
  };

  const handleMouseLeave = () => {
    mouseX.set(50);
    mouseY.set(-400);
    setHover(false);
  };

  const spotlightBackground = useMotionTemplate`radial-gradient(30rem 30rem at ${mouseXSpring}% ${mouseYSpring}%, #2E2E2E 0%, #1F1F1F 100%, #1F1F1F 100%`;
  return (
    <motion.div
      ref={grainyButtonRef}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundImage: spotlightBackground,
      }}
      className={`relative ${className}`}
    >
      <div className="w-full h-full noise mix-blend-multiply"></div>

      <button className="absolute w-full h-full top-0 left-0">
        {children}
      </button>
    </motion.div>
  );
};
