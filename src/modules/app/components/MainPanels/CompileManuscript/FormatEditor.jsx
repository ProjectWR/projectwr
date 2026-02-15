import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../LayoutComponents/Tabs";
import useFormatInfo from "../../../hooks/useFormatInfo";
import {
  SETTINGS_CATEGORIES,
  DEFAULT_FORMAT_SETTINGS,
  FONT_FAMILIES,
  ALIGNMENT_OPTIONS,
  PAGE_NUMBER_POSITIONS,
  NUMBER_FORMATS,
  PAGE_BREAK_OPTIONS,
  BORDER_STYLES,
  HEADER_FOOTER_VARIABLES,
  NUMBER_STYLE_OPTIONS,
  TITLE_CASE_OPTIONS,
  FOOTNOTE_PLACEMENT_OPTIONS,
  LIST_STYLE_OPTIONS,
  PAGE_SIZE_PRESETS,
} from "./formatConstants";
import { TYPE_CATEGORIES } from "./organizeConstants";
import { DropdownMenu } from "radix-ui";
import { motion } from "motion/react";

const FormatDropdown = ({
  value,
  options,
  onChange,
  placeholder,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );
  const label = selectedOption
    ? selectedOption.label
    : placeholder || "Select...";

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={true}>
      <DropdownMenu.Trigger disabled={disabled} className="outline-none w-full">
        <div
          className={`flex items-center justify-start w-fit gap-1 pl-2 pr-1 py-1 h-fit text-libraryDirectoryBookNodeFontSize bg-transparent border border-appLayoutBorder rounded hover:border-appLayoutAccent transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className="truncate text-appLayoutText">{label}</span>
          <motion.span
            animate={{ rotate: open ? 0 : 90 }}
            className="icon-[formkit--down] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize text-appLayoutTextMuted"
          />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="contextMenuContent z-[1100] max-h-[20rem] overflow-y-auto"
        align="start"
        sideOffset={4}
      >
        {options.map((opt) => (
          <DropdownMenu.Item
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`contextMenuItem`}
          >
            {opt.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

FormatDropdown.propTypes = {
  value: PropTypes.any,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

const SettingsList = ({
  scope,
  id,
  pageType,
  loading,
  updateFormatValue,
  getResolvedValue,
}) => {
  const getCurrentContext = () => ({ scope, id, pageType });

  const handleSettingChange = (section, key, value) => {
    updateFormatValue(scope, id, section, key, value);
  };

  const renderField = (section, key, value, config) => {
    // const { scope, id, pageType } = getCurrentContext();
    const resolved = getResolvedValue(scope, id, pageType, section, key);

    const isInherited = resolved.isInherited;
    const displayValue = resolved.value;

    // Determine label for inheritance
    let inheritedLabel = "";
    if (isInherited) {
      if (resolved.source === "default") inheritedLabel = "(Default)";
      else if (resolved.source === "global") inheritedLabel = "(Global)";
      else if (resolved.source === "type")
        inheritedLabel = `(Type: ${pageType || "Type"})`;
    }

    // Select inputs
    const optionsMap = {
      fontFamily: FONT_FAMILIES,
      alignment: ALIGNMENT_OPTIONS,
      "pageNumbers.position": PAGE_NUMBER_POSITIONS,
      "pageNumbers.format": NUMBER_FORMATS,
      "headersFooters.headerLeft": HEADER_FOOTER_VARIABLES,
      "sectionBreaks.pageBreakBefore": PAGE_BREAK_OPTIONS,
      "sectionBreaks.pageBreakAfter": PAGE_BREAK_OPTIONS,
      "titleFormat.numberStyle": NUMBER_STYLE_OPTIONS,
      "titleFormat.titleCase": TITLE_CASE_OPTIONS,
      "advanced.footnotes.style": [
        { value: "superscript", label: "Superscript" },
        { value: "bracket", label: "Bracket" },
      ],
      "advanced.footnotes.placement": FOOTNOTE_PLACEMENT_OPTIONS,
      "layout.pageSize": Object.entries(PAGE_SIZE_PRESETS).map(([k, v]) => ({
        value: k,
        label: v.label,
      })),
      "layout.orientation": [
        { value: "portrait", label: "Portrait" },
        { value: "landscape", label: "Landscape" },
      ],
      "typography.list.orderedListStyle": LIST_STYLE_OPTIONS,
      "advanced.borderStyle": BORDER_STYLES,
    };

    let options = optionsMap[key] || optionsMap[`${section}.${key}`];

    if (typeof displayValue === "boolean") {
      return (
        <div key={key} className="flex items-center justify-between py-1">
          <label className="text-xs text-appLayoutText flex flex-col">
            <span>
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </span>
            {isInherited && (
              <span className="text-[10px] text-appLayoutTextMuted italic ml-1">
                Inherited {inheritedLabel}
              </span>
            )}
          </label>
          <input
            type="checkbox"
            checked={displayValue}
            onChange={(e) =>
              handleSettingChange(section, key, e.target.checked)
            }
            className="accent-appLayoutAccent"
            disabled={loading}
          />
        </div>
      );
    }

    if (options) {
      return (
        <div key={key} className="flex flex-col gap-1 py-1">
          <div className="flex justify-between items-baseline">
            <label className="text-xs text-appLayoutText">
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            {isInherited && (
              <span className="text-[10px] text-appLayoutTextMuted italic">
                Inherited {inheritedLabel}
              </span>
            )}
          </div>
          <FormatDropdown
            value={displayValue}
            options={options}
            onChange={(val) => handleSettingChange(section, key, val)}
            disabled={loading}
          />
        </div>
      );
    }

    return (
      <div key={key} className="flex flex-col gap-1 py-1">
        <div className="flex justify-between items-baseline">
          <label className="text-xs text-appLayoutText">
            {key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
          </label>
          {isInherited && (
            <span className="text-[10px] text-appLayoutTextMuted italic">
              Inherited {inheritedLabel}
            </span>
          )}
        </div>
        <input
          type={typeof displayValue === "number" ? "number" : "text"}
          value={displayValue || ""}
          onChange={(e) =>
            handleSettingChange(
              section,
              key,
              typeof displayValue === "number"
                ? Number(e.target.value)
                : e.target.value,
            )
          }
          className="w-full bg-appLayoutBg px-2 py-1 rounded border border-appLayoutBorder text-xs focus:border-appLayoutAccent outline-none"
          disabled={loading}
        />
      </div>
    );
  };

  const renderCategory = (category, categoryKey) => {
    const settings = DEFAULT_FORMAT_SETTINGS[categoryKey];
    if (!settings) return null;

    return (
      <div key={categoryKey} className="">
        <h3 className="text-sm font-semibold text-appLayoutText border-b border-appLayoutBorder pb-1 flex items-center gap-2">
          <span className={category.icon}></span>
          {category.label}
        </h3>
        <div className="flex flex-col gap-2 pl-2">
          {Object.keys(settings).map((key) => {
            if (typeof settings[key] === "object" && settings[key] !== null) {
              return (
                <div
                  key={key}
                  className="pl-2 border-l border-appLayoutBorder mt-1"
                >
                  <h4 className="text-xs font-medium text-appLayoutTextMuted mb-1 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </h4>
                  {Object.keys(settings[key]).map((subKey) =>
                    renderField(
                      categoryKey,
                      `${key}.${subKey}`,
                      settings[key][subKey],
                      {},
                    ),
                  )}
                </div>
              );
            }
            return renderField(categoryKey, key, settings[key], {});
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 custom-scrollbar h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full text-appLayoutTextMuted">
          Loading format settings...
        </div>
      ) : (
        SETTINGS_CATEGORIES.map((cat) => renderCategory(cat, cat.key))
      )}
    </div>
  );
};

SettingsList.propTypes = {
  scope: PropTypes.string.isRequired,
  id: PropTypes.string,
  pageType: PropTypes.string,
  loading: PropTypes.bool,
  updateFormatValue: PropTypes.func.isRequired,
  getResolvedValue: PropTypes.func.isRequired,
};

const FormatEditor = ({ manuscriptData, libraryId }) => {
  const { loading, updateFormatValue, getResolvedValue } =
    useFormatInfo(libraryId);
  // activeTab state is handled by Tabs component implicitly if we don't control it,
  // but we can set a default.
  // We don't need activeTab state anymore for rendering logic if we use TabsContent.

  const [selectedTypeId, setSelectedTypeId] = useState("chapter");
  const [selectedPageId, setSelectedPageId] = useState("");

  // Flatten Types for Dropdown
  const allTypes = useMemo(() => {
    const types = [];
    Object.values(TYPE_CATEGORIES).forEach((category) => {
      Object.values(category).forEach((type) => {
        types.push(type);
      });
    });
    return types;
  }, []);

  // Use passed manuscriptData for Pages Dropdown
  const flatPages = useMemo(() => {
    if (!manuscriptData) return [];

    const flatten = (items) => {
      let result = [];
      items.forEach((item) => {
        if (item.type === "paper") {
          result.push({
            id: item.sourceId || item.id,
            title: item.title || "Untitled",
            type: item.category || "chapter",
          });
        }
      });
      return result;
    };

    return flatten(manuscriptData);
  }, [manuscriptData]);

  // Set default page selection if available
  useMemo(() => {
    if (flatPages.length > 0 && !selectedPageId) {
      setSelectedPageId(flatPages[0].id);
    }
  }, [flatPages]);

  // Helper to get page type for selected page
  const selectedPageType = useMemo(() => {
    const page = flatPages.find((p) => p.id === selectedPageId);
    return page?.type || "chapter";
  }, [flatPages, selectedPageId]);

  return (
    <div className="w-full h-full flex flex-col px-1">
      <div className="text-libraryDirectoryBookNodeFontSize px-1 py-1 text-appLayoutText flex items-center gap-2">
        Presets:
      </div>

      <div className="h-px w-full bg-appLayoutBorder"></div>

      <div className="text-libraryDirectoryBookNodeFontSize px-1 py-1 text-appLayoutText flex items-center gap-2">
        <span className="text-appLayoutTextMuted italic text-xs">
          No preset selected
        </span>
      </div>

      <div className="text-libraryDirectoryBookNodeFontSize mt-3 px-1 py-1 text-appLayoutText flex items-center gap-2">
        Edit format based on scopes
      </div>

      <div className="h-px w-full bg-appLayoutBorder"></div>

      <Tabs
        defaultValue="global"
        className="w-full flex grow gap-0 mt-1 flex-col overflow-hidden"
      >
        <TabsList className="h-fit flex gap-1">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="type">Type</TabsTrigger>
          <TabsTrigger value="page">Page</TabsTrigger>
        </TabsList>

        <div className="h-px w-full bg-appLayoutBorder"></div>

        <TabsContent value="global" className="grow min-h-0 flex flex-col gap-1 mt-1">
          <SettingsList
            scope="global"
            id={null}
            pageType={null}
            loading={loading}
            updateFormatValue={updateFormatValue}
            getResolvedValue={getResolvedValue}
          />
        </TabsContent>

        <TabsContent value="type" className="grow min-h-0 flex flex-col gap-1 mt-1">
          <div className="px-2 flex items-center gap-2 bg-appLayoutBgSecondary">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText shrink-0">
              Select Type:
            </label>
            <div className="w-full">
              <FormatDropdown
                value={selectedTypeId}
                options={allTypes}
                onChange={setSelectedTypeId}
              />
            </div>
          </div>

          <div className="h-px w-full bg-appLayoutBorder"></div>

          <SettingsList
            scope="type"
            id={selectedTypeId}
            pageType={null}
            loading={loading}
            updateFormatValue={updateFormatValue}
            getResolvedValue={getResolvedValue}
          />
        </TabsContent>

        <TabsContent value="page" className="grow min-h-0 flex flex-col gap-1 mt-1">
          <div className="px-2  flex items-center gap-2 bg-appLayoutBgSecondary">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText shrink-0">
              Select Page:
            </label>
            <div className="w-full">
              {flatPages.length === 0 ? (
                <div
                  className={`flex items-center justify-between w-fit italic px-2 py-1 h-fit text-appLayoutTextMuted text-libraryDirectoryBookNodeFontSize bg-transparent border border-appLayoutBorder rounded hover:border-appLayoutAccent transition-colors `}
                >
                  No pages available
                </div>
              ) : (
                <FormatDropdown
                  value={selectedPageId}
                  options={flatPages.map((p) => ({
                    value: p.id,
                    label: p.title,
                  }))}
                  onChange={setSelectedPageId}
                  placeholder="Select a page..."
                />
              )}
            </div>
          </div>

          <div className="h-px w-full bg-appLayoutBorder"></div>

          <SettingsList
            scope="page"
            id={selectedPageId}
            pageType={selectedPageType}
            loading={loading}
            updateFormatValue={updateFormatValue}
            getResolvedValue={getResolvedValue}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

FormatEditor.propTypes = {
  manuscriptData: PropTypes.array,
  libraryId: PropTypes.string,
};

export default FormatEditor;
