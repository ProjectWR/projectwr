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

    const sideBarOpened = appStore((state) => state.sideBarOpened);


  return (
    <AnimatePresence mode="wait">
      {showActivityBar && sideBarOpened && (
        <motion.div
          id="ActivityBarContainer"
          className={`flex flex-shrink-0 gap-px items-center bg-appBackground ${
            deviceType === "mobile"
              ? "w-full h-activityBarHeight order-last flex-row border-t"
              : "h-full w-activityBarWidth order-first flex-col border-r"
          } border-appLayoutBorder z-5 overflow-hidden`}
          style={{
            boxShadow:
              deviceType === "mobile"
                ? "0 -1px 6px -1px hsl(var(--appLayoutShadow))"
                : "", // Right shadow
            clipPath: deviceType === "mobile" ? "inset(-10px 0 0 0)" : "", // Clip the shadow on the bottom
          }}
          key={`${showActivityBar}`}
          initial={deviceType !== "mobile" ? { width: 0 } : { height: 0 }}
          animate={
            deviceType !== "mobile"
              ? { width: "var(--activityBarWidth)" }
              : { height: "var(--activityBarHeight)" }
          }
          exit={deviceType !== "mobile" ? { width: 0 } : { height: 0 }}
          transition={{ duration: 0.1 }}
        >
          {deviceType === "desktop" && (
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
          )}
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

          {deviceType === "mobile" && (
            <ActivityButton
              onClick={() => {
                setActivity("home");
                setPanelOpened(true);
              }}
              activity={activity}
              selectedActivity={"home"}
              deviceType={deviceType}
              buttonContent={
                <span className="icon-[material-symbols-light--home] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
              }
              flexValue={"grow-1"}
            />
          )}
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
    <motion.button
      key={activity}
      className={`relative 
        ${
          deviceType === "mobile"
            ? `h-full ${flexValue}`
            : "w-full h-activityButtonHeight"
        } 
     
        ${
          selectedActivity === activity
            ? "text-appLayoutHighlight bg-appLayoutPressed z-6 shadow-sm shadow-appLayoutShadow"
            : "text-appLayoutTextMuted bg-appBackground hover:text-appLayoutHighlight"
        }
       
        ${className}`}
      onClick={onClick}
    >
      {buttonContent}
      <AnimatePresence mode="wait">
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
            } bg-activitySelectLine`}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};
