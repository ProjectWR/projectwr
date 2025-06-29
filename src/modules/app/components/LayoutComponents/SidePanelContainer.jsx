import { useCallback, useEffect, useState } from "react";
import useRefreshableTimer from "../../hooks/useRefreshableTimer";
import { appStore } from "../../stores/appStore";
import { AnimatePresence, useAnimate, motion } from "motion/react";
import { max, min } from "lib0/math";
import ActivityBar from "./ActivityBar";
import SidePanel from "./SidePanel";

export const SidePanelContainer = ({ loading }) => {
  const [isPanelAwake, refreshPanel, keepAwake] = useRefreshableTimer({ time: 500 });
  const sidePanelWidth = appStore((state) => state.sidePanelWidth);
  const setSidePanelWidth = appStore((state) => state.setSidePanelWidth);
  const zoom = appStore((state) => state.zoom);
  const sideBarOpened = appStore((state) => state.sideBarOpened);

  const isMd = appStore((state) => state.isMd);

  const panelOpened = appStore((state) => state.panelOpened);

  const [sidePanelSliderPos, setSidePanelSliderPos] = useState(sidePanelWidth);
  const [sidePanelSliderActive, setSidePanelSliderActive] = useState(false);

  const handleDrag = useCallback(
    (event, info) => {
      const rect = document
        .getElementById("SidePanelMotionContainer")
        ?.getBoundingClientRect();

      if (!rect) return;

      let newWidth = info.point.x - rect.left;

      const MIN_WIDTH = 240 * zoom;
      const MAX_WIDTH = 2 * zoom * 360;

      newWidth = min(MAX_WIDTH, max(MIN_WIDTH, newWidth));

      setSidePanelSliderPos(newWidth);
      setSidePanelSliderActive(true);
    },
    [setSidePanelSliderPos, setSidePanelSliderActive, zoom]
  );

  const handleDragEnd = useCallback(
    (event, info) => {
      const rect = document
        .getElementById("SidePanelMotionContainer")
        ?.getBoundingClientRect();

      if (!rect) return;

      let newWidth = info.point.x - rect.left;

      const MIN_WIDTH = 240 * zoom;
      const MAX_WIDTH = 2 * zoom * 360;

      newWidth = min(MAX_WIDTH, max(MIN_WIDTH, newWidth));

      setSidePanelWidth(newWidth);
      setSidePanelSliderPos(newWidth);
      setSidePanelSliderActive(false);
    },
    [setSidePanelWidth, setSidePanelSliderPos, setSidePanelSliderActive, zoom]
  );

  useEffect(() => {
    const rect = document
      .getElementById("SidePanelMotionContainer")
      ?.getBoundingClientRect();

    if (!rect) return;

    let newWidth = rect.right - rect.left;

    const MIN_WIDTH = 240 * zoom;
    const MAX_WIDTH = 2 * zoom * 360;

    newWidth = min(MAX_WIDTH, max(MIN_WIDTH, newWidth));

    setSidePanelWidth(newWidth);
  }, [setSidePanelWidth, zoom]);

  useEffect(() => {
    if (!isMd) refreshPanel();
  }, [isMd, refreshPanel]);

  return (
    <div
      id="ActivityBarAndSidePanelContainer"
      className="w-fit min-w-fit h-full flex flex-row items-center relative"
      onMouseEnter={() => {
        keepAwake();
      }}
      onMouseLeave={() => {
        refreshPanel();
      }}
    >
      <ActivityBar isPanelAwakeOrScreenMd={isMd || isPanelAwake} />
      <AnimatePresence mode="wait">
        {panelOpened && sideBarOpened && (isMd || isPanelAwake) && (
          <motion.div
            key="SidePanelMotionContainer"
            id="SidePanelMotionContainer"
            className={`h-full border-r border-appLayoutBorder z-5 bg-appBackgroundAccent ${!isMd &&
              "absolute top-0 left-full bg-appBackgroundAccent/95 backdrop-blur-[1px]"
              } `}
            initial={{
              opacity: 0,
              width: 0,
              minWidth: 0,
              transition: { duration: 0.05 },
            }}
            animate={{
              opacity: 1,
              width: `${sidePanelWidth}px`,
              minWidth: `${sidePanelWidth}px`,
              transition: { duration: 0.05 },
            }}
            exit={{
              opacity: 0,
              width: 0,
              minWidth: 0,
              transition: { duration: 0.05 },
            }}
          >
            <div id="SidePanelWrapper" className="h-full w-full relative">
              <SidePanel />
              <motion.div
                className={`absolute h-full w-[6px] top-0 z-[50] hover:bg-sidePanelDragHandle ${sidePanelSliderActive
                    ? "bg-sidePanelDragHandle"
                    : "bg-transparent"
                  } cursor-w-resize`}
                drag="x"
                style={{
                  left: `${sidePanelSliderPos}px`,
                }}
                dragConstraints={{
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                dragElastic={0}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              ></motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
