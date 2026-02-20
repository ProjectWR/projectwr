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
  NUMBER_FORMATS,
  PAGE_BREAK_OPTIONS,
  BORDER_STYLES,
  HEADER_FOOTER_VARIABLES,
  NUMBER_STYLE_OPTIONS,
  TITLE_CASE_OPTIONS,
  FOOTNOTE_PLACEMENT_OPTIONS,
  LIST_STYLE_OPTIONS,
  PAGE_SIZE_PRESETS,
  METADATA_IDENTIFIER_SCHEMES,
  METADATA_TITLE_TYPES,
  METADATA_ROLES,
  METADATA_SUBJECT_AUTHORITIES,
  METADATA_PROGRESSION_DIRECTIONS,
  METADATA_IBOOKS_ORIENTATION,
  METADATA_IBOOKS_SCROLL,
} from "./formatConstants";
import { TYPE_CATEGORIES } from "./organizeConstants";
import { DropdownMenu } from "radix-ui";
import { motion, AnimatePresence } from "motion/react";

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
        <DropdownMenu.Item
          onClick={() => onChange("")}
          className="contextMenuItem italic opacity-70 border-b border-appLayoutBorder/50 mb-1"
        >
          Clear Selection
        </DropdownMenu.Item>
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

const FormatCategory = ({ category, categoryKey, settings, renderField }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div key={categoryKey} className="pb-0">
      <h3
        onClick={() => setIsOpen(!isOpen)}
        className={`text-libraryDirectoryBookNodeFontSize font-semibold text-appLayoutText ${isOpen ? "border-b  border-appLayoutBorder rounded-t-md" : "border-b border-transparent rounded-md"} py-1 flex items-center gap-2 cursor-pointer hover:bg-appLayoutHover/50 select-none transition-colors px-1`}
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          className="icon-[formkit--right] w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize text-appLayoutTextMuted"
        />
        <span className={category.icon}></span>
        {category.label}
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-1 pt-2 pb-4">
              {Object.keys(settings).map((key) => {
                if (
                  typeof settings[key] === "object" &&
                  settings[key] !== null
                ) {
                  return (
                    <div
                      key={key}
                      className="pl-2 border-l border-appLayoutBorder mt-1"
                    >
                      <h4 className="text-libraryDirectoryBookNodeFontSize font-medium text-appLayoutTextMuted mb-1 capitalize">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

FormatCategory.propTypes = {
  category: PropTypes.object.isRequired,
  categoryKey: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired,
  renderField: PropTypes.func.isRequired,
};

const LABEL_OVERRIDES = {
  "layout.isSeparatePage": "Is a Separate Page",
  "layout.columnRule": "Column Rule",
  "metadata.publication.language": "Language",
  "metadata.visual.coverImage": "Cover Image Path",
  "metadata.visual.pageProgressionDirection": "Page Progression",
  "metadata.accessibility.accessModes": "Access Modes",
  "metadata.ibooks.ipadOrientationLock": "iPad Orientation",
  "metadata.ibooks.iphoneOrientationLock": "iPhone Orientation",
};

const SettingsList = ({
  scope,
  id,
  itemCategory,
  loading,
  updateFormatValue,
  getResolvedValue,
}) => {
  const handleSettingChange = (section, key, value) => {
    updateFormatValue(scope, id, section, key, value);
  };

  const isFieldVisible = (section, key) => {
    // 1. Restrict certain fields to global scope only
    const restrictedGlobalFields = [
      "layout.pageSize",
      "layout.orientation",
      "layout.customWidth",
      "layout.customHeight",
    ];

    if (
      scope !== "global" &&
      (restrictedGlobalFields.includes(key) ||
        restrictedGlobalFields.includes(`${section}.${key}`))
    ) {
      return false;
    }

    // 2. Deactivation logic based on isSeparatePage
    const isSeparatePage = getResolvedValue(
      scope,
      id,
      itemCategory,
      "layout",
      "isSeparatePage",
    ).value;

    if (scope !== "global" && !isSeparatePage) {
      const hiddenNonPageFields = [
        "layout.columns",
        "layout.columnGap",
        "layout.columnRule",
        "layout.marginGutter",
        "layout.marginTop",
        "layout.marginBottom",
        "layout.marginLeft",
        "layout.marginRight",
      ];

      if (
        section === "headersFooters" ||
        hiddenNonPageFields.includes(`${section}.${key}`) ||
        hiddenNonPageFields.includes(key)
      ) {
        return false;
      }
    }

    // 3. Special Elements category-specific filtering
    if (scope !== "global" && section === "specialElements") {
      const fieldCategoryMap = {
        titlePageCentered: "title_page",
        titlePageFontSize: "title_page",
        titlePageSpacing: "title_page",
        partDividerCentered: "part_divider",
        partDividerFontSize: "part_divider",
        partDividerPageBreak: "part_divider",
        epigraphAlignment: "epigraph",
        epigraphFontSize: "epigraph",
        epigraphItalic: "epigraph",
        tocInclude: "table_of_contents",
        tocDepth: "table_of_contents",
        tocLeaderDots: "table_of_contents",
      };

      const requiredCategory = fieldCategoryMap[key];
      if (requiredCategory) {
        if (scope === "category" && id !== requiredCategory) return false;
        if (scope === "item" && itemCategory !== requiredCategory) return false;
      }
    }

    // 4. Chapter Title Format restriction
    if (scope !== "global" && section === "titleFormat") {
      const currentCategory = scope === "category" ? id : itemCategory;
      if (currentCategory !== "chapter") {
        return false;
      }
    }

    // 5. Metadata restriction (Global only)
    if (scope !== "global" && section === "metadata") {
      return false;
    }

    return true;
  };

  const renderField = (section, key, value, config) => {
    if (!isFieldVisible(section, key)) return null;

    const resolved = getResolvedValue(scope, id, itemCategory, section, key);
    const displayValue = resolved.value;
    const isInherited = resolved.isInherited;

    // Determine label for inheritance
    const displayInheritance = isInherited && scope !== "global";
    let inheritedLabel = "";
    if (displayInheritance) {
      if (resolved.source === "default") inheritedLabel = "(Default)";
      else if (resolved.source === "global") inheritedLabel = "(Global)";
      else if (resolved.source === "category")
        inheritedLabel = `(Category: ${itemCategory || "Category"})`;
    }

    // Select inputs
    const optionsMap = {
      fontFamily: FONT_FAMILIES,
      alignment: ALIGNMENT_OPTIONS,
      "headersFooters.pageNumberFormat": NUMBER_FORMATS,
      "headersFooters.headerLeft": HEADER_FOOTER_VARIABLES,
      "headersFooters.headerCenter": HEADER_FOOTER_VARIABLES,
      "headersFooters.headerRight": HEADER_FOOTER_VARIABLES,
      "headersFooters.footerLeft": HEADER_FOOTER_VARIABLES,
      "headersFooters.footerCenter": HEADER_FOOTER_VARIABLES,
      "headersFooters.footerRight": HEADER_FOOTER_VARIABLES,
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
      "metadata.identifier.scheme": METADATA_IDENTIFIER_SCHEMES,
      "metadata.title.type": METADATA_TITLE_TYPES,
      "metadata.creator.role": METADATA_ROLES,
      "metadata.contributor.role": METADATA_ROLES,
      "metadata.subject.authority": METADATA_SUBJECT_AUTHORITIES,
      "metadata.visual.pageProgressionDirection":
        METADATA_PROGRESSION_DIRECTIONS,
      "metadata.ibooks.ipadOrientationLock": METADATA_IBOOKS_ORIENTATION,
      "metadata.ibooks.iphoneOrientationLock": METADATA_IBOOKS_ORIENTATION,
      "metadata.ibooks.scrollAxis": METADATA_IBOOKS_SCROLL,
    };

    let options = optionsMap[key] || optionsMap[`${section}.${key}`];

    if (typeof displayValue === "boolean") {
      return (
        <div key={key} className="flex items-center justify-between py-1">
          <label className="text-xs text-appLayoutText flex flex-col">
            <span>
              {LABEL_OVERRIDES[`${section}.${key}`] ||
                LABEL_OVERRIDES[key] ||
                key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
            </span>
            {displayInheritance && (
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
              {LABEL_OVERRIDES[`${section}.${key}`] ||
                LABEL_OVERRIDES[key] ||
                key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
            </label>
            {displayInheritance && (
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
          <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
            {LABEL_OVERRIDES[`${section}.${key}`] ||
              LABEL_OVERRIDES[key] ||
              key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
          </label>
          {displayInheritance && (
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

    // Check if at least one field is visible
    const hasVisibleFields = Object.keys(settings).some((key) => {
      if (typeof settings[key] === "object" && settings[key] !== null) {
        return Object.keys(settings[key]).some((subKey) =>
          isFieldVisible(categoryKey, `${key}.${subKey}`),
        );
      }
      return isFieldVisible(categoryKey, key);
    });

    if (!hasVisibleFields) return null;

    return (
      <FormatCategory
        key={categoryKey}
        category={category}
        categoryKey={categoryKey}
        settings={settings}
        renderField={renderField}
      />
    );
  };

  return (
    <div className="grow overflow-y-auto pt-1 flex flex-col  custom-scrollbar h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full text-appLayoutTextMuted">
          Loading format settings...
        </div>
      ) : (
        SETTINGS_CATEGORIES.filter((cat) => {
          if (cat.key === "sectionBreaks") return false;
          if (scope === "global" && cat.key === "specialElements") return false;
          if (scope === "global" && cat.key === "titleFormat") return false;
          return true;
        }).map((cat) => renderCategory(cat, cat.key))
      )}
    </div>
  );
};

SettingsList.propTypes = {
  scope: PropTypes.string.isRequired,
  id: PropTypes.string,
  itemCategory: PropTypes.string,
  loading: PropTypes.bool,
  updateFormatValue: PropTypes.func.isRequired,
  getResolvedValue: PropTypes.func.isRequired,
};

const FormatEditor = ({ manuscriptData, libraryId }) => {
  const { loading, updateFormatValue, getResolvedValue } =
    useFormatInfo(libraryId);

  const [selectedCategoryId, setSelectedCategoryId] = useState("chapter");
  const [selectedItemId, setSelectedItemId] = useState("");

  // Flatten Categories for Dropdown
  const allCategories = useMemo(() => {
    const categories = [];
    Object.values(TYPE_CATEGORIES).forEach((group) => {
      Object.values(group).forEach((cat) => {
        categories.push(cat);
      });
    });
    return categories;
  }, []);

  // Use passed manuscriptData for Items Dropdown
  const flatItems = useMemo(() => {
    if (!manuscriptData) return [];

    const flatten = (items) => {
      let result = [];
      items.forEach((item) => {
        if (item.type === "paper") {
          result.push({
            id: item.id,
            title: item.title || "Untitled",
            category: item.category || "chapter",
          });
        }
      });
      return result;
    };

    return flatten(manuscriptData);
  }, [manuscriptData]);

  // Set default item selection if available
  useMemo(() => {
    if (flatItems.length > 0 && !selectedItemId) {
      setSelectedItemId(flatItems[0].id);
    }
  }, [flatItems]);

  // Helper to get item category for selected item
  const selectedItemCategory = useMemo(() => {
    const item = flatItems.find((p) => p.id === selectedItemId);
    return item?.category || "chapter";
  }, [flatItems, selectedItemId]);

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
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="item">Item</TabsTrigger>
        </TabsList>

        <div className="h-px w-full bg-appLayoutBorder"></div>

        <TabsContent
          value="global"
          className="grow min-h-0 flex flex-col gap-1 mt-1"
        >
          <SettingsList
            scope="global"
            id={null}
            itemCategory={null}
            loading={loading}
            updateFormatValue={updateFormatValue}
            getResolvedValue={getResolvedValue}
          />
        </TabsContent>

        <TabsContent
          value="category"
          className="grow min-h-0 flex flex-col gap-1 mt-1"
        >
          <div className="px-2 flex items-center gap-2 bg-appLayoutBgSecondary">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText shrink-0">
              Select Category:
            </label>
            <div className="w-full">
              <FormatDropdown
                value={selectedCategoryId}
                options={allCategories}
                onChange={setSelectedCategoryId}
              />
            </div>
          </div>

          <div className="h-px w-full bg-appLayoutBorder"></div>

          <SettingsList
            scope="category"
            id={selectedCategoryId}
            itemCategory={null}
            loading={loading}
            updateFormatValue={updateFormatValue}
            getResolvedValue={getResolvedValue}
          />
        </TabsContent>

        <TabsContent
          value="item"
          className="grow min-h-0 flex flex-col gap-1 mt-1"
        >
          <div className="px-2  flex items-center gap-2 bg-appLayoutBgSecondary">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText shrink-0">
              Select Item:
            </label>
            <div className="w-full">
              {flatItems.length === 0 ? (
                <div
                  className={`flex items-center justify-between w-fit italic px-2 py-1 h-fit text-appLayoutTextMuted text-libraryDirectoryBookNodeFontSize bg-transparent border border-appLayoutBorder rounded hover:border-appLayoutAccent transition-colors `}
                >
                  No items available
                </div>
              ) : (
                <FormatDropdown
                  value={selectedItemId}
                  options={flatItems.map((p) => ({
                    value: p.id,
                    label: p.title,
                  }))}
                  onChange={setSelectedItemId}
                  placeholder="Select an item..."
                />
              )}
            </div>
          </div>

          <div className="h-px w-full bg-appLayoutBorder"></div>

          <SettingsList
            scope="item"
            id={selectedItemId}
            itemCategory={selectedItemCategory}
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
