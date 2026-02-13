import { DEFAULT_FORMAT_SETTINGS, PAGE_SIZE_PRESETS } from "../formatConstants";

/**
 * Deep merge two objects, combining nested properties
 */
const deepMerge = (target, source) => {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] !== null &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }

  return result;
};

/**
 * Get effective settings for a page with full inheritance chain
 * Priority: page settings > page type settings > global settings > defaults
 */
export const getEffectiveSettings = (
  page,
  globalSettings = {},
  pageTypeSettings = {},
  pageSettings = {},
) => {
  // Start with defaults
  let effective = { ...DEFAULT_FORMAT_SETTINGS };

  // Apply global settings
  effective = deepMerge(effective, globalSettings);

  // Apply page type settings if page has a type
  if (page && page.type && pageTypeSettings[page.type]) {
    effective = deepMerge(effective, pageTypeSettings[page.type]);
  }

  // Apply page-specific settings if page exists
  if (page && page.id && pageSettings[page.id]) {
    effective = deepMerge(effective, pageSettings[page.id]);
  }

  return effective;
};

/**
 * Check if a specific setting is overridden at a given level
 * @param {string} settingPath - dot-notation path, e.g., "layout.marginTop"
 * @param {string} level - "global" | "pageType" | "page"
 * @param {object} settings - the settings object for that level
 */
export const isSettingOverridden = (settingPath, level, settings) => {
  if (!settings || level === "global") return false;

  const keys = settingPath.split(".");
  let current = settings;

  for (const key of keys) {
    if (current[key] === undefined) return false;
    current = current[key];
  }

  return true;
};

/**
 * Reset a setting to parent value by removing the override
 * @param {string} settingPath - dot-notation path
 * @param {object} settings - the settings object to modify
 * @returns {object} new settings object with the override removed
 */
export const resetToParent = (settingPath, settings) => {
  const newSettings = JSON.parse(JSON.stringify(settings)); // Deep clone
  const keys = settingPath.split(".");
  const lastKey = keys.pop();

  let current = newSettings;
  for (const key of keys) {
    if (!current[key]) return settings; // Path doesn't exist
    current = current[key];
  }

  delete current[lastKey];
  return newSettings;
};

/**
 * Generate paged.js CSS from effective settings
 */
export const generatePagedJsCSS = (settings) => {
  const { layout, typography, headersFooters, advanced } = settings;

  // Determine page size
  let pageWidth, pageHeight;
  if (layout.pageSize === "CUSTOM") {
    pageWidth = `${layout.customWidth}mm`;
    pageHeight = `${layout.customHeight}mm`;
  } else {
    const preset = PAGE_SIZE_PRESETS[layout.pageSize];
    pageWidth = `${layout.orientation === "landscape" ? preset.height : preset.width}mm`;
    pageHeight = `${layout.orientation === "landscape" ? preset.width : preset.height}mm`;
  }

  let css = `
    @page {
      size: ${pageWidth} ${pageHeight};
      margin-top: ${layout.marginTop}mm;
      margin-bottom: ${layout.marginBottom}mm;
      margin-left: ${layout.marginLeft}mm;
      margin-right: ${layout.marginRight}mm;
      
      ${
        headersFooters.headerEnabled
          ? `
        @top-left { 
          content: "${headersFooters.headerLeft}"; 
          font-family: ${headersFooters.headerFontFamily};
          font-size: ${headersFooters.headerFontSize}pt;
        }
        @top-center { 
          content: "${headersFooters.headerCenter}"; 
          font-family: ${headersFooters.headerFontFamily};
          font-size: ${headersFooters.headerFontSize}pt;
        }
        @top-right { 
          content: "${headersFooters.headerRight}"; 
          font-family: ${headersFooters.headerFontFamily};
          font-size: ${headersFooters.headerFontSize}pt;
        }
      `
          : ""
      }
      
      ${
        headersFooters.footerEnabled
          ? `
        @bottom-left { 
          content: "${headersFooters.footerLeft}"; 
          font-family: ${headersFooters.footerFontFamily};
          font-size: ${headersFooters.footerFontSize}pt;
        }
        @bottom-center { 
          content: "${headersFooters.footerCenter}"; 
          font-family: ${headersFooters.footerFontFamily};
          font-size: ${headersFooters.footerFontSize}pt;
        }
        @bottom-right { 
          content: "${headersFooters.footerRight}"; 
          font-family: ${headersFooters.footerFontFamily};
          font-size: ${headersFooters.footerFontSize}pt;
        }
      `
          : ""
      }
    }
    
    ${
      headersFooters.differentFirstPage
        ? `
      @page :first {
        @top-left { content: none; }
        @top-center { content: none; }
        @top-right { content: none; }
        @bottom-left { content: none; }
        @bottom-center { content: none; }
        @bottom-right { content: none; }
      }
    `
        : ""
    }

    body {
      font-family: ${typography.fontFamily};
      font-size: ${typography.fontSize}pt;
      line-height: ${typography.lineHeight};
      text-align: ${typography.alignment};
      background-color: ${advanced.backgroundColor};
      ${
        advanced.borderStyle !== "none"
          ? `
        border: ${advanced.borderWidth}px ${advanced.borderStyle} ${advanced.borderColor};
        border-radius: ${advanced.borderRadius}px;
      `
          : ""
      }
    }

    p {
      margin-top: ${typography.paragraphSpaceBefore}pt;
      margin-bottom: ${typography.paragraphSpaceAfter}pt;
      ${typography.firstLineIndent ? `text-indent: ${typography.firstLineIndentValue}pt;` : ""}
      ${typography.hyphenation ? "hyphens: auto;" : "hyphens: none;"}
      ${
        typography.widowOrphanControl
          ? `
        widows: ${typography.widowOrphanLines};
        orphans: ${typography.widowOrphanLines};
      `
          : ""
      }
    }

    ${
      typography.dropCaps
        ? `
      p:first-of-type::first-letter {
        font-size: ${typography.dropCapsLines * typography.fontSize}pt;
        font-family: ${typography.dropCapsFont};
        float: left;
        line-height: ${typography.dropCapsLines * typography.lineHeight};
        margin-right: 0.1em;
      }
    `
        : ""
    }

    ${
      layout.columns > 1
        ? `
      .content {
        column-count: ${layout.columns};
        column-gap: ${layout.columnGap}mm;
        ${layout.columnRule ? `column-rule: 1px solid #ccc;` : ""}
      }
    `
        : ""
    }

    img {
      max-width: ${advanced.imageMaxWidth}%;
      display: block;
      margin-left: ${advanced.imageAlignment === "center" ? "auto" : advanced.imageAlignment === "right" ? "auto" : "0"};
      margin-right: ${advanced.imageAlignment === "center" ? "auto" : advanced.imageAlignment === "left" ? "auto" : "0"};
    }

    figcaption {
      font-style: ${advanced.imageCaptionStyle === "italic" ? "italic" : "normal"};
      text-align: center;
      font-size: ${typography.fontSize * 0.9}pt;
    }
  `;

  return css;
};

/**
 * Convert setting value to display format
 */
export const formatSettingValue = (value, type) => {
  if (type === "boolean") {
    return value ? "Yes" : "No";
  }
  if (type === "number") {
    return value.toString();
  }
  return value;
};

/**
 * Get all page types from compile config
 */
export const getPageTypes = (compileConfig) => {
  const types = new Set();
  compileConfig.forEach((config) => {
    types.add(config.type);
  });
  return Array.from(types);
};
