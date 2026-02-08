import { appStore } from "../../stores/appStore";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { AnimatePresence, motion } from "motion/react";
import useStoreHistory from "../../hooks/useStoreHistory";
import { Tooltip } from "@mantine/core";
import { StyledTooltip } from "./StyledTooltip";
import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const ActivityBar = ({ isPanelAwakeOrScreenMd }) => {
  const { deviceType } = useDeviceType();

  const isDesktop = deviceType === "desktop";

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
          className={`flex shrink-0 gap-px items-center bg-appBackgroundAccent backdrop-blur-2xl   
          h-full w-activityBarWidth order-first flex-col border-r
           border-appLayoutBorder z-1000 overflow-hidden
           `}
          key={`${showActivityBar}`}
        >
          <ActivityButton
            onClick={() => {
              if (activity !== "libraries") {
                setActivity("libraries");
              }

              setPanelOpened(true);

              if (activity === "libraries" && libraryId !== "unselected") {
                console.log(
                  "ACTIVITY AND LIBRARYID INSIDE",
                  activity,
                  libraryId,
                );
              }
            }}
            label={"Your Libraries"}
            activity={activity}
            selectedActivity={"libraries"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[ion--library-sharp] h-activityBarIconSize w-activityBarIconSize"></span>
            }
            flexValue={"grow-3"}
          />

          <ActivityButton
            onClick={() => {
              if (activity !== "search") {
                setActivity("search");
              }

              setPanelOpened(true);
            }}
            label={"Search your Library"}
            activity={activity}
            selectedActivity={"search"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[material-symbols-light--search] h-activityBarIconSize w-activityBarIconSize"></span>
            }
            flexValue={"grow-1"}
          />
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
          {/* <ActivityButton
            onClick={() => {
              if (activity !== "dictionary") {
                setActivity("dictionary");
              }

              setPanelOpened(true);
            }}
            label={"Your Dictionary"}
            activity={activity}
            selectedActivity={"dictionary"}
            deviceType={deviceType}
            buttonContent={
              <span className="icon-[material-symbols-light--match-word-rounded]  h-activityBarIconSize w-activityBarIconSize"></span>
            }
            flexValue={"grow-1"}
          /> */}
          {deviceType === "mobile" && (
            <ActivityButton
              onClick={() => {
                if (activity !== "settings") {
                  setActivity("settings");
                }

                setPanelOpened(false);
              }}
              label={"Settings"}
              activity={activity}
              selectedActivity={"settings"}
              deviceType={deviceType}
              buttonContent={
                <span className="icon-[material-symbols-light--settings]  h-activityBarIconSize w-activityBarIconSize"></span>
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
                  label={"Close Side Panel"}
                  activity={"closeSidePanelButton"}
                  deviceType={deviceType}
                  toggleButton={true}
                  buttonContent={
                    <span className="icon-[material-symbols-light--arrow-menu-close] h-activityBarIconSize w-activityBarIconSize"></span>
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
                  label={"Open Side Panel"}
                  activity={"openSidePanelButton"}
                  deviceType={deviceType}
                  toggleButton={true}
                  buttonContent={
                    <span className="icon-[material-symbols-light--arrow-menu-open] h-activityBarIconSize w-activityBarIconSize"></span>
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
  label = "Default Label",
  deviceType,
  flexValue,
  toggleButton = false,
}) => {
  return (
    <StyledTooltip label={label}>
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

        flex items-center justify-center
     
        ${
          selectedActivity === activity
            ? "text-activityButtonIconHighlight bg-appLayoutPressed/50 z-1000 "
            : "text-appLayoutTextMuted hover:text-appLayoutText"
        }
       
        ${className}
      `}
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
    </StyledTooltip>
  );
};
