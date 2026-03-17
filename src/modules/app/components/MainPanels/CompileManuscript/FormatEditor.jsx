import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../LayoutComponents/Tabs";
import { TagsInput } from "@mantine/core";
import useFormatInfo from "../../../hooks/useFormatInfo";
import {
  SETTINGS_CATEGORIES,
  DEFAULT_FORMAT_SETTINGS,
  FONT_FAMILIES,
  ALIGNMENT_OPTIONS,
  ALIGN_V_OPTIONS,
  ALIGN_H_OPTIONS,
  NUMBER_FORMATS,
  PAGE_BREAK_OPTIONS,
  BORDER_STYLES,
  HEADER_FOOTER_VARIABLES,
  NUMBER_STYLE_OPTIONS,
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
  hideClear,
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
        {!hideClear && (
          <DropdownMenu.Item
            onClick={() => onChange("")}
            className="contextMenuItem italic opacity-70 border-b border-appLayoutBorder/50 mb-1"
          >
            Clear Selection
          </DropdownMenu.Item>
        )}
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
  hideClear: PropTypes.bool,
};

const RadixTextarea = ({ value, onChange, disabled, placeholder }) => {
  return (
    <textarea
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent p-2 text-libraryDirectoryBookNodeFontSize text-appLayoutText border border-appLayoutBorder rounded hover:border-appLayoutAccent focus:border-appLayoutAccent transition-colors outline-none min-h-[100px] resize-y"
    />
  );
};

RadixTextarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

const HEADER_TAG_MAP = {
  "{author}": "Creator Name",
  "{words}": "Total Word Count",
  "{words100}": "Total Word Count rounded to 100",
  "{contact}": "Contact Information",
  "{page}": "Current Page",
  "{pages}": "Total Pages",
  "{sep}": "/ separator",
  "{newline}": "newline separator",
  "{5_spaces}": "5 spaces",
  "{10_spaces}": "10 spaces",
  "{5_newlines}": "5 newlines",
};

const HeaderTagInput = ({ value = "", onChange, disabled }) => {
  const suggestions = Object.values(HEADER_TAG_MAP);

  // Convert string to tags
  const tags = useMemo(() => {
    if (!value) return [];
    // Split by {tokens}
    const parts = value.split(/({[^}]+})/g).filter((p) => p && p.trim() !== "");
    return parts.map((part) => HEADER_TAG_MAP[part] || part.trim());
  }, [value]);

  const handleTagsChange = (newTags) => {
    const reverseMap = Object.entries(HEADER_TAG_MAP).reduce(
      (acc, [k, v]) => ({ ...acc, [v]: k }),
      {},
    );
    const newValue = newTags.map((tag) => reverseMap[tag] || tag).join("");
    onChange(newValue);
  };

  return (
    <TagsInput
      value={tags}
      onChange={handleTagsChange}
      data={suggestions}
      disabled={disabled}
      placeholder="Type or select tags..."
      splitChars={[",", "|"]}
      classNames={{
        input:
          "text-libraryDirectoryBookNodeFontSize text-appLayoutText w-full bg-appBackground border border-appLayoutBorder focus:border-appLayoutInverseHover",
        root: "h-fit w-full border-none rounded",
        pill: "text-libraryDirectoryBookNodeFontSize bg-appBackground text-appLayoutText border border-appLayoutBorder rounded",
        pillRemoveIcon: "text-appLayoutTextMuted bg-appBackground",
        pillRemoveIconHover: "text-appLayoutText",
        dropdown:
          "border border-appLayoutBorder bg-appBackground text-appLayoutText text-libraryDirectoryBookNodeFontSize",
        option:
          "hover:bg-appLayoutInverseHover h-fit px-2 py-1 text-libraryDirectoryBookNodeFontSize",
        options: "w-full h-fit",
      }}
    />
  );
};

HeaderTagInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const FormatCategory = ({
  category,
  categoryKey,
  settings,
  renderField,
  fieldKeys: passedFieldKeys,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fieldKeys = passedFieldKeys || Object.keys(settings);

  return (
    <div className="pb-0">
      <h3
        onClick={() => setIsOpen(!isOpen)}
        className={`text-libraryDirectoryBookNodeFontSize font-semibold text-appLayoutText ${isOpen ? "border-b  border-appLayoutBorder rounded-t-md" : "border-b border-transparent rounded-md"} py-1 flex items-center gap-2 cursor-pointer hover:bg-appLayoutHover/50 select-none transition-colors`}
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
              {fieldKeys.map((key) => {
                if (
                  typeof settings[key] === "object" &&
                  settings[key] !== null
                ) {
                  return (
                    <div
                      key={key}
                      className="px-2 py-1 border border-appLayoutBorder rounded-md mt-1"
                    >
                      <h4 className="text-libraryDirectoryBookNodeFontSize font-medium text-appLayoutTextMuted mb-1 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h4>
                      {Object.keys(settings[key]).map((subKey) =>
                        renderField(categoryKey, `${key}.${subKey}`),
                      )}
                    </div>
                  );
                }
                return renderField(categoryKey, key);
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
  fieldKeys: PropTypes.array,
};

const LABEL_OVERRIDES = {
  "layout.breakBefore": "Break Before",
  "layout.breakAfter": "Break After",
  "layout.pageSize": "Page Size",
  "layout.orientation": "Orientation",
  "layout.customWidth": "Custom Width (mm)",
  "layout.customHeight": "Custom Height (mm)",
  "layout.marginTop": "Margin Top (mm)",
  "layout.marginBottom": "Margin Bottom (mm)",
  "layout.marginLeft": "Margin Left (mm)",
  "layout.marginRight": "Margin Right (mm)",
  "layout.marginGutter": "Margin Gutter (mm)",
  "metadata.publication.language": "Language",
  "metadata.visual.coverImage": "Cover Image Path",
  "metadata.visual.pageProgressionDirection": "Page Progression",
  "metadata.accessibility.accessModes": "Access Modes",
  "metadata.ibooks.ipadOrientationLock": "iPad Orientation",
  "metadata.ibooks.iphoneOrientationLock": "iPhone Orientation",
  "typography.fontSize": "Font Size (pt)",
  "typography.indentWidthValue": "Indent Width (pt)",
  "typography.pSpaceBefore": "Paragraph Spacing Before (pt)",
  "typography.pSpaceAfter": "Paragraph Spacing After (pt)",
  "typography.list.listIndent": "List Indent (pt)",
  "marginHeaderFooters.headerSize": "Header Font Size (pt)",
  "marginHeaderFooters.headerLineHeight": "Header Line Height",
  "marginHeaderFooters.footerSize": "Footer Font Size (pt)",
  "marginHeaderFooters.footerLineHeight": "Footer Line Height",
  "marginHeaderFooters.startPageNumber": "Start Page Number",
  "advanced.borderWidth": "Border Width (px)",
  "advanced.borderRadius": "Border Radius (px)",
  "advanced.padding": "Padding (pt)",
  "titleFormat.includeTitle": "Include Title",
  "titleFormat.prefix": "Prefix",
  "titleFormat.useItemTitleAsPrefix": "Use Item Title as Prefix",
  "titleFormat.suffix": "Suffix",
  "titleFormat.useItemTitleAsSuffix": "Use Item Title as Suffix",
  "titleFormat.subtitle": "Subtitle",
  "titleFormat.useItemTitleAsSubtitle": "Use Item Title as Subtitle",
  "titleFormat.includeNumber": "Include Chapter Number",
  "titleFormat.fontFamily": "Title Font Family",
  "titleFormat.fontSize": "Title Font Size (pt)",
  "titleFormat.lineHeight": "Title Line Height",
  "titleFormat.titleAlignment": "Title Alignment",
  "titleFormat.subtitleAlignment": "Subtitle Alignment",
  "titleFormat.spacingBefore": "Title Spacing Before (pt)",
  "titleFormat.spacingAfter": "Title Spacing After (pt)",
  "titleFormat.subtitleItalic": "Italic Subtitle",
  "titleFormat.subtitleFontFamily": "Subtitle Font Family",
  "titleFormat.subtitleFontSize": "Subtitle Font Size (pt)",
  "titleFormat.subtitleLineHeight": "Subtitle Line Height",
  "normalTitleFormat.title": "Title",
  "normalTitleFormat.useItemTitleAsTitle": "Use Item Title as Title",
  "normalTitleFormat.subtitle": "Subtitle",
  "normalTitleFormat.useItemTitleAsSubtitle": "Use Item Title as Subtitle",
  "normalTitleFormat.fontFamily": "Title Font Family",
  "normalTitleFormat.fontSize": "Title Font Size (pt)",
  "normalTitleFormat.lineHeight": "Title Line Height",
  "normalTitleFormat.titleAlignment": "Title Alignment",
  "normalTitleFormat.subtitleAlignment": "Subtitle Alignment",
  "normalTitleFormat.spacingBefore": "Title Spacing Before (pt)",
  "normalTitleFormat.spacingAfter": "Title Spacing After (pt)",
  "normalTitleFormat.subtitleItalic": "Italic Subtitle",
  "normalTitleFormat.subtitleFontFamily": "Subtitle Font Family",
  "normalTitleFormat.subtitleFontSize": "Subtitle Font Size (pt)",
  "normalTitleFormat.subtitleLineHeight": "Subtitle Line Height",
  "marginHeaderFooters.enabled": "Headers & Footers Enabled",
  "marginHeaderFooters.fontFamily": "Header/Footer Font",
  "marginHeaderFooters.verticalAlign": "Vertical Alignment",
  "marginHeaderFooters.topLeftCorner": "Top Left Corner",
  "marginHeaderFooters.topLeft": "Top Left",
  "marginHeaderFooters.topCenter": "Top Center",
  "marginHeaderFooters.topRight": "Top Right",
  "marginHeaderFooters.topRightCorner": "Top Right Corner",
  "marginHeaderFooters.bottomLeftCorner": "Bottom Left Corner",
  "marginHeaderFooters.bottomLeft": "Bottom Left",
  "marginHeaderFooters.bottomCenter": "Bottom Center",
  "marginHeaderFooters.bottomRight": "Bottom Right",
  "marginHeaderFooters.bottomRightCorner": "Bottom Right Corner",
  "marginHeaderFooters.leftTop": "Left Side (Top)",
  "marginHeaderFooters.leftBottom": "Left Side (Bottom)",
  "marginHeaderFooters.rightTop": "Right Side (Top)",
  "marginHeaderFooters.rightBottom": "Right Side (Bottom)",
  "metadata.contactInfo": "Contact Information",
  "metadata.wordCount": "Manually Override Word Count",
  "specialElements.titlePageFontSize": "Title Page Font Size (pt)",
  "specialElements.titlePageSpacing": "Title Page Spacing (pt)",
  "specialElements.partDividerFontSize": "Part Divider Font Size (pt)",
  "specialElements.epigraphFontSize": "Epigraph Font Size (pt)",
  "dynamicContent.beforePageContent": "Before Page Content",
  "dynamicContent.beforeFontSize": "Font Size (pt)",
  "dynamicContent.beforeLineHeight": "Line Height",
  "dynamicContent.afterPageContent": "After Page Content",
  "dynamicContent.afterFontSize": "Font Size (pt)",
  "dynamicContent.afterLineHeight": "Line Height",
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

    // 1b. Hide custom dimensions unless pageSize is 'custom'
    if (
      section === "layout" &&
      (key === "customWidth" || key === "customHeight")
    ) {
      const pageSize = getResolvedValue(
        scope,
        id,
        itemCategory,
        "layout",
        "pageSize",
      ).value;
      if (pageSize !== "custom") return false;
    }

    // 2. Deactivation logic based on break settings
    const breakBefore = getResolvedValue(
      scope,
      id,
      itemCategory,
      "layout",
      "breakBefore",
    ).value;
    const breakAfter = getResolvedValue(
      scope,
      id,
      itemCategory,
      "layout",
      "breakAfter",
    ).value;

    const hasBreakBefore =
      breakBefore && breakBefore !== "auto" && breakBefore !== "avoid";
    const hasBreakAfter =
      breakAfter && breakAfter !== "auto" && breakAfter !== "avoid";

    if (scope !== "global") {
      const hiddenNonPageFields = [
        "layout.marginGutter",
        "layout.marginTop",
        "layout.marginBottom",
        "layout.marginLeft",
        "layout.marginRight",
      ];

      // Hide layout margins if no breaks are set (not a separate page/start of section)
      if (
        !hasBreakBefore &&
        !hasBreakAfter &&
        (hiddenNonPageFields.includes(`${section}.${key}`) ||
          hiddenNonPageFields.includes(key))
      ) {
        return false;
      }

      // Margin Header/Footer visibility
      if (section === "marginHeaderFooters") {
        if (!hasBreakBefore && !hasBreakAfter) return false;

        const headerFields = [
          "headerSize",
          "headerLineHeight",
          "topLeftCorner",
          "topLeft",
          "topCenter",
          "topRight",
          "topRightCorner",
          "leftTop",
          "rightTop",
        ];
        const footerFields = [
          "footerSize",
          "footerLineHeight",
          "bottomLeftCorner",
          "bottomLeft",
          "bottomCenter",
          "bottomRight",
          "bottomRightCorner",
          "leftBottom",
          "rightBottom",
        ];

        const isHeaderField = headerFields.some(
          (f) =>
            key === f ||
            key.startsWith(`${f}Padding`) ||
            key === `${f}HAlign` ||
            key === `${f}VAlign`,
        );
        const isFooterField = footerFields.some(
          (f) =>
            key === f ||
            key.startsWith(`${f}Padding`) ||
            key === `${f}HAlign` ||
            key === `${f}VAlign`,
        );

        if (isHeaderField && !hasBreakBefore) return false;
        if (isFooterField && !hasBreakAfter) return false;
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

    // 4. Chapter vs Normal Title Format restriction
    const currentCategory = scope === "category" ? id : itemCategory;
    const isChapter = currentCategory === "chapter";

    if (section === "titleFormat") {
      if (scope !== "global" && !isChapter) return false;
    }

    if (section === "normalTitleFormat") {
      if (scope !== "global" && isChapter) return false;
    }

    // 5. Metadata restriction (Global only)
    if (scope !== "global" && section === "metadata") {
      return false;
    }

    // 6. Hide fields if they are disabled by a toggle
    if (section === "titleFormat") {
      if (
        key === "prefix" &&
        getResolvedValue(
          scope,
          id,
          itemCategory,
          section,
          "useItemTitleAsPrefix",
        ).value
      )
        return false;
      if (
        key === "suffix" &&
        getResolvedValue(
          scope,
          id,
          itemCategory,
          section,
          "useItemTitleAsSuffix",
        ).value
      )
        return false;
      if (
        key === "subtitle" &&
        getResolvedValue(
          scope,
          id,
          itemCategory,
          section,
          "useItemTitleAsSubtitle",
        ).value
      )
        return false;
    }

    if (section === "normalTitleFormat") {
      if (
        key === "title" &&
        getResolvedValue(
          scope,
          id,
          itemCategory,
          section,
          "useItemTitleAsTitle",
        ).value
      )
        return false;
      if (
        key === "subtitle" &&
        getResolvedValue(
          scope,
          id,
          itemCategory,
          section,
          "useItemTitleAsSubtitle",
        ).value
      )
        return false;
    }

    // 7. Hide per-field alignments from the main loop (they are rendered inline)
    if (
      section === "marginHeaderFooters" &&
      (key.endsWith("HAlign") || key.endsWith("VAlign"))
    ) {
      return false;
    }

    return true;
  };

  const renderField = (section, key) => {
    if (!isFieldVisible(section, key)) return null;

    const resolved = getResolvedValue(scope, id, itemCategory, section, key);
    const displayValue = resolved.value;
    const isInherited = resolved.isInherited;

    // Disabling logic for titleFormat
    let isFieldDisabled = loading;
    if (section === "titleFormat") {
      if (key === "prefix") {
        isFieldDisabled =
          isFieldDisabled ||
          getResolvedValue(
            scope,
            id,
            itemCategory,
            "titleFormat",
            "useItemTitleAsPrefix",
          ).value;
      } else if (key === "suffix") {
        isFieldDisabled =
          isFieldDisabled ||
          getResolvedValue(
            scope,
            id,
            itemCategory,
            "titleFormat",
            "useItemTitleAsSuffix",
          ).value;
      } else if (key === "subtitle") {
        isFieldDisabled =
          isFieldDisabled ||
          getResolvedValue(
            scope,
            id,
            itemCategory,
            "titleFormat",
            "useItemTitleAsSubtitle",
          ).value;
      }
    }

    if (section === "normalTitleFormat") {
      if (key === "title") {
        isFieldDisabled =
          isFieldDisabled ||
          getResolvedValue(
            scope,
            id,
            itemCategory,
            "normalTitleFormat",
            "useItemTitleAsTitle",
          ).value;
      } else if (key === "subtitle") {
        isFieldDisabled =
          isFieldDisabled ||
          getResolvedValue(
            scope,
            id,
            itemCategory,
            "normalTitleFormat",
            "useItemTitleAsSubtitle",
          ).value;
      }
    }

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
      subtitleFontFamily: FONT_FAMILIES,
      alignment: ALIGNMENT_OPTIONS,
      titleAlignment: ALIGNMENT_OPTIONS,
      subtitleAlignment: ALIGNMENT_OPTIONS,
      verticalAlign: [
        { value: "top", label: "Top" },
        { value: "middle", label: "Middle" },
        { value: "bottom", label: "Bottom" },
      ],
      "marginHeaderFooters.fontFamily": FONT_FAMILIES,
      "marginHeaderFooters.pageNumberFormat": NUMBER_FORMATS,
      "marginHeaderFooters.headerLeft": HEADER_FOOTER_VARIABLES,
      "marginHeaderFooters.headerCenter": HEADER_FOOTER_VARIABLES,
      "marginHeaderFooters.footerRight": HEADER_FOOTER_VARIABLES,
      "sectionBreaks.pageBreakAfter": PAGE_BREAK_OPTIONS,
      "layout.breakBefore": PAGE_BREAK_OPTIONS,
      "layout.breakAfter": PAGE_BREAK_OPTIONS,
      "titleFormat.numberStyle": NUMBER_STYLE_OPTIONS,
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
            disabled={isFieldDisabled}
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
            disabled={isFieldDisabled}
          />
        </div>
      );
    }

    // Special cases for margin boxes (Header/Footer areas)
    const marginBoxFields = [
      "topLeftCorner",
      "topLeft",
      "topCenter",
      "topRight",
      "topRightCorner",
      "bottomLeftCorner",
      "bottomLeft",
      "bottomCenter",
      "bottomRight",
      "bottomRightCorner",
      "leftTop",
      "leftBottom",
      "rightTop",
      "rightBottom",
    ];

    if (section === "marginHeaderFooters" && marginBoxFields.includes(key)) {
      return (
        <div
          key={key}
          className="flex flex-col gap-1 py-1 border-b border-appLayoutBorder/30 pb-2 mb-1"
        >
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText font-medium">
              {LABEL_OVERRIDES[`${section}.${key}`] ||
                LABEL_OVERRIDES[key] ||
                key}
            </label>
          </div>
          <HeaderTagInput
            value={displayValue}
            onChange={(val) => handleSettingChange(section, key, val)}
            disabled={isFieldDisabled}
          />
          <div className="flex gap-2 mt-1">
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-[10px] text-appLayoutTextMuted">
                Horiz. Align
              </span>
              <FormatDropdown
                value={
                  getResolvedValue(
                    scope,
                    id,
                    itemCategory,
                    section,
                    `${key}HAlign`,
                  ).value
                }
                options={ALIGN_H_OPTIONS}
                onChange={(val) =>
                  handleSettingChange(section, `${key}HAlign`, val)
                }
                disabled={isFieldDisabled}
                hideClear={true}
              />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-[10px] text-appLayoutTextMuted">
                Vert. Align
              </span>
              <FormatDropdown
                value={
                  getResolvedValue(
                    scope,
                    id,
                    itemCategory,
                    section,
                    `${key}VAlign`,
                  ).value
                }
                options={ALIGN_V_OPTIONS}
                onChange={(val) =>
                  handleSettingChange(section, `${key}VAlign`, val)
                }
                disabled={isFieldDisabled}
                hideClear={true}
              />
            </div>
          </div>
        </div>
      );
    }

    if (
      key === "contactInfo" ||
      key === "beforePageContent" ||
      key === "afterPageContent"
    ) {
      return (
        <div key={key} className="flex flex-col gap-1 py-1">
          <div className="flex justify-between items-baseline">
            <label className="text-libraryDirectoryBookNodeFontSize text-appLayoutText">
              {LABEL_OVERRIDES[`${section}.${key}`] ||
                LABEL_OVERRIDES[key] ||
                key}
            </label>
          </div>
          <RadixTextarea
            value={displayValue}
            disabled={isFieldDisabled}
            onChange={(val) => handleSettingChange(section, key, val)}
            placeholder={
              key === "contactInfo"
                ? "Name, Address, Phone, Email..."
                : "Text to inject"
            }
          />
          {(key === "beforePageContent" || key === "afterPageContent") && (
            <div className="mt-2 p-2 bg-appLayoutBg border border-appLayoutBorder rounded text-[10px] text-appLayoutTextMuted space-y-1">
              <p className="font-semibold text-appLayoutText mb-1">
                Available Variables:
              </p>
              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                <span className="text-appLayoutAccent font-mono">
                  {"{author}"}
                </span>
                <span>Creator Name</span>
                <span className="text-appLayoutAccent font-mono">
                  {"{words}"}
                </span>
                <span>Total Word Count</span>
                <span className="text-appLayoutAccent font-mono">
                  {"{words100}"}
                </span>
                <span>Total Word Count rounded to 100</span>
                <span className="text-appLayoutAccent font-mono">
                  {"{contact}"}
                </span>
                <span>Contact Information</span>
                <span className="text-appLayoutAccent font-mono">
                  {"{page}"}
                </span>
                <span>Current Page</span>
                <span className="text-appLayoutAccent font-mono">
                  {"{pages}"}
                </span>
                <span>Total Pages</span>
                <span className="text-appLayoutAccent font-mono">
                  {"{X_spaces}"}
                </span>
                <span>X number of spaces (e.g. {"{5_spaces}"})</span>
                <span className="text-appLayoutAccent font-mono">
                  {"{X_newlines}"}
                </span>
                <span>X number of newlines (e.g. {"{5_newlines}"})</span>
              </div>
            </div>
          )}
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
          step={typeof displayValue === "number" ? "any" : undefined}
          value={displayValue || ""}
          disabled={isFieldDisabled}
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
        />
      </div>
    );
  };

  const renderCategory = (category, categoryKey) => {
    const settings = DEFAULT_FORMAT_SETTINGS[categoryKey];
    if (!settings) return null;

    // Custom Field Sorting for Title Formats
    let fieldKeys = Object.keys(settings);
    if (categoryKey === "titleFormat") {
      fieldKeys = [
        "includeTitle",
        ...fieldKeys.filter((k) => k !== "includeTitle"),
      ];
    } else if (categoryKey === "normalTitleFormat") {
      fieldKeys = [
        "useItemTitleAsTitle",
        ...fieldKeys.filter((k) => k !== "useItemTitleAsTitle"),
      ];
    }

    // Check if at least one field is visible
    const hasVisibleFields = fieldKeys.some((key) => {
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
        fieldKeys={fieldKeys}
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
  }, [flatItems, selectedItemId]);

  // Helper to get item category for selected item
  const selectedItemCategory = useMemo(() => {
    const item = flatItems.find((p) => p.id === selectedItemId);
    return item?.category || "chapter";
  }, [flatItems, selectedItemId]);

  return (
    <div className="w-full h-full flex flex-col px-1 ">
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
