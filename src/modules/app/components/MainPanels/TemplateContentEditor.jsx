import React, { useEffect, useRef, useState } from "react";
import { ChromePicker, SketchPicker } from "react-color";
import useOuterClick from "../../../design-system/useOuterClick";
import { AnimatePresence, motion } from "framer-motion";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";

// ─── CONFIG OBJECTS FOR EACH GROUP ───────────────────────────────
const desktopPaperConfig = {
  width: { type: "numberOrPercent", label: "Width" },
  gapTop: { type: "number", label: "Gap Top" },
  paddingTop: { type: "number", label: "Padding Top" },
  paddingLeft: { type: "number", label: "Padding Left" },
  paddingRight: { type: "number", label: "Padding Right" },
  paddingBottom: { type: "number", label: "Padding Bottom" },
  font: { type: "text", label: "Font" },
  fontSize: { type: "number", label: "Font Size" },
  lineHeight: { type: "number", label: "Line Height" },
  marginBottom: { type: "number", label: "Margin Bottom" },
  backgroundColor: { type: "color", label: "Background Color" },
  paperBorderWidth: { type: "number", label: "Paper Border Width" },
  paperColor: { type: "color", label: "Paper Color" },
  paperBorderColor: { type: "color", label: "Paper Border Color" },
  roundRadius: { type: "number", label: "Round Radius" },
  paperShadow: { type: "text", label: "Paper Shadow" },
  paperShadowColor: { type: "color", label: "Paper Shadow Color" },
  h1FontSize: { type: "number", label: "Title Font Size" },
  h1LineHeight: { type: "number", label: "Title Line Height" },
  h1MarginBottom: { type: "number", label: "Title Margin Bottom" },
  h2FontSize: { type: "number", label: "Heading 1 Font Size" },
  h2LineHeight: { type: "number", label: "Heading 1 Line Height" },
  h2MarginBottom: { type: "number", label: "Heading 1 Margin Bottom" },
  h3FontSize: { type: "number", label: "Heading 2 Font Size" },
  h3LineHeight: { type: "number", label: "Heading 2 Line Height" },
  h3MarginBottom: { type: "number", label: "Heading 2 Margin Bottom" },
  h4FontSize: { type: "number", label: "Heading 3 Font Size" },
  h4LineHeight: { type: "number", label: "Heading 3 Line Height" },
  h4MarginBottom: { type: "number", label: "Heading 3 Margin Bottom" },
  h5FontSize: { type: "number", label: "Heading 4 Font Size" },
  h5LineHeight: { type: "number", label: "Heading 4 Line Height" },
  h5MarginBottom: { type: "number", label: "Heading 4 Margin Bottom" },
  listPaddingLeft: { type: "number", label: "List Padding Left" },
  listMarginTop: { type: "number", label: "List Margin Top" },
  listMarginBottom: { type: "number", label: "List Margin Bottom" },
  hrMarginTop: { type: "number", label: "HR Margin Top" },
  hrMarginBottom: { type: "number", label: "HR Margin Bottom" },
  hrBorderColor: { type: "color", label: "HR Border Color" },
};

const desktopToolbarConfig = {
  toolbarHeight: { type: "number", label: "Toolbar Height" },
  toolbarButtonHeight: { type: "number", label: "Toolbar Button Height" },
  marginTop: { type: "number", label: "Margin Top" },
  marginBottom: { type: "number", label: "Margin Bottom" },
  marginLeft: { type: "number", label: "Margin Left" },
  marginRight: { type: "number", label: "Margin Right" },
  buttonHeight: { type: "number", label: "Button Height" },
  buttonWidth: { type: "number", label: "Button Width" },
  backgroundColor: { type: "color", label: "Background Color" },
  buttonColor: { type: "color", label: "Button Color" },
  dividerColor: { type: "color", label: "Divider Color" },
  hoverColor: { type: "color", label: "Hover Color" },
};

const mobilePaperConfig = { ...desktopPaperConfig };
const mobileToolbarConfig = { ...desktopToolbarConfig };

