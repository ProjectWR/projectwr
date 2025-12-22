import { useEffect, useState, useCallback, useRef } from "react";

export const TableOfContentsPanel = ({ editor, toolbarPreferences }) => {
  const [headings, setHeadings] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);

  const {
    toolbarHeight,
    toolbarButtonHeight,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    buttonHeight,
    buttonWidth,
    buttonRadius,
    backgroundColor,
    buttonColor,
    dividerColor,
    fontSize,
    textFormatButtonWidth,
    toolbarFontSize,
    hoverColor,
    pressedColor,
  } = toolbarPreferences;

  // Calculate heading positions from DOM
  const updateHeadingPositions = useCallback(() => {
    if (!editor) return;

    const editorContainer = document.getElementById("EditableContainer");
    if (!editorContainer) return;

    const containerRect = editorContainer.getBoundingClientRect();
    const scrollTop = editorContainer.scrollTop;
    const newHeadings = [];

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        // Get DOM node for this position
        const domNode = editor.view.domAtPos(pos + 1).node;

        if (domNode) {
          // Walk up to find the actual heading element
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

          if (headingElement) {
            const rect = headingElement.getBoundingClientRect();
            const yPos = rect.top - containerRect.top + scrollTop;

            newHeadings.push({
              level: node.attrs.level,
              text: node.textContent || "Untitled",
              pos,
              yPos,
              id: `heading-${pos}`,
            });
          }
        }
      }
    });

    setHeadings(newHeadings);
  }, [editor]);

  // Update positions on content changes, scroll, and resize
  useEffect(() => {
    if (!editor) return;

    updateHeadingPositions();

    const editorContainer = document.getElementById("EditableContainer");

    const handleUpdate = () => {
      requestAnimationFrame(updateHeadingPositions);
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
  }, [editor, updateHeadingPositions]);

  const handleHeadingClick = (pos) => {
    editor.chain().setTextSelection(pos).scrollIntoView().run();
  };

  // Determine visible headings based on hierarchy and hover state
  const visibleHeadings = headings.filter((h, idx) => {
    // Always show H1s
    if (h.level === 1) return true;

    // If hovering, show children of hovered item
    if (hoveredIndex !== null) {
      const hoveredHeading = headings[hoveredIndex];

      // Show the hovered item itself
      if (idx === hoveredIndex) return true;

      // Show children of hovered heading
      if (idx > hoveredIndex && h.level > hoveredHeading.level) {
        // Check if there's a same-or-higher level heading between hovered and current
        const hasBarrier = headings
          .slice(hoveredIndex + 1, idx)
          .some((hh) => hh.level <= hoveredHeading.level);

        if (!hasBarrier) return true;
      }

      return false;
    }

    // Default: show H1 and H2 if not too crowded
    if (headings.length > 15) {
      return h.level === 1;
    }

    return h.level <= 2;
  });

  return (
    <>
      {/* Trigger Button */}
      <button
        className="absolute top-4 right-scrollbarWidth z-[100] rounded-lg 
                   bg-appBackgroundAccent/50 border border-appLayoutBorder/50
                   hover:bg-appBackgroundAccent hover:border-appLayoutBorder
                   transition-all duration-200 opacity-50 hover:opacity-100"
        style={{
          height: `calc(${buttonHeight}rem * var(--uiScale))`,
          borderRadius: `${buttonRadius}rem`,
          width: `calc(${buttonWidth}rem * var(--uiScale))`,
          minWidth: `calc(${buttonWidth}rem * var(--uiScale))`,
        }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <span className="icon-[material-symbols-light--toc] w-full h-full text-appLayoutText" />
      </button>

      {/* TOC Overlay */}
      <div
        ref={overlayRef}
        className={`absolute top-0 right-scrollbarWidth bottom-0 w-[200px] z-[90] pointer-events-none
                    transition-opacity duration-300 ${
                      isVisible ? "opacity-100" : "opacity-0"
                    }`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => {
          setIsVisible(false);
          setHoveredIndex(null);
        }}
      >
        {/* Transparent container for heading items */}
        <div className="relative w-full h-full pointer-events-auto">
          {visibleHeadings.map((h, idx) => {
            const originalIdx = headings.indexOf(h);
            const isHovered = hoveredIndex === originalIdx;

            return (
              <div
                key={h.id}
                className="absolute right-0 transition-all duration-200"
                style={{
                  top: `${h.yPos}px`,
                  transform: "translateY(-50%)",
                }}
              >
                <button
                  className={`
                    px-3 py-1 rounded-l-lg text-right transition-all duration-200
                    backdrop-blur-sm
                    ${
                      isHovered
                        ? "bg-appLayoutInverseHover/90 text-appLayoutHighlight"
                        : "bg-appBackground/60 text-appLayoutTextMuted hover:bg-appLayoutInverseHover/70 hover:text-appLayoutHighlight"
                    }
                  `}
                  style={{
                    fontSize: `${1 - (h.level - 1) * 0.08}rem`,
                    maxWidth: "180px",
                    paddingRight: `${0.75 + (h.level - 1) * 0.2}rem`,
                  }}
                  onMouseEnter={() => setHoveredIndex(originalIdx)}
                  onClick={() => handleHeadingClick(h.pos)}
                >
                  <div className="truncate">{h.text}</div>
                </button>

                {/* Show children when hovered */}
                {isHovered && (
                  <div className="flex flex-col gap-0.5 items-end">
                    {headings
                      .slice(originalIdx + 1)
                      .filter((child, cidx, arr) => {
                        if (child.level <= h.level) return false;
                        const hasBarrier = arr
                          .slice(0, cidx)
                          .some((hh) => hh.level <= h.level);
                        return !hasBarrier;
                      })
                      .map((child) => (
                        <button
                          key={child.id}
                          className="px-2 py-0.5 rounded-lg text-right text-xs
                                     bg-appBackground/70 backdrop-blur-sm
                                     text-appLayoutTextMuted
                                     hover:bg-appLayoutInverseHover/80 hover:text-appLayoutHighlight
                                     transition-all duration-150"
                          style={{ maxWidth: "160px" }}
                          onClick={() => handleHeadingClick(child.pos)}
                        >
                          <div className="truncate">{child.text}</div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
