import React, { useCallback, useEffect, useRef, useState } from "react";
import useOuterClick from "../../../design-system/useOuterClick";
import { AnimatePresence, motion } from "framer-motion";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import {
  desktopPaperConfig,
  desktopToolbarConfig,
  mobilePaperConfig,
  mobileToolbarConfig,
} from "./Templates/configs";
import { DropdownMenu } from "radix-ui";
import { useFonts } from "../../hooks/useFonts";
import { useImages } from "../../hooks/useImages";
import { ScrollArea } from "@mantine/core";
import TipTapEditor from "../../../editor/TIpTapEditor/TipTapEditor";
import { Sketch } from "@uiw/react-color";
import fontManager from "../../lib/font";
import imageManager from "../../lib/image";
import FourSidedValueModal from "./Templates/FourSidedValueModal";

const FontInput = ({ value, onChange }) => {
  const fonts = useFonts();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <button
          style={{ fontFamily: value }}
          className="w-templateDetailsPreferenceInputWidth border-appLayoutBorder border py-1 rounded-lg text-libraryDirectoryBookNodeFontSize text-nowrap overflow-x-hidden overflow-ellipsis text-appLayoutTextMuted hover:text-appLayoutText"
        >
          {value || "Select Font"}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        style={{ opacity: 1 }}
        className="contextMenuContent z-[1100] max-h-detailsPanelDescriptionInputHeight overflow-y-auto"
        align="start"
      >
        {fonts.map((font, index) => (
          <DropdownMenu.Item
            key={`${font.family}-${index}`}
            className="contextMenuItem"
            onClick={() => onChange(font.family)}
          >
            <span className="" style={{ fontFamily: font.family }}>
              {font.family}
            </span>
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Arial, Helvetica, sans-serif")}
        >
          <span style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            Arial
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Arial Black, Gadget, sans-serif")}
        >
          <span style={{ fontFamily: "Arial Black, Gadget, sans-serif" }}>
            Arial Black
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Comic Sans MS, cursive")}
        >
          <span style={{ fontFamily: "Comic Sans MS, cursive" }}>
            Comic Sans MS
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Courier New, monospace")}
        >
          <span style={{ fontFamily: "Courier New, monospace" }}>
            Courier New
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Georgia, serif")}
        >
          <span style={{ fontFamily: "Georgia, serif" }}>Georgia</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Impact, Charcoal, sans-serif")}
        >
          <span style={{ fontFamily: "Impact, Charcoal, sans-serif" }}>
            Impact
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Lucida Console, Monaco, monospace")}
        >
          <span style={{ fontFamily: "Lucida Console, Monaco, monospace" }}>
            Lucida Console
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() =>
            onChange("Lucida Sans Unicode, Lucida Grande, sans-serif")
          }
        >
          <span
            style={{
              fontFamily: "Lucida Sans Unicode, Lucida Grande, sans-serif",
            }}
          >
            Lucida Sans Unicode
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() =>
            onChange("Palatino Linotype, Book Antiqua, Palatino, serif")
          }
        >
          <span
            style={{
              fontFamily: "Palatino Linotype, Book Antiqua, Palatino, serif",
            }}
          >
            Palatino Linotype
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Tahoma, Geneva, sans-serif")}
        >
          <span style={{ fontFamily: "Tahoma, Geneva, sans-serif" }}>
            Tahoma
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Times New Roman, Times, serif")}
        >
          <span style={{ fontFamily: "Times New Roman, Times, serif" }}>
            Times New Roman
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Trebuchet MS, Helvetica, sans-serif")}
        >
          <span style={{ fontFamily: "Trebuchet MS, Helvetica, sans-serif" }}>
            Trebuchet MS
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange("Verdana, Geneva, sans-serif")}
        >
          <span style={{ fontFamily: "Verdana, Geneva, sans-serif" }}>
            Verdana
          </span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => fontManager.addFont()}
        >
          <span>Add Font</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

