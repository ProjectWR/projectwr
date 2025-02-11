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
          className={`flex gap-px items-center ${
            deviceType === "mobile"
              ? "w-full h-activityBarHeight order-last flex-row"
              : "h-full w-activityBarWidth order-first flex-col"
          } border-t border-appLayoutBorder z-[50]`}
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
            flexValue={"grow-3"}
          />

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
            flexValue={"grow-1"}
          />
          <ActivityButton
            onClick={() => {
              setActivity("templates");
              setPanelOpened(true);
            }}
            activity={activity}
            selectedActivity={"templates"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[carbon--template] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
            }
            flexValue={"grow-1"}
          />
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
            flexValue={"grow-1"}
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
  flexValue,
}) => {
  return (
    <button
      key={activity}
      className={`relative 
        ${
          deviceType === "mobile"
            ? `h-full ${flexValue}`
            : "w-full h-activityButtonHeight"
        } 
     
        ${
          selectedActivity === activity
            ? "text-appLayoutHighlight bg-appLayoutPressed z-[100] shadow-md shadow-appLayoutShadow"
            : "text-appLayoutTextMuted  hover:text-appLayoutHighlight bg-appBackground"
        }

        transition-colors duration-500
       
        ${className}`}
      onClick={onClick}
    >
      {buttonContent}
      <AnimatePresence>
        {selectedActivity === activity && (
          <motion.div
            id="ActivitySelectLine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${
              deviceType === "mobile"
                ? "h-px w-full top-0"
                : "w-px h-full left-full top-0"
            } bg-white`}
          />
        )}
      </AnimatePresence>
    </button>
  );
};
