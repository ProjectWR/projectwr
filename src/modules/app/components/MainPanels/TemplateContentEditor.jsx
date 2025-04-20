import React, { useCallback, useEffect, useRef, useState } from "react";
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

// Add this helper component (place it at the top of GroupEditor, before the return statement)
const NumberOrPercentInput = ({ value, onChange }) => {
  // Determine active type based on value suffix; default to "rem"
  const initialActive =
    typeof value === "string" && value.trim().endsWith("%") ? "%" : "rem";
  // Remove unit from value if present
  const extractNumber = (val) => String(val).replace(/(rem|%)/, "");

  const [active, setActive] = useState(initialActive);
  const [remValue, setRemValue] = useState(
    initialActive === "rem" ? extractNumber(value) : ""
  );
  const [percentValue, setPercentValue] = useState(
    initialActive === "%" ? extractNumber(value) : ""
  );

  const handleRemChange = (e) => {
    setActive("rem");
    setRemValue(e.target.value);
    onChange(e.target.value + "rem");
  };

  const handlePercentChange = (e) => {
    setActive("%");
    setPercentValue(e.target.value);
    onChange(e.target.value + "%");
  };

  return (
    <div className="flex gap-2 items-center ">
      <input
        id="rem-input"
        type="number"

        value={remValue}
        onChange={handleRemChange}
        min="0"
        onClick={() => {
          setActive("rem");
        }}
        placeholder="rem"
        className={`appearance-none text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-[6rem] px-3 pb-1 focus:outline-none transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder ${
          active !== "rem"
            ? "bg-appBackgroundAccent text-appLayoutBorder"
            : "bg-appBackground"
        }`}
      />
      <input
        id="percent-input"
        type="number"
        value={percentValue}
        onChange={handlePercentChange}
        min="0"
        max="100"
        onClick={() => {
          setActive("%");
        }}
        placeholder="%"
        className={`appearance-none text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-[6rem] px-3 pb-1 focus:outline-none transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder ${
          active !== "%"
            ? "bg-appBackgroundAccent text-appLayoutBorder"
            : "bg-appBackground"
        }`}
      />
    </div>
  );
};

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
      {Object.entries(config).map(([key, fieldConfig]) => {
        if (fieldConfig.type === "color") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="h-templateDetailsPreferenceInputHeight px-4 w-full flex gap-2 flex-row items-center">
                <label
                  htmlFor={`input-${key}`}
                  className="text-templateDetailsPanelPreferenceFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                >
                  {fieldConfig.label}
                </label>

                <div className="h-px flex-grow bg-appLayoutBorder"></div>

                <div className="w-fit h-full flex items-center justify-center shadow-inner shadow-appLayoutShadow rounded-r-lg">
                  <div className="text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-[6rem] bg-appBackground focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder">
                    <ColorPicker
                      color={data[key]}
                      onChangeComplete={(color) => handleChange(key, color)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (fieldConfig.type === "number" || fieldConfig.type === "text") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="h-templateDetailsPreferenceInputHeight px-4 w-full flex gap-2 flex-row items-center">
                <label
                  htmlFor={`input-${key}`}
                  className="px-0 text-templateDetailsPanelPreferenceFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                >
                  {fieldConfig.label}
                </label>

                <div className="h-px flex-grow bg-appLayoutBorder"></div>

                <div className="w-fit h-full">
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
            </div>
          );
        }

        // Modified branch for "numberOrPercent"
        if (fieldConfig.type === "numberOrPercent") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="h-templateDetailsPreferenceInputHeight px-4 w-full flex gap-2 flex-row items-center">
                <label
                  htmlFor={`input-${key}`}
                  className="px-0 text-templateDetailsPanelPreferenceFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                >
                  {fieldConfig.label}
                </label>

                <div className="h-px flex-grow bg-appLayoutBorder"></div>

                <div className="w-fit h-full flex items-center">
                  <NumberOrPercentInput
                    value={data[key]}
                    onChange={(val) => handleChange(key, val)}
                  />
                </div>

                {errors[key] && (
                  <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
                )}
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
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

  // // Collapsible section states.
  // const [desktopPaperOpen, setDesktopPaperOpen] = useState(false);
  // const [desktopToolbarOpen, setDesktopToolbarOpen] = useState(false);
  // const [mobilePaperOpen, setMobilePaperOpen] = useState(false);
  // const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false);

  const [groupSelected, setGroupSelected] = useState("desktopPaper");

  // Update a subgroup in template_content by calling setNewTemplate.
  const handleGroupChange = useCallback(
    (groupKey, subGroupKey, newData) => {
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
    },
    [newTemplate, setNewTemplate]
  );

  const returnGroupEditor = useCallback(() => {
    if (groupSelected === "desktopPaper") {
      return (
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
      );
    } else if (groupSelected === "desktopToolbar") {
      return (
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
      );
    } else if (groupSelected === "mobilePaper") {
      return (
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
      );
    } else if (groupSelected === "mobileToolbar") {
      return (
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
      );
    } else {
      return null;
    }
  }, [
    groupSelected,
    content.desktopDefaultPreferences.paperPreferences,
    content.desktopDefaultPreferences.toolbarPreferences,
    content.mobileDefaultPreferences.paperPreferences,
    content.mobileDefaultPreferences.toolbarPreferences,
    handleGroupChange,
  ]);

  return (
    <div id="TCEContainer" className="w-full font-sans flex flex-col relative">
      <div
        id="TCEHeader"
        className="w-full h-fit min-h-fit flex flex-col md:flex-row gap-2 mb-2 sticky top-0 z-[1]"
      >
        <div className="TCEDevice bg-appBackground flex-grow basis-0 h-fit flex flex-col items-center justify-center rounded-lg border border-appLayoutBorder">
          <div className="TCEDevice h-fit py-1 px-2 w-full flex items-center justify-start text-md text-appLayoutTextMuted">
            Desktop
          </div>
          <div className="h-fit w-full px-2">
            <div className="h-px min-h-px w-full bg-appLayoutBorder"></div>
          </div>

          <div className="TCEGroups h-fit w-full flex gap-2 px-2 py-1">
            {/* ${groupSelected === "desktopPaper" ? "" : ""} */}
            <button
              onClick={() => setGroupSelected("desktopPaper")}
              className={`TCEGroup flex-grow basis-0 flex items-center justify-center rounded-lg h-fit py-2 text-lg hover:bg-appLayoutInverseHover
              `}
            >
              <motion.span
                animate={{
                  width: groupSelected === "desktopPaper" ? "1.75rem" : 0,
                }}
                className="icon-[material-symbols-light--keyboard-arrow-right] h-[1.75rem]"
              ></motion.span>
              Paper
            </button>

            <button
              onClick={() => setGroupSelected("desktopToolbar")}
              className={`TCEGroup flex-grow basis-0 flex items-center justify-center rounded-lg h-fit py-2 text-lg hover:bg-appLayoutInverseHover
              `}
            >
              <motion.span
                animate={{
                  width: groupSelected === "desktopToolbar" ? "1.75rem" : 0,
                }}
                className="icon-[material-symbols-light--keyboard-arrow-right] h-[1.75rem]"
              ></motion.span>
              Toolbar
            </button>
          </div>
        </div>
        <div className="TCEDevice bg-appBackground flex-grow basis-0 h-fit flex flex-col items-center justify-center rounded-lg border border-appLayoutBorder">
          <div className="TCEDevice h-fit py-1 px-2 w-full flex items-center justify-start text-md text-appLayoutTextMuted">
            Mobile
          </div>
          <div className="h-fit w-full px-2">
            <div className="h-px min-h-px w-full bg-appLayoutBorder"></div>
          </div>
          <div className="TCEGroups h-fit w-full flex gap-2 px-2 py-1">
            <button
              onClick={() => setGroupSelected("mobilePaper")}
              className={`TCEGroup flex-grow basis-0 flex items-center justify-center rounded-lg h-fit py-2 text-lg hover:bg-appLayoutInverseHover
              `}
            >
              <motion.span
                animate={{
                  width: groupSelected === "mobilePaper" ? "1.75rem" : 0,
                }}
                className="icon-[material-symbols-light--keyboard-arrow-right] h-[1.75rem]"
              ></motion.span>
              Paper
            </button>

            <button
              onClick={() => setGroupSelected("mobileToolbar")}
              className={`TCEGroup flex-grow basis-0 flex items-center justify-center rounded-lg h-fit py-2 text-lg hover:bg-appLayoutInverseHover
              `}
            >
              <motion.span
                animate={{
                  width: groupSelected === "mobileToolbar" ? "1.75rem" : 0,
                }}
                className="icon-[material-symbols-light--keyboard-arrow-right] h-[1.75rem]"
              ></motion.span>
              Toolbar
            </button>
          </div>
        </div>
      </div>

      <div id="TCEBody w-full h-fit mt-1 z-[0]">
        <AnimatePresence mode="wait">
          <motion.div
            key={groupSelected}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-0"
          >
            {returnGroupEditor()}
          </motion.div>
        </AnimatePresence>
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
