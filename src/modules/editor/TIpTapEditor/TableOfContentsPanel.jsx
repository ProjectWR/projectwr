import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { appStore } from "../../app/stores/appStore";

export const TableOfContentsPanel = ({ editor, toolbarPreferences }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);

  const tocPinned = appStore((state) => state.tocPinned);
  const setTocPinned = appStore((state) => state.setTocPinned);

  const { buttonHeight, buttonWidth, buttonRadius } = toolbarPreferences;

  const [headings, setHeadings] = useState([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [documentHeight, setDocumentHeight] = useState(0);

  // Update headings and calculate positions
  const updateHeadings = useCallback(() => {
    if (!editor) return;

    const editorContainer = document.getElementById("EditableContainer");
    const paperContent = document.getElementById("PaperEditorContent");

    if (!editorContainer || !paperContent) return;

    const containerRect = editorContainer.getBoundingClientRect();
    const paperRect = paperContent.getBoundingClientRect();

    setContainerHeight(containerRect.height);
    setDocumentHeight(paperContent.scrollHeight);

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

  // Calculate POI size based on heading level (H1 = largest, H6 = smallest)
  const getPOISize = (level) => {
    const sizes = {
      1: 12,
      2: 10,
      3: 8,
      4: 7,
      5: 6,
      6: 5,
    };
    return sizes[level] || 6;
  };

  return (
    <div className="w-fit h-full flex flex-col absolute top-1 right-scrollbarWidth">
      <div className="h-fit w-fit flex z-[100]">
        {/* Trigger Button */}
        <button
          className={`rounded-lg transition-all duration-200 ${
            tocPinned ? "opacity-100" : "opacity-30 hover:opacity-60"
          }`}
          style={{
            height: `calc(${buttonHeight}rem * var(--uiScale))`,
            borderRadius: `${buttonRadius}rem`,
            width: `calc(${buttonWidth}rem * var(--uiScale))`,
            minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
          }}
          onClick={() => setTocPinned(!tocPinned)}
        >
          <span className="icon-[carbon--table-of-contents] w-full h-full text-appLayoutText" />
        </button>
      </div>

      {tocPinned && (
        <div
          ref={overlayRef}
          className={`grow w-[30px] z-[90] pointer-events-none
                    transition-opacity duration-300 opacity-100`}
        >
          {/* Minimap track */}
          <div className="relative w-full h-full pointer-events-auto">
            {headings.map((h, idx) => {
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
                  className="absolute right-1/2 translate-x-1/2 cursor-pointer"
                  style={{
                    top: `${scaledY}px`,
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => h.action()}
                >
                  {/* POI Circle */}
                  <motion.div
                    className="rounded-full bg-appLayoutHighlight/70 hover:bg-appLayoutHighlight transition-all"
                    style={{
                      width: `${poiSize}px`,
                      height: `${poiSize}px`,
                    }}
                    whileHover={{ scale: 1.3 }}
                  />

                  {/* Heading label on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute right-full ml-2 top-1/2 -translate-y-1/2
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
      )}
    </div>
  );
};