const ImageInput = ({ value, onChange }) => {
  const images = useImages();

  // Resolve the value to a URL if it's an ID
  const displayUrl = React.useMemo(() => {
    if (!value) return null;

    // If value is already a URL (blob: or http:), use it directly (backward compatibility)
    if (
      typeof value === "string" &&
      (value.startsWith("blob:") || value.startsWith("http"))
    ) {
      return value;
    }

    // Otherwise, treat it as an ID and resolve to URL
    return imageManager.getImageUrl(value);
  }, [value]); // Re-resolve when value changes

  // Find the image name for display
  const imageName = React.useMemo(() => {
    if (!value) return null;

    const image = images.find((img) => img.id === value || img.url === value);
    return image ? image.name : "Selected Image";
  }, [value, images]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <button className="w-templateDetailsPreferenceInputWidth border border-appLayoutBorder py-1 rounded-lg text-libraryDirectoryBookNodeFontSize text-nowrap overflow-x-hidden overflow-ellipsis text-appLayoutTextMuted hover:text-appLayoutText">
          {displayUrl ? (
            <div className="flex items-center gap-2">
              <img
                src={displayUrl}
                alt="Selected"
                className="w-4 h-4 object-cover rounded"
              />
              <span>{imageName}</span>
            </div>
          ) : (
            "Select"
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        style={{ opacity: 1 }}
        className="contextMenuContent z-[1100] max-h-60 overflow-y-scroll"
        align="start"
      >
        {images.map((image, index) => (
          <DropdownMenu.Item
            key={`${image.id}-${index}`}
            className="contextMenuItem"
            onClick={() => onChange(image.id)} // Store ID instead of URL
          >
            <div className="flex items-center gap-2">
              <img
                src={image.url}
                alt={image.name}
                className="w-6 h-6 object-cover rounded"
              />
              <span>{image.name}</span>
            </div>
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => onChange(null)}
        >
          <span>Clear Image</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="contextMenuItem"
          onClick={() => imageManager.addImage()}
        >
          <span>Add Image</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

const SelectInput = ({ value, onChange, options }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <button className="w-templateDetailsPreferenceInputWidth border border-appLayoutBorder py-1 rounded-lg text-libraryDirectoryBookNodeFontSize text-nowrap overflow-x-hidden overflow-ellipsis text-appLayoutTextMuted hover:text-appLayoutText">
          {value || "Select Option"}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        style={{ opacity: 1 }}
        className="contextMenuContent z-[1100] max-h-60 overflow-y-scroll"
        align="start"
      >
        {options.map((option, index) => (
          <DropdownMenu.Item
            key={`${option}-${index}`}
            className="contextMenuItem"
            onClick={() => onChange(option)}
          >
            <span>{option}</span>
          </DropdownMenu.Item>
        ))}
        {options.length === 0 && (
          <DropdownMenu.Item className="contextMenuItem" disabled>
            <span>No options available</span>
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

// Generic input for 4-sided values (slice, width, outset)
const FourSidedValueInput = ({
  value,
  onChange,
  borderImageSource,
  label,
  description,
  showFill,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-libraryDirectoryBookNodeFontSize h-full mr-auto w-templateDetailsPreferenceInputWidth bg-appBackground px-3 focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder hover:border-appLayoutHighlight"
      >
        {value || "Edit Values"}
      </button>

      <FourSidedValueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={value}
        onChange={onChange}
        borderImageSource={borderImageSource}
        title={`Edit ${label}`}
        description={description}
        showFill={showFill}
      />
    </>
  );
};

// Add this helper component (place it at the top of GroupEditor, before the return statement)
const NumberOrPercentInput = ({ value, onChange, fieldConfig }) => {
  const initialUnit =
    typeof value === "string" && value.trim().endsWith("%") ? "%" : "px";
  const extractNumber = (val) => String(val).replace(/(px|%)/, "");

  const [unit, setUnit] = useState(initialUnit);
  const [numberValue, setNumberValue] = useState(extractNumber(value));

  const min = unit === "%" ? 10 : fieldConfig.min;
  const max = unit === "%" ? 100 : fieldConfig.max;

  const handleNumberChange = (e) => {
    setNumberValue(e.target.value);
    onChange(e.target.value + unit);
  };

  const toggleUnit = () => {
    const newUnit = unit === "px" ? "%" : "px";
    setUnit(newUnit);
    onChange(numberValue + newUnit);
  };

  return (
    <div className="h-full flex gap-2 items-center">
      <input
        type="number"
        value={numberValue}
        onChange={handleNumberChange}
        min={min}
        max={max}
        className="text-libraryDirectoryBookNodeFontSize h-full mr-auto w-templateDetailsPreferenceInputWidth bg-appBackground px-3 focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder"
      />
      <button
        onClick={toggleUnit}
        className="text-libraryDirectoryBookNodeFontSize h-full px-2 bg-appBackground border border-appLayoutBorder rounded-lg hover:bg-appLayoutHover"
      >
        {unit}
      </button>
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
      const numberValue = parseFloat(String(value).replace(/(px|%)/, ""));
      const isPercent = String(value).trim().endsWith("%");
      if (isPercent) {
        if (isNaN(numberValue) || numberValue < 10 || numberValue > 100) {
          error = `Must be between 10% and 100%`;
        }
      } else {
        if (
          isNaN(numberValue) ||
          numberValue < fieldConfig.min ||
          numberValue > fieldConfig.max
        ) {
          error = `Must be between ${fieldConfig.min} and ${fieldConfig.max}`;
        }
      }
    }

    if (fieldConfig.type === "number") {
      if (
        value === "" ||
        isNaN(Number(value)) ||
        Number(value) < fieldConfig.min ||
        Number(value) > fieldConfig.max
      ) {
        error = `Must be between ${fieldConfig.min} and ${fieldConfig.max}`;
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
              <div className="px-4 w-full flex flex-col gap-1">
                <div className="h-templateDetailsPreferenceInputHeight flex gap-2 flex-row items-center">
                  <div className="w-fit bg-appBackground h-full flex items-center justify-center shadow-inner shadow-appLayoutShadow rounded-lg">
                    <div className="text-libraryDirectoryBookNodeFontSize  h-full mr-auto w-templateDetailsPreferenceInputWidth bg-appBackground focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder">
                      <ColorPicker
                        color={data[key]}
                        onChangeComplete={(color) => handleChange(key, color)}
                      />
                    </div>
                  </div>
                  <label
                    htmlFor={`input-${key}`}
                    className="text-libraryDirectoryBookNodeFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                  >
                    {fieldConfig.label}
                  </label>
                </div>
                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        }

        if (fieldConfig.type === "number" || fieldConfig.type === "text") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="px-4 w-full flex flex-col gap-1">
                <div className="h-templateDetailsPreferenceInputHeight flex flex-row items-center">
                  <div className="w-fit h-full">
                    <input
                      id={`input-${key}`}
                      type={fieldConfig.type === "number" ? "number" : "text"}
                      value={data[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      min={
                        fieldConfig.type === "number"
                          ? fieldConfig.min
                          : undefined
                      }
                      max={
                        fieldConfig.type === "number"
                          ? fieldConfig.max
                          : undefined
                      }
                      className="text-libraryDirectoryBookNodeFontSize h-full mr-auto w-templateDetailsPreferenceInputWidth bg-appBackground px-3 focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 flex items-center justify-start rounded-lg border border-appLayoutBorder"
                    />
                  </div>

                  <span className="text-libraryDirectoryBookNodeFontSize h-full ml-1 text-appLayoutTextMuted flex items-center bg-appBackground  rounded-lg">
                    px
                  </span>
                  <label
                    htmlFor={`input-${key}`}
                    className="px-0 text-libraryDirectoryBookNodeFontSize ml-2 w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                  >
                    {fieldConfig.label}
                  </label>
                </div>
                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        }

        // Modified branch for "numberOrPercent"
        if (fieldConfig.type === "numberOrPercent") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="px-4 w-full flex flex-col gap-1">
                <div className="h-templateDetailsPreferenceInputHeight flex gap-2 flex-row items-center">
                  <div className="w-fit h-full flex items-center">
                    <NumberOrPercentInput
                      value={data[key]}
                      onChange={(val) => handleChange(key, val)}
                      fieldConfig={fieldConfig}
                    />
                  </div>

                  <label
                    htmlFor={`input-${key}`}
                    className="px-0 text-libraryDirectoryBookNodeFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                  >
                    {fieldConfig.label}
                  </label>
                </div>
                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        }

        if (fieldConfig.type === "font") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="px-4 w-full flex flex-col gap-1">
                <div className="h-templateDetailsPreferenceInputHeight flex gap-2 flex-row items-center">
                  <div className="w-fit h-full flex items-center">
                    <FontInput
                      value={data[key]}
                      onChange={(val) => handleChange(key, val)}
                    />
                  </div>

                  <label
                    htmlFor={`input-${key}`}
                    className="px-0 text-libraryDirectoryBookNodeFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                  >
                    {fieldConfig.label}
                  </label>
                </div>
                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        }

        if (fieldConfig.type === "image") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="px-4 w-full flex flex-col gap-1">
                <div className="h-templateDetailsPreferenceInputHeight flex gap-2 flex-row items-center">
                  <div className="w-fit h-full flex items-center">
                    <ImageInput
                      value={data[key]}
                      onChange={(val) => handleChange(key, val)}
                    />
                  </div>

                  <label
                    htmlFor={`input-${key}`}
                    className="px-0 text-libraryDirectoryBookNodeFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                  >
                    {fieldConfig.label}
                  </label>
                </div>
                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        }

        if (fieldConfig.type === "fourSidedValue") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="px-4 w-full flex flex-col gap-1">
                <div className="h-templateDetailsPreferenceInputHeight flex gap-2 flex-row items-center">
                  <div className="w-fit h-full flex items-center">
                    <FourSidedValueInput
                      value={data[key]}
                      onChange={(val) => handleChange(key, val)}
                      borderImageSource={data.borderImageSource}
                      label={fieldConfig.label}
                      description={fieldConfig.description}
                      showFill={fieldConfig.showFill}
                    />
                  </div>

                  <label
                    htmlFor={`input-${key}`}
                    className="px-0 text-libraryDirectoryBookNodeFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                  >
                    {fieldConfig.label}
                  </label>
                </div>
                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        }

        if (fieldConfig.type === "select") {
          return (
            <div key={key} className="flex items-center justify-center">
              <div className="px-4 w-full flex flex-col gap-1">
                <div className="h-templateDetailsPreferenceInputHeight flex gap-2 flex-row items-center">
                  <div className="w-fit h-full flex items-center">
                    <SelectInput
                      value={data[key]}
                      onChange={(val) => handleChange(key, val)}
                      options={fieldConfig.options || []}
                    />
                  </div>

                  <label
                    htmlFor={`input-${key}`}
                    className="px-0 text-libraryDirectoryBookNodeFontSize w-fit min-w-fit text-appLayoutText h-fit pointer-events-none flex items-center justify-start"
                  >
                    {fieldConfig.label}
                  </label>
                </div>
                <AnimatePresence>
                  {errors[key] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-nowrap overflow-hidden"
                    >
                      {errors[key]}
                    </motion.p>
                  )}
                </AnimatePresence>
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
      mobileToolbarValid,
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
    [newTemplate, setNewTemplate],
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
              newData,
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
              newData,
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
              newData,
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
              newData,
            )
          }
        />
      );
    } else {
      return null;
    }
  }, [groupSelected, content, handleGroupChange]);

  if (content === null || content === undefined) return null;

  return (
    <div id="TCEContainer" className="w-full h-full p-2 flex flex-col relative">
      <div
        id="TCEHeader"
        className="w-full h-fit min-h-fit flex flex-col md:flex-row gap-2 mb-2 sticky top-0 z-1"
      >
        <div className="TCEDevice bg-transparent z-51 backdrop-blur-xl shadow-sm shadow-appLayoutGentleShadow grow basis-0 h-fit flex flex-col items-center justify-center rounded-lg border border-appLayoutBorder">
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
        <div className="TCEDevice bg-transparent backdrop-blur-xl shadow-sm shadow-appLayoutGentleShadow grow basis-0 h-fit flex flex-col items-center justify-center rounded-lg border border-appLayoutBorder">
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

      <div className="flex gap-0 w-full grow min-h-0 ">
        <ScrollArea
          overscrollBehavior="none"
          scrollbars="y"
          type="hover"
          classNames={{
            root: `w-fit h-full max-h-full p-0 border border-appLayoutBorder rounded-l-lg shadow-sm shadow-appLayoutGentleShadow`,
            scrollbar: `bg-transparent hover:bg-transparent p-0 w-scrollbarWidth opacity-70`,
            thumb: `bg-appLayoutBorder rounded-l-full hover:bg-appLayoutInverseHover! z-[50]`,
            content:
              "h-full max-h-full w-fit flex flex-col items-center py-4 justify-start gap-3",
          }}
        >
          <div id="TCEBody w-fit h-fit mt-1 z-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={groupSelected}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.1 }}
                className="grid grid-cols-1 py-1 gap-y-2 gap-x-0"
              >
                {returnGroupEditor()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="h-full grow basis-0 min-w-0 border-r border-y border-appLayoutBorder rounded-r-lg overflow-hidden shadow-sm shadow-appLayoutGentleShadow">
          <TipTapEditor
            key={groupSelected}
            setHeaderOpened={true}
            mode={"previewTemplate"}
            preferences={content.desktopDefaultPreferences}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateContentEditor;

const ColorPicker = ({ color, onChangeComplete }) => {
  const [currentColor, setCurrentColor] = useState(color);
  const [isOpened, setIsOpened] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const headerRef = useRef(null);
  const dropdownRef = useRef(null);
  const innerRef = useOuterClick(() => {
    setIsOpened(false);
  });

  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  useEffect(() => {
    if (isOpened && headerRef.current && dropdownRef.current) {
      const headerRect = headerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const dropdownWidth = dropdownRef.current.offsetWidth;
      const viewportHeight = window.innerHeight;

      let top = headerRef.current.offsetHeight;
      let left = 0;

      // Adjust position if dropdown would go off-screen
      if (headerRect.bottom + dropdownHeight > viewportHeight) {
        top = -dropdownHeight;
      }

      setDropdownPosition({ top, left });
    }
  }, [isOpened]);

  const handleColorChange = (color) => {
    setCurrentColor(color.hex);
    onChangeComplete(color.hex);
  };

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
            className="absolute z-[1200] bg-appBackground text-appLayoutText rounded-lg shadow-lg"
          >
            <Sketch color={currentColor} onChange={handleColorChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
