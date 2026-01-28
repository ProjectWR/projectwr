import React, { useCallback, useEffect, useRef, useState } from "react";
import useOuterClick from "../../../design-system/useOuterClick";
import { AnimatePresence, motion } from "motion/react";
import {
  appThemeConfig,
  appThemeCategoryNames,
} from "./Templates/appThemeConfig";
import { Portal } from "radix-ui";
import { ScrollArea } from "@mantine/core";
import { Sketch } from "@uiw/react-color";

// --- HexaColorPicker Component ---

const AppThemeColorPicker = ({ color, onChangeComplete }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const headerRef = useRef(null);
  const dropdownRef = useRef(null);

  const innerRef = useOuterClick((e) => {
    if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
    setIsOpened(false);
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && isOpened) {
        setIsOpened(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpened]);

  const updatePosition = useCallback(() => {
    if (!isOpened || !headerRef.current) return;
    const headerRect = headerRef.current.getBoundingClientRect();
    const dropdownHeight = 320;
    const dropdownWidth = 230;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = headerRect.bottom + 8;
    let left = headerRect.left;

    if (top + dropdownHeight > viewportHeight)
      top = headerRect.top - dropdownHeight - 8;
    if (left + dropdownWidth > viewportWidth)
      left = headerRect.right - dropdownWidth;
    if (top < 8) top = 8;
    if (top + dropdownHeight > viewportHeight)
      top = viewportHeight - dropdownHeight - 8;
    if (left < 8) left = 8;

    setDropdownPosition({ top, left });
  }, [isOpened]);

  useEffect(() => {
    if (isOpened) {
      const timeoutId = setTimeout(updatePosition, 0);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [isOpened, updatePosition]);

  return (
    <div className="relative grow h-full rounded-lg" ref={innerRef}>
      <div ref={headerRef} className="w-full h-full rounded-lg">
        <button
          className="w-full h-full rounded-lg border border-appLayoutBorder/50 hover:border-appLayoutBorder transition-colors duration-150"
          onClick={() => setIsOpened(!isOpened)}
          style={{ backgroundColor: color }}
          aria-label="Select color"
        ></button>
      </div>

      <AnimatePresence>
        {isOpened && (
          <Portal.Root>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
              className="z-2000 bg-appBackground text-appLayoutText rounded-lg shadow-lg border border-appLayoutBorder/50"
            >
              <Sketch
                color={color}
                onChange={(c) => onChangeComplete(c.hexa)}
              />
            </motion.div>
          </Portal.Root>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- CategorySection Component ---

const CategorySection = ({ title, children }) => {
  return (
    <div className="flex h-fit w-full border-b border-appLayoutBorder/50 last:border-0">
      <div className="flex items-start justify-end w-[35%] py-4 pr-6 transition-colors duration-200 group">
        <span className="text-libraryDirectoryBookNodeFontSize font-semibold text-appLayoutTextMuted group-hover:text-appLayoutText tracking-wider text-right">
          {title}
        </span>
      </div>

      <div className="py-3 w-[65%] h-fit flex flex-col gap-2">{children}</div>
    </div>
  );
};

// --- AppThemeContentEditor Component ---

const AppThemeContentEditor = ({ newTheme, setNewTheme, setThemeValid }) => {
  const handleChange = (key, value) => {
    setNewTheme({ ...newTheme, [key]: value });
  };

  const fieldsByCategory = React.useMemo(() => {
    const categories = {};
    Object.entries(appThemeConfig).forEach(([key, fieldConfig]) => {
      const category = fieldConfig.category || "other";
      if (!categories[category]) categories[category] = {};
      categories[category][key] = fieldConfig;
    });
    return categories;
  }, []);

  return (
    <div
      id="ATCEContainer"
      className="w-full h-full p-2 flex flex-col items-center justify-center transition-all duration-300"
    >
      <ScrollArea
        overscrollBehavior="none"
        scrollbars="y"
        type="hover"
        classNames={{
          root: "w-detailsPanelWidth h-full max-h-full p-0 border border-appLayoutBorder rounded-lg shadow-sm shadow-appLayoutGentleShadow",
          scrollbar:
            "bg-transparent hover:bg-transparent p-0 w-scrollbarWidth opacity-70",
          thumb:
            "bg-appLayoutBorder rounded-l-full hover:bg-appLayoutInverseHover! z-[50]",
          content:
            "h-full max-h-full w-full flex flex-col items-center pt-0 justify-start",
        }}
      >
        <div className="flex flex-col w-full pb-10">
          {Object.entries(fieldsByCategory).map(
            ([category, categoryFields]) => (
              <CategorySection
                key={category}
                title={appThemeCategoryNames[category] || category}
              >
                <div className="flex w-full flex-col gap-2">
                  {Object.entries(categoryFields).map(([key, fieldConfig]) => (
                    <div key={key} className="px-4 w-full flex flex-col gap-1">
                      <div className="h-templateDetailsPreferenceInputHeight flex gap-2 flex-row items-center">
                        <div className="w-templateDetailsPreferenceInputWidth h-full flex items-center justify-center bg-appBackground rounded-lg">
                          <AppThemeColorPicker
                            color={newTheme[key]}
                            onChangeComplete={(val) => handleChange(key, val)}
                          />
                        </div>
                        <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
                          {fieldConfig.label}
                        </label>
                      </div>
                      <div className="text-xs text-appLayoutTextMuted pl-2">
                        {newTheme[key] || "No color set"}
                      </div>
                    </div>
                  ))}
                </div>
              </CategorySection>
            ),
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AppThemeContentEditor;
