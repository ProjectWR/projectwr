import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChromePicker, SketchPicker } from "react-color";
import useOuterClick from "../../../design-system/useOuterClick";
import { AnimatePresence, motion } from "framer-motion";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import {
  desktopPaperConfig,
  desktopToolbarConfig,
  mobilePaperConfig,
  mobileToolbarConfig,
} from "./Templates/configs";

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
    <div className="h-full flex gap-2 items-center ">
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
        className={`appearance-none text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-[4rem] px-3 pb-1 focus:outline-none transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder ${
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
        className={`appearance-none text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-templateDetailsPreferenceInputWidth px-3 pb-1 focus:outline-none transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder ${
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
function GroupEditor({ config, data, onChange, setGroupValid }) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("ENTRIES ERRORS: ", Object.values(errors));
    if (Object.values(errors).join("").length === 0) {
      console.log("GROUP IS TRUE", config);
      setGroupValid(true);
    } else {
      console.log("GROUP IS TRUE", config);

      setGroupValid(false);
    }
  }, [errors, setGroupValid, config]);

  const validateField = (key, value, fieldConfig) => {
    let error = "";
    if (fieldConfig.type === "numberOrPercent") {
      const numberValue = String(value).replace(/(rem|%)/, "");
      if (!value || numberValue <= 0) {
        error = "Must be a valid number";
      }
    }

    if (fieldConfig.type === "number") {
      if (value === "" || isNaN(Number(value)) || Number(value) <= 0) {
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

                <div className="h-px grow bg-appLayoutBorder"></div>

                <div className="w-fit h-full flex items-center justify-center shadow-inner shadow-appLayoutShadow rounded-r-lg">
                  <div className="text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-templateDetailsPreferenceInputWidth bg-appBackground focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder">
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

                <div className="h-px grow bg-appLayoutBorder"></div>

                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ width: 0 }}
                      animate={{ width: "fit-content" }}
                      exit={{ width: 0 }}
                      className="text-red-500 pb-1 text-sm mt-1 text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="w-fit h-full">
                  <input
                    id={`input-${key}`}
                    type={fieldConfig.type === "number" ? "number" : "text"}
                    value={data[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="text-templateDetailsPanelPreferenceInputFontSize h-full mr-auto w-templateDetailsPreferenceInputWidth bg-appBackground px-3 pb-1 focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder"
                  />
                </div>
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

                <div className="h-px grow bg-appLayoutBorder"></div>
                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ width: 0 }}
                      animate={{ width: "fit-content" }}
                      exit={{ width: 0 }}
                      className="text-red-500 pb-1 text-sm mt-1 text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="w-fit h-full flex items-center">
                  <NumberOrPercentInput
                    value={data[key]}
                    onChange={(val) => handleChange(key, val)}
                  />
                </div>
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
const TemplateContentEditor = ({
  newTemplate,
  setNewTemplate,
  setTemplateValid,
}) => {
  // For convenience, work directly with the nested template_content.
  const content = newTemplate.template_content;

  const [groupSelected, setGroupSelected] = useState("desktopPaper");

  const [desktopPaperValid, setDesktopPaperValid] = useState(true);
  const [desktopToolbarValid, setDesktopToolbarValid] = useState(true);

  const [mobilePaperValid, setMobilePaperValid] = useState(true);
  const [mobileToolbarValid, setMobileToolbarValid] = useState(true);

  useEffect(() => {
    console.log(
      "VALIDS: ",
      desktopPaperValid,
      desktopToolbarValid,
      mobilePaperValid,
      mobileToolbarValid
    );
    if (
      desktopPaperValid &&
      desktopToolbarValid &&
      mobilePaperValid &&
      mobileToolbarValid
    ) {
      setTemplateValid(true);
    } else {
      setTemplateValid(false);
    }
  }, [
    newTemplate,
    setTemplateValid,
    desktopPaperValid,
    desktopToolbarValid,
    mobilePaperValid,
    mobileToolbarValid,
  ]);

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
          setGroupValid={setDesktopPaperValid}
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
          setGroupValid={setDesktopToolbarValid}
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
          setGroupValid={setMobilePaperValid}
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
          setGroupValid={setMobileToolbarValid}
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
        className="w-full h-fit min-h-fit flex flex-col md:flex-row gap-2 mb-2 sticky top-0 z-1"
      >
        <div className="TCEDevice bg-transparent backdrop-blur-xl shadow-md shadow-appLayoutGentleShadow grow basis-0 h-fit flex flex-col items-center justify-center rounded-lg border border-appLayoutBorder">
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
              className={`TCEGroup grow basis-0 flex items-center justify-center rounded-lg h-fit py-2 text-lg hover:bg-appLayoutInverseHover
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
              className={`TCEGroup grow basis-0 flex items-center justify-center rounded-lg h-fit py-2 text-lg hover:bg-appLayoutInverseHover
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
        <div className="TCEDevice bg-transparent backdrop-blur-xl shadow-md shadow-appLayoutGentleShadow grow basis-0 h-fit flex flex-col items-center justify-center rounded-lg border border-appLayoutBorder">
          <div className="TCEDevice h-fit py-1 px-2 w-full flex items-center justify-start text-md text-appLayoutTextMuted">
            Mobile
          </div>
          <div className="h-fit w-full px-2">
            <div className="h-px min-h-px w-full bg-appLayoutBorder"></div>
          </div>
          <div className="TCEGroups h-fit w-full flex gap-2 px-2 py-1">
            <button
              onClick={() => setGroupSelected("mobilePaper")}
              className={`TCEGroup grow basis-0 flex items-center justify-center rounded-lg h-fit py-2 text-lg hover:bg-appLayoutInverseHover
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
              className={`TCEGroup grow basis-0 flex items-center justify-center rounded-lg h-fit py-2 text-lg hover:bg-appLayoutInverseHover
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

      <div id="TCEBody w-full h-fit mt-1 z-0">
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
    <div className="relative grow h-full rounded-lg" ref={innerRef}>
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
            className="absolute z-99 bg-appBackground text-appLayoutText rounded-lg shadow-md h-fit w-fit"
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