// ─── GROUP EDITOR ───────────────────────────────────────────────
// Renders a series of input fields (or a ChromePicker for color fields)
// with a floating label and inline error display.
function GroupEditor({ config, data, onChange }) {
  const [errors, setErrors] = useState({});

  const validateField = (key, value, fieldConfig) => {
    let error = "";
    if (fieldConfig.type === "number") {
      if (value === "" || isNaN(Number(value))) {
        error = "Must be a valid number";
      }
    }
    if (fieldConfig.type === "color") {
      const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
      if (!hexRegex.test(value)) {
        error = "Invalid hex color";
      }
    }
    return error;
  };

  const handleChange = (key, value) => {
    const fieldError = validateField(key, value, config[key]);
    setErrors((prev) => ({ ...prev, [key]: fieldError }));
    onChange({ ...data, [key]: value });
  };

  return (
    <>
      {Object.entries(config).map(([key, fieldConfig]) => (
        <div key={key} className="flex items-center justify-center">
          {fieldConfig.type === "color" ? (
            <div className="mt-4 h-templateDetailsPreferenceInputHeight w-fit flex gap-2 flex-row items-center">
              <label
                htmlFor={`input-${key}`}
                className="px-3 text-templateDetailsPanelPreferenceFontSize w-templateDetailsPreferenceLabelWidth min-w-templateDetailsPreferenceLabelWidth text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
              >
                {fieldConfig.label}
              </label>

              <div className="w-px h-full bg-appLayoutBorder"></div>

              <div className="flex-grow h-full flex items-center justify-center shadow-inner shadow-appLayoutShadow rounded-r-lg">
                <div className="text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-[6rem] bg-appBackground focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder">
                  <ColorPicker
                    color={data[key]}
                    onChangeComplete={(color) => handleChange(key, color)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 h-templateDetailsPreferenceInputHeight w-fit flex gap-2 flex-row items-center">
              <label
                htmlFor={`input-${key}`}
                className="px-3 text-templateDetailsPanelPreferenceFontSize w-templateDetailsPreferenceLabelWidth min-w-templateDetailsPreferenceLabelWidth text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
              >
                {fieldConfig.label}
              </label>

              <div className="w-px min-w-px h-full bg-appLayoutBorder"></div>

              <div className="flex-grow h-full">
                <input
                  id={`input-${key}`}
                  type={fieldConfig.type === "number" ? "number" : "text"}
                  value={data[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-[6rem] bg-appBackground px-3 pb-1 focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder"
                />
              </div>

              {errors[key] && (
                <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────
// A clickable header that toggles a section open or closed.
function SectionHeader({ title, isOpen, toggle }) {
  return (
    <button
      className="w-full flex items-center px-2 py-1 justify-between cursor-pointer border-b border-appLayoutBorder"
      onClick={toggle}
    >
      <span className="text-lg">{title}</span>
      <motion.span
        animate={{ rotate: isOpen ? -90 : 90 }}
        className="icon-[material-symbols-light--keyboard-arrow-right] w-[2.2rem] h-[2.2rem]"
      ></motion.span>
    </button>
  );
}

// ─── TEMPLATE CONTENT EDITOR ───────────────────────────────────────────────
/**
 * TemplateContentEditor
 *
 * Props:
 * - newTemplate: the full template object (includes template_content)
 * - setNewTemplate: function to update the template object
 * - handleSave: callback to be called when saving changes
 */
const TemplateContentEditor = ({ newTemplate, setNewTemplate, handleSave }) => {
  // For convenience, work directly with the nested template_content.
  const content = newTemplate.template_content;

  // Collapsible section states.
  const [desktopPaperOpen, setDesktopPaperOpen] = useState(false);
  const [desktopToolbarOpen, setDesktopToolbarOpen] = useState(false);
  const [mobilePaperOpen, setMobilePaperOpen] = useState(false);
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false);

  // Update a subgroup in template_content by calling setNewTemplate.
  const handleGroupChange = (groupKey, subGroupKey, newData) => {
    console.log("new Template", newTemplate);
    setNewTemplate((prev) => ({
      ...prev,
      template_content: {
        ...prev.template_content,
        [groupKey]: {
          ...prev.template_content[groupKey],
          [subGroupKey]: newData,
        },
      },
    }));
  };

  return (
    <div>
      {/* Desktop Preferences */}
      <h2 className="text-2xl mb-4 px-2">Desktop Preferences</h2>
      <div className="mb-8 space-y-4">
        {/* Desktop Paper Preferences */}
        <SectionHeader
          title="Paper Preferences"
          isOpen={desktopPaperOpen}
          toggle={() => setDesktopPaperOpen((prev) => !prev)}
        />
        {desktopPaperOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2">
            <GroupEditor
              config={desktopPaperConfig}
              data={content.desktopDefaultPreferences.paperPreferences}
              onChange={(newData) =>
                handleGroupChange(
                  "desktopDefaultPreferences",
                  "paperPreferences",
                  newData
                )
              }
            />
          </div>
        )}

        {/* Desktop Toolbar Preferences */}
        <SectionHeader
          title="Toolbar Preferences"
          isOpen={desktopToolbarOpen}
          toggle={() => setDesktopToolbarOpen((prev) => !prev)}
        />
        {desktopToolbarOpen && (
          <div className="mt-2">
            <GroupEditor
              config={desktopToolbarConfig}
              data={content.desktopDefaultPreferences.toolbarPreferences}
              onChange={(newData) =>
                handleGroupChange(
                  "desktopDefaultPreferences",
                  "toolbarPreferences",
                  newData
                )
              }
            />
          </div>
        )}
      </div>

      {/* Mobile Preferences */}
      <h2 className="text-2xl mb-4 px-2">Mobile Preferences</h2>
      <div className="mb-8 space-y-4">
        {/* Mobile Paper Preferences */}
        <SectionHeader
          title="Paper Preferences"
          isOpen={mobilePaperOpen}
          toggle={() => setMobilePaperOpen((prev) => !prev)}
        />
        {mobilePaperOpen && (
          <div className="mt-2">
            <GroupEditor
              config={mobilePaperConfig}
              data={content.mobileDefaultPreferences.paperPreferences}
              onChange={(newData) =>
                handleGroupChange(
                  "mobileDefaultPreferences",
                  "paperPreferences",
                  newData
                )
              }
            />
          </div>
        )}

        {/* Mobile Toolbar Preferences */}
        <SectionHeader
          title="Toolbar Preferences"
          isOpen={mobileToolbarOpen}
          toggle={() => setMobileToolbarOpen((prev) => !prev)}
        />
        {mobileToolbarOpen && (
          <div className="mt-2">
            <GroupEditor
              config={mobileToolbarConfig}
              data={content.mobileDefaultPreferences.toolbarPreferences}
              onChange={(newData) =>
                handleGroupChange(
                  "mobileDefaultPreferences",
                  "toolbarPreferences",
                  newData
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateContentEditor;

const ColorPicker = ({ color, onChangeComplete }) => {
  const { deviceType } = useDeviceType();

  const [currentColor, setCurrentColor] = useState(color);
  const [isOpened, setIsOpened] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const headerRef = useRef(null);
  const dropdownRef = useRef(null);
  const innerRef = useOuterClick(() => {
    setIsOpened(false);
  });

  useEffect(() => {
    if (isOpened && headerRef.current && dropdownRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const dropdownWidth = dropdownRef.current.offsetWidth;
      const viewportHeight = window.innerHeight;

      console.log(
        "Header rect: ",
        headerRect.top,
        headerRect.bottom,
        headerRect.left,
        headerRect.right
      );

      let top = headerRef.current.offsetHeight;
      let left = 0;

      setDropdownPosition({ top: top, left: left });
    }
  }, [isOpened]);

  return (
    <div className="relative flex-grow h-full rounded-lg" ref={innerRef}>
      <div ref={headerRef} className="w-full h-full rounded-lg">
        <button
          className="w-full h-full rounded-lg"
          onClick={() => setIsOpened(!isOpened)}
          style={{ backgroundColor: `${currentColor}` }}
        ></button>
      </div>

      <AnimatePresence>
        {isOpened && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.1 }}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            className="absolute z-[99] bg-appBackground text-appLayoutText rounded-lg shadow-md h-fit w-fit"
          >
            <SketchPicker
              className="bg-appBackground text-appLayoutText"
              color={currentColor}
              onChange={(color) => {
                setCurrentColor(color);
              }}
              onChangeComplete={(color) => {
                setCurrentColor(color.hex);
                onChangeComplete(color.hex);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
