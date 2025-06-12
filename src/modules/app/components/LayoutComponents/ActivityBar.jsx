import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import useStoreHistory from "../../hooks/useStoreHistory";

const ActivityBar = ({ isPanelAwakeOrScreenMd }) => {
  const { deviceType } = useDeviceType();

  const panelOpened = appStore((state) => state.panelOpened);
  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const {
    saveStateInHistory,
    canGoBack,
    goBack,
    canGoForward,
    goForward,
    clearFuture,
  } = useStoreHistory();

  const activity = appStore((state) => state.activity);
  const setActivity = appStore((state) => state.setActivity);
  const setLibraryId = appStore((state) => state.setLibraryId);
  const libraryId = appStore((state) => state.libraryId);

  const showActivityBar = appStore((state) => state.showActivityBar);

  const sideBarOpened = appStore((state) => state.sideBarOpened);

  return (
    <AnimatePresence mode="wait">
      {showActivityBar && sideBarOpened && (
        <motion.div
          id="ActivityBarContainer"
          className={`flex shrink-0 gap-px items-center bg-appBackground ${
            deviceType === "mobile"
              ? "w-full h-activityBarHeight order-last flex-row border-t"
              : "h-full w-activityBarWidth order-first flex-col border-r"
          } border-appLayoutBorder z-1000 overflow-hidden`}
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
          <ActivityButton
            onClick={() => {
              if (activity !== "libraries") {
                setActivity("libraries");
              }

              setPanelOpened(true);

              if (activity === "libraries" && libraryId !== "unselected") {
                console.log("ACTIVITY AND LIBRARYID INSIDE", activity, libraryId);

                setLibraryId("unselected");
              }
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
                if (activity !== "home") {
                  setActivity("home");
                }

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
          {/* <ActivityButton
            onClick={() => {
              if (activity !== "templates") {
                setActivity("templates");
              }

              setPanelOpened(true);
            }}
            activity={activity}
            selectedActivity={"templates"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[carbon--template] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
            }
            flexValue={"grow-1"}
          /> */}
          <ActivityButton
            onClick={() => {
              if (activity !== "dictionary") {
                setActivity("dictionary");
              }

              setPanelOpened(true);
            }}
            activity={activity}
            selectedActivity={"dictionary"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[material-symbols-light--match-word-rounded] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
            }
            flexValue={"grow-1"}
          />
          {deviceType === "mobile" && (
            <ActivityButton
              onClick={() => {
                if (activity !== "settings") {
                  setActivity("settings");
                }

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
          )}
          <AnimatePresence mode="wait">
            {deviceType === "desktop" &&
              panelOpened &&
              isPanelAwakeOrScreenMd && (
                <ActivityButton
                  onClick={() => {
                    if (panelOpened) {
                      setPanelOpened(false);
                    }
                  }}
                  activity={"closeSidePanelButton"}
                  deviceType={deviceType}
                  toggleButton={true}
                  buttonContent={
                    <span className="icon-[material-symbols-light--arrow-menu-close] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
                  }
                  flexValue={"grow-1"}
                />
              )}
            {deviceType === "desktop" &&
              !(panelOpened && isPanelAwakeOrScreenMd) &&
              (activity === "libraries" ||
                activity === "templates" ||
                activity === "dictionary") && (
                <ActivityButton
                  onClick={() => {
                    if (!panelOpened) {
                      setPanelOpened(true);
                    }
                  }}
                  activity={"openSidePanelButton"}
                  deviceType={deviceType}
                  toggleButton={true}
                  buttonContent={
                    <span className="icon-[material-symbols-light--arrow-menu-open] mt-1 h-activityBarIconSize w-activityBarIconSize"></span>
                  }
                  flexValue={"grow-1"}
                />
              )}
          </AnimatePresence>
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
  toggleButton = false,
}) => {
  return (
    <motion.button
      key={activity}
      initial={{ opacity: toggleButton ? 0 : 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: toggleButton ? 0 : 1 }}
      transition={{ duration: 0.15 }}
      className={`relative z-1000
        ${
          deviceType === "mobile"
            ? `h-full ${flexValue}`
            : "w-full h-activityButtonHeight"
        } 
     
        ${
          selectedActivity === activity
            ? "text-appBackground bg-appLayoutPressed z-1000 shadow-sm shadow-appLayoutShadow"
            : "text-appLayoutTextMuted bg-appBackground hover:text-appLayoutText"
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
