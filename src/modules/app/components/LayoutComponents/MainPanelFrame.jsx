import { useCallback, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { mainPanelStore } from "../../stores/mainPanelStore";
import MainPanel from "./MainPanel";
import { max, min } from "lib0/math";
import { useDrop } from "react-dnd";
import { TabButton } from "./TabsBar";
import { ErrorBoundary } from "react-error-boundary";

export const MainPanelFrame = () => {
  const splitMode = mainPanelStore((state) => state.splitMode);
  const splitRatio = mainPanelStore((state) => state.splitRatio);
  const setSplitRatio = mainPanelStore((state) => state.setSplitRatio);
  const setSplitMode = mainPanelStore((state) => state.setSplitMode);
  const setSplitPanelState = mainPanelStore(
    (state) => state.setSplitPanelState,
  );
  const splitPanelState = mainPanelStore((state) => state.splitPanelState);

  // State for drag handle
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(0);

  const handleDragStart = useCallback(
    (event, info) => {
      setIsDragging(true);

      // Store initial position based on split mode
      if (splitMode == "x") {
        setDragStartPos(event.clientX);
      } else {
        setDragStartPos(event.clientY);
      }
    },
    [splitMode],
  );

  // Alternative: Using drag constraints and direct ratio calculation
  const handleDragAlt = useCallback(
    (event, info) => {
      const container = document.getElementById("MainPanelContainer");
      if (!container) return;

      const rect = container.getBoundingClientRect();

      let newRatio;
      if (splitMode == "x") {
        // For horizontal split - calculate ratio based on mouse position
        const mouseX = info.point.x;
        const relativeX = mouseX - rect.left;
        newRatio = relativeX / rect.width;
      } else {
        // For vertical split - calculate ratio based on mouse position
        const mouseY = info.point.y;
        const relativeY = mouseY - rect.top;
        newRatio = relativeY / rect.height;
      }

      // Constrain ratio between 0.2 and 0.8
      newRatio = min(0.8, max(0.2, newRatio));
      setSplitRatio(newRatio);
    },
    [splitMode, setSplitRatio],
  );

  const handleDragEndAlt = useCallback((event, info) => {
    setIsDragging(false);
  }, []);

  const [dropZone, setDropZone] = useState(null); // 'right' | 'bottom' | null
  const ref = useRef(null);

  const [{ isOver }, drop] = useDrop({
    accept: "ITEM",
    hover: (item, monitor) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      const x = clientOffset.x - rect.left;
      const y = clientOffset.y - rect.top;

      const width = rect.width;
      const height = rect.height;

      // Define zones
      // If dragging over the right 20%
      if (x > width * 0.8) {
        setDropZone("right");
        return;
      }
      // If dragging over the bottom 20%
      if (y > height * 0.8) {
        setDropZone("bottom");
        return;
      }

      setDropZone(null);
    },
    drop: (item, monitor) => {
      if (dropZone === "right") {
        setSplitMode("x");
        setSplitPanelState(item.tabProps);
      } else if (dropZone === "bottom") {
        setSplitMode("y");
        setSplitPanelState(item.tabProps);
      }
      setDropZone(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      id="MainPanelContainer"
      className={`grow min-w-0 basis-0 h-full overflow-hidden flex relative ${splitMode == "x" ? "flex-row" : "flex-col"
        }`}
    >
      {/* Drop Zone Overlays */}
      <AnimatePresence>
        {isOver && dropZone === "right" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-0 h-full w-1/5 bg-appLayoutHighlight/20 z-[60] border-l-2 border-appLayoutHighlight flex items-center justify-center pointer-events-none"
          >
            <span className="icon-[material-symbols-light--dock-to-right] w-12 h-12 text-appLayoutHighlight"></span>
          </motion.div>
        )}
        {isOver && dropZone === "bottom" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 w-full h-1/5 bg-appLayoutHighlight/20 z-[60] border-t-2 border-appLayoutHighlight flex items-center justify-center pointer-events-none"
          >
            <span className="icon-[material-symbols-light--dock-to-bottom] w-12 h-12 text-appLayoutHighlight"></span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={splitMode != "none" ? { flexGrow: splitRatio } : {}}
        className={`min-w-0 grow-1 min-h-0 basis-0  ${splitMode == "x" ? "h-full" : ""
          } ${splitMode == "y" ? "w-full" : ""} ${splitMode == "none" ? "h-full w-full" : ""
          }`}
      >
        <ErrorBoundary key={"Main Panel Error Boundary"} fallback={<div className="h-full w-full flex items-center justify-center">The cake is a lie</div>}>
          <MainPanel main={true} />
        </ErrorBoundary>
      </div>

      {splitMode != "none" && (
        <>
          <div
            className={`spltiPanelDivider bg-appLayoutBorder ${splitMode == "x" ? "w-px min-w-px h-full" : "h-px min-h-px w-full"
              }`}
          ></div>

          {/* Drag Handle */}
          <motion.div
            className={`absolute z-[50] hover:bg-sidePanelDragHandle ${isDragging ? "bg-sidePanelDragHandle" : "bg-transparent"
              } ${splitMode === "x"
                ? "w-[6px] h-full cursor-col-resize"
                : "h-[6px] w-full cursor-row-resize"
              }`}
            style={{
              [splitMode == "x" ? "left" : "top"]: `calc(${splitRatio * 100
                }% - 3px)`,
              [splitMode == "x" ? "top" : "left"]: "0",
            }}
            drag={splitMode}
            dragConstraints={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDragAlt}
            onDragEnd={handleDragEndAlt}
          // Alternative: using drag listeners for more control
          // dragListener={false}
          // onPointerDown={handleDragStart}
          // onPointerMove={handleDrag}
          // onPointerUp={handleDragEnd}
          ></motion.div>
        </>
      )}

      {splitMode != "none" && (
        <div
          style={{ flexGrow: 1 - splitRatio }}
          className={`min-w-0 min-h-0 basis-0 relative ${splitMode == "x" ? "h-full" : ""
            } ${splitMode == "y" ? "w-full" : ""} `}
        >

          <ErrorBoundary key={"Main Panel Error Boundary"} fallback={<div className="h-full w-full flex items-center justify-center">The cake is a lie</div>}>
            <MainPanel main={false} />

          </ErrorBoundary>

          {/* Hovering Split Panel Tab */}
          {splitPanelState && (
            <div className="absolute top-1 left-1 z-50 shadow-none">
              <div className="h-tabsHeight w-fit max-w-tabWidth">
                <TabButton
                  panelType={splitPanelState.panelType}
                  mode={splitPanelState.mode}
                  splitTab={true}
                  breadcrumbs={splitPanelState.breadcrumbs}
                  isRemoveAvailable={true}
                  splitPanelTab={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
