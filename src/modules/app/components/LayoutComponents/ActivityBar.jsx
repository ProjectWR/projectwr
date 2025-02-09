import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";

const ActivityBar = ({}) => {
  const { deviceType } = useDeviceType();

  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const activity = appStore((state) => state.activity);
  const setActivity = appStore((state) => state.setActivity);

  const showActivityBar = appStore((state) => state.showActivityBar);

  return (
    <AnimatePresence>
      {showActivityBar && (
        <motion.div
          id="ActivityBarContainer"
          className={`flex items-center ${
            deviceType === "mobile"
              ? "w-full h-activityBarHeight order-last flex-row"
              : "h-full w-activityBarWidth order-first flex-col"
          } border-t border-appLayoutBorder z-[100]`}
          style={{
            boxShadow: "0 -1px 6px -1px hsl(var(--appLayoutShadow))", // Right shadow
            clipPath: "inset(-10px 0 0 0)", // Clip the shadow on the bottom
          }}
          key={`${showActivityBar}`}
          initial={deviceType !== "mobile" ? { height: "100%" } : { height: 0 }}
          animate={
            deviceType !== "mobile"
              ? { height: "100%" }
              : { height: "var(--activityBarHeight)" }
          }
          exit={deviceType !== "mobile" ? { height: "100%" } : { height: 0 }}
          transition={{ duration: 0.1 }}
        >
          <ActivityButton
            onClick={() => {
              setPanelOpened(true);
              setActivity("libraries");
            }}
            activity={activity}
            selectedActivity={"libraries"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[ion--library-sharp] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
            }
          />
          <div className="w-px h-[60%] bg-appLayoutBorder"></div>

          <ActivityButton
            onClick={() => {
              setActivity("home");
              setPanelOpened(false);
            }}
            activity={activity}
            selectedActivity={"home"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[material-symbols-light--home] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
            }
          />

          <div className="w-px h-[60%] bg-appLayoutBorder"></div>

          <ActivityButton
            onClick={() => {
              setActivity("settings");
              setPanelOpened(false);
            }}
            activity={activity}
            selectedActivity={"settings"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[material-symbols-light--settings] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActivityBar;

const ActivityButton = ({
  onClick,
  className,
  buttonContent,
  selectedActivity,
  activity,
  deviceType,
}) => {
  return (
    <motion.button
      key={activity}
      className={`relative 
        ${
          deviceType === "mobile"
            ? "h-full flex-grow"
            : "w-full h-activityButtonHeight"
        } 
     

        ${
          selectedActivity === activity
            ? "text-appLayoutHighlight"
            : "text-appLayoutTextMuted  hover:text-appLayoutHighlight"
        }

        ${className}`}
      onClick={onClick}
      initial={false}
      animate={{
        backgroundColor:
          selectedActivity === activity
            ? "hsl(var(--appLayoutPressed))"
            : "hsl(var(--appBackground))",
      }}
      transition={{ duration: 0.2 }}
    >
      {buttonContent}
      {selectedActivity === activity ? (
        <motion.div
          id="ActivitySelectLine"
          layoutId="ActivitySelectLine"
          transition={{ duration: 0.1 }}
          className={`absolute ${
            deviceType === "mobile"
              ? "h-px w-full top-0"
              : "w-px h-full left-full top-0"
          } bg-white`}
        />
      ) : null}
    </motion.button>
  );
};
