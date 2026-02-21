import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { appStore } from "../../app/stores/appStore";

export const TableOfContentsPanel = ({
  editor,
  toolbarPreferences,
  contentOverflows,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);

  const tocPinned = appStore((state) => state.tocPinned);
  const setTocPinned = appStore((state) => state.setTocPinned);

  const {
    buttonHeight,
    buttonWidth,
    buttonRadius,
    backgroundColor,
    backgroundColorOpacity,
    toolbarBlur,
    borderColor,
    iconColor,
  } = toolbarPreferences;

  const [headings, setHeadings] = useState([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [documentHeight, setDocumentHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollTop, setDragStartScrollTop] = useState(0);

  // Update headings and calculate positions
  const updateHeadings = useCallback(() => {
    if (!editor) return;

    const editorContainer = document.getElementById("EditableContainer");
    const paperContent = document.querySelector(
      "#PaperEditorContent > div.tiptap.ProseMirror",
    );

    if (!editorContainer || !paperContent) return;

    const containerRect = editorContainer.getBoundingClientRect();
    const paperRect = paperContent.getBoundingClientRect();

    setContainerHeight(containerRect.height);
    setDocumentHeight(paperContent.scrollHeight);
    setScrollTop(editorContainer.scrollTop);
    setViewportHeight(containerRect.height);

    const headingsData = editor.$nodes("heading");

    const newHeadings = headingsData.map((heading) => {
      // Get the DOM element for this heading
      const domNode = editor.view.domAtPos(heading.pos + 1).node;
      let headingElement =
        domNode.nodeType === Node.ELEMENT_NODE
          ? domNode
          : domNode.parentElement;

      while (
        headingElement &&
        !headingElement.matches("h1, h2, h3, h4, h5, h6")
      ) {
        headingElement = headingElement.parentElement;
      }

      let yPos = 0;
      if (headingElement) {
        const headingRect = headingElement.getBoundingClientRect();
        // Position relative to paper content
        yPos = headingRect.top - paperRect.top;
      }

      return {
        level: heading.attributes.level,
        content: heading,
        y: yPos,
        pos: heading.pos,
        text: heading.node.textContent || "Untitled",
        action: async () => {
          await editor
            .chain()
            .setTextSelection(heading.pos)
            .scrollIntoView()
            .run();
        },
      };
    });

    setHeadings(newHeadings);
  }, [editor]);

  // Update on editor changes, scroll, and resize
  useEffect(() => {
    if (!editor) return;

    updateHeadings();

    const editorContainer = document.getElementById("EditableContainer");

    const handleUpdate = () => {
      requestAnimationFrame(updateHeadings);
    };

    editor.on("update", handleUpdate);
    editor.on("transaction", handleUpdate);

    if (editorContainer) {
      editorContainer.addEventListener("scroll", handleUpdate);
    }

    window.addEventListener("resize", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("transaction", handleUpdate);
      if (editorContainer) {
        editorContainer.removeEventListener("scroll", handleUpdate);
      }
      window.removeEventListener("resize", handleUpdate);
    };
  }, [editor, updateHeadings]);

  // Handle thumb dragging
  const handleThumbMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStartY(e.clientY);
      setDragStartScrollTop(scrollTop);
    },
    [scrollTop],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const editorContainer = document.getElementById("EditableContainer");
      if (!editorContainer || documentHeight === 0) return;

      const deltaY = e.clientY - dragStartY;
      const scrollDelta = (deltaY / containerHeight) * documentHeight;
      const newScrollTop = Math.max(
        0,
        Math.min(
          documentHeight - viewportHeight,
          dragStartScrollTop + scrollDelta,
        ),
      );

      editorContainer.scrollTop = newScrollTop;
    },
    [
      isDragging,
      dragStartY,
      dragStartScrollTop,
      containerHeight,
      documentHeight,
      viewportHeight,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate POI size based on heading level (H1 = largest, H6 = smallest)
  const getPOISize = (level) => {
    const sizes = {
      1: 16,
      2: 10,
      3: 6,
    };
    return sizes[level] || 6;
  };

  return (
    <div className="w-fit h-full flex flex-col absolute top-0 right-0 items-center">
      <div className="h-fit w-fit flex z-[100]">
        {/* Trigger Button */}
        <button
          tabIndex={-1}
          className={`rounded-lg transition-all duration-200  ${tocPinned ? "opacity-100" : "opacity-50 hover:opacity-75"
            }`}
          style={{
            height: `calc(${buttonHeight}px * var(--uiScale))`,
            borderRadius: `0 0 0 ${buttonRadius}px`,
            width: `calc(${buttonWidth}px * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}px * var(--uiScale))`,
            backgroundColor: tocPinned
              ? `color-mix(in srgb, ${backgroundColor} ${backgroundColorOpacity ?? 100}%, transparent)`
              : "transparent",
            backdropFilter: tocPinned ? `blur(${toolbarBlur || 0}px)` : "none",
          }}
          onClick={() => setTocPinned(!tocPinned)}
        >
          <span
            className="icon-[carbon--table-of-contents] w-full h-full"
            style={{ color: iconColor }}
          />
        </button>
      </div>

      <div
        ref={overlayRef}
        className={`grow min-h-0 basis-0 w-[30px] z-[90] pointer-events-none
                    transition-opacity duration-300 opacity-100`}
      >
        {/* Minimap track */}
        <div className="relative w-full h-full pointer-events-auto">
          {documentHeight > 0 && viewportHeight / documentHeight < 1 && (
            <div
              id="TOCVirtualScrollTrack"
              className="absolute left-1/2 -translate-x-1/2 w-px h-full z-[98] "
            />
          )}
          {/* Virtual scroll thumb */}
          {documentHeight > 0 && viewportHeight / documentHeight < 1 && (
            <motion.div
              id="TOCVirtualScrollThumb"
              className="absolute left-1/2 -translate-x-1/2 w-scrollbarWidthThin min-h-5 z-[99] rounded-xl  transition-colors cursor-grab active:cursor-grabbing"
              style={{
                top: `${(scrollTop / documentHeight) * containerHeight}px`,
                height: `${(viewportHeight / documentHeight) * containerHeight
                  }px`,
              }}
              initial={false}
              animate={{
                top: `${(scrollTop / documentHeight) * containerHeight}px`,
                height: `${(viewportHeight / documentHeight) * containerHeight
                  }px`,
              }}
              transition={{ duration: 0.1 }}
              onMouseDown={handleThumbMouseDown}
            />
          )}

          {/* POI circles */}
          {tocPinned &&
            headings.map((h, idx) => {
              const isHovered = hoveredIndex === idx;

              // Scale Y position from document height to container height
              const scaledY =
                documentHeight > 0
                  ? (h.y / documentHeight) * containerHeight
                  : 0;

              const poiSize = getPOISize(h.level);

              return (
                <div
                  key={`${h.pos}-${idx}`}
                  className=" absolute z-[99] translate-x-1/2 cursor-pointer"
                  style={{
                    top: `${scaledY}px`,
                    right: `calc(50% + 20px * var(--uiScale))`,
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => h.action()}
                >
                  {/* POI Circle */}
                  <motion.div
                    className="TOCPOIContainer relative"
                    style={{
                      width: `${poiSize}px`,
                      height: `${poiSize}px`,
                    }}
                    whileHover={{ scale: 1.3, duration: 0.05 }}
                  >
                    <div
                      style={{
                        height: `calc(2px * var(--uiScale))`,
                      }}
                      className="TOCPOI transition-colors w-full absolute left-0 top-1/2 -translate-y-1/2"
                    ></div>
                  </motion.div>

                  {/* Heading label on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute right-[150%] ml-2 top-1/2 -translate-y-1/2
                                 px-2 py-1 rounded bg-appBackground/90 backdrop-blur-sm
                                 border border-appLayoutBorder shadow-lg whitespace-nowrap
                                 text-appLayoutText text-sm"
                        style={{
                          minWidth: "100px",
                          maxWidth: "200px",
                        }}
                      >
                        <div className="truncate">{h.text}</div>
                        <div className="text-xs text-appLayoutTextMuted">
                          H{h.level}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
