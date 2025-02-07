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
          className={`flex ${
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
              setActivity("home");
              setPanelOpened(false);
            }}
            activity={activity}
            selectedActivity={"home"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[material-symbols-light--home] mt-1 h-[2.2rem] w-[2.2rem]"></span>
            }
          />
          <ActivityButton
            onClick={() => {
              setPanelOpened(true);
              setActivity("libraries");
            }}
            activity={activity}
            selectedActivity={"libraries"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[ion--library-sharp] mt-1 h-[2.2rem] w-[2.2rem]"></span>
            }
          />
          {/* <ActivityButton
        onClick={() => {
          setActivity("templates");
          setPanelOpened(true);
        }}
        activity={activity}
        selectedActivity={"templates"}
        deviceType={deviceType}
        buttonContent={<p>Tem</p>}
      /> */}
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
    <button
      className={`relative 
        ${
          deviceType === "mobile"
            ? "h-full flex-grow"
            : "w-full h-activityButtonHeight"
        } 
        hover:text-appLayoutHighlight
        ${
          selectedActivity === activity
            ? "bg-appLayoutPressed"
            : "hover:bg-appLayoutHover"
        }
        
        transition-colors duration-300 ${className}`}
      onClick={onClick}
    >
      {buttonContent}
      {selectedActivity === activity ? (
        <AnimatePresence>
          <motion.div
            id="ActivitySelectLine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0 }}
            className={`absolute ${
              deviceType === "mobile"
                ? "h-px w-full top-0"
                : "w-px h-full left-full top-0"
            } bg-white`}
          />
        </AnimatePresence>
      ) : null}
    </button>
  );
};
