import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { mainPanelStore } from "../../stores/mainPanelStore";
import MainPanel from "./MainPanel";
import { max, min } from "lib0/math";

export const MainPanelFrame = () => {
    const splitMode = mainPanelStore((state) => state.splitMode);
    const splitRatio = mainPanelStore((state) => state.splitRatio);
    const setSplitRatio = mainPanelStore((state) => state.setSplitRatio);

    // State for drag handle
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState(0);

    const handleDragStart = useCallback((event, info) => {
        setIsDragging(true);

        // Store initial position based on split mode
        if (splitMode == "x") {
            setDragStartPos(event.clientX);
        } else {
            setDragStartPos(event.clientY);
        }
    }, [splitMode]);

    // Alternative: Using drag constraints and direct ratio calculation
    const handleDragAlt = useCallback((event, info) => {
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
    }, [splitMode, setSplitRatio]);

    const handleDragEndAlt = useCallback((event, info) => {
        setIsDragging(false);

    }, []);

    return (
        <div
            id="MainPanelContainer"
            className={`grow min-w-0 basis-0 h-full overflow-hidden flex relative ${splitMode == "x" ? "flex-row" : "flex-col"
                }`}
        >
            <div
                style={
                    splitMode != "none"
                        ? { flexGrow: splitRatio }
                        : {}
                }
                className={`min-w-0 grow-1 min-h-0 basis-0  ${splitMode == "x" ? "h-full" : ""
                    } ${splitMode == "y" ? "w-full" : ""} ${splitMode == "none" ? "h-full w-full" : ""
                    }`}
            >
                <MainPanel main={true} />
            </div>

            {splitMode != 'none' && (
                <>
                    <div
                        className={`spltiPanelDivider bg-appLayoutBorder ${splitMode == 'x' ? 'w-px min-w-px h-full' : 'h-px min-h-px w-full'}`}
                    >
                    </div>

                    {/* Drag Handle */}
                    <motion.div
                        className={`absolute z-[50] hover:bg-sidePanelDragHandle ${isDragging ? "bg-sidePanelDragHandle" : "bg-transparent"
                            } ${splitMode === "x"
                                ? "w-[6px] h-full cursor-col-resize"
                                : "h-[6px] w-full cursor-row-resize"}`}
                        style={{
                            [splitMode == "x" ? "left" : "top"]: `calc(${splitRatio * 100}% - 3px)`,
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
                    className={`min-w-0 min-h-0 basis-0 ${splitMode == "x" ? "h-full" : ""
                        } ${splitMode == "y" ? "w-full" : ""} `}
                >
                    <MainPanel main={false} />
                </div>
            )}
        </div>
    );
};