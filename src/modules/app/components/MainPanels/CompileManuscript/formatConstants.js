// Page size presets in mm
export const PAGE_SIZE_PRESETS = {
  A4: { width: 210, height: 297, label: "A4 (210 × 297 mm)" },
  A5: { width: 148, height: 210, label: "A5 (148 × 210 mm)" },
  LETTER: { width: 215.9, height: 279.4, label: "Letter (8.5 × 11 in)" },
  LEGAL: { width: 215.9, height: 355.6, label: "Legal (8.5 × 14 in)" },
  CUSTOM: { width: 210, height: 297, label: "Custom" },
};

// Default formatting settings (global)
export const DEFAULT_FORMAT_SETTINGS = {
  layout: {
    pageSize: "A4",
    customWidth: 210,
    customHeight: 297,
    orientation: "portrait", // portrait | landscape
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 25,
    marginRight: 25,
    marginGutter: 0,
    columns: 1,
    columnGap: 10,
    columnRule: false,
  },
  typography: {
    fontFamily: "Georgia, serif",
    fontSize: 12,
    lineHeight: 1.5,
    paragraphSpaceBefore: 0,
    paragraphSpaceAfter: 12,
    firstLineIndent: true,
    firstLineIndentValue: 15,
    alignment: "justify", // left | right | center | justify
    hyphenation: true,
    widowOrphanControl: true,
    widowOrphanLines: 2,
    dropCaps: false,
    dropCapsLines: 3,
    dropCapsFont: "Georgia, serif",
    // New list styling
    list: {
      bulletChar: "•", // •, –, *, etc.
      listIndent: 20, // in points
      orderedListStyle: "decimal", // decimal | lower-roman | upper-roman | lower-alpha | upper-alpha
    },
    // New block quote styling
    blockQuote: {
      indentLeft: 30,
      indentRight: 30,
      fontStyle: "italic", // normal | italic | oblique
      borderLeft: {
        style: "solid", // none | solid | dashed | dotted
        width: 2,
        color: "#cccccc",
      },
    },
  },
  headersFooters: {
    headerEnabled: false,
    footerEnabled: true,
    headerLeft: "",
    headerCenter: "{title}",
    headerRight: "",
    footerLeft: "{author}",
    footerCenter: "",
    footerRight: "{pageNumber}",
    differentFirstPage: true,
    differentOddEven: false,
    headerFontFamily: "Georgia, serif",
    headerFontSize: 10,
    footerFontFamily: "Georgia, serif",
    footerFontSize: 10,
    headerMarginFromEdge: 15,
    footerMarginFromEdge: 15,
  },
  pageNumbers: {
    enabled: true,
    position: "bottom-right", // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    format: "decimal", // decimal | roman | letter
    startAt: 1,
    showOnFirstPage: false,
  },
  sectionBreaks: {
    pageBreakBefore: "auto", // auto | always | odd | even | none
    pageBreakAfter: "auto", // auto | always | odd | even | none
    // New blank page insertion
    insertBlankPageBefore: false,
    insertBlankPageAfter: false,
  },
  // New title formatting (applies to any page type unless overridden)
  titleFormat: {
    prefix: "", // e.g., "Chapter "
    numberStyle: "arabic", // arabic | roman | word
    suffix: ": ",
    includeTitle: true,
    titleCase: "as-is", // as-is | uppercase | capitalize
  },
  advanced: {
    borderStyle: "none", // none | solid | dashed | dotted
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 0,
    backgroundColor: "#ffffff",
    backgroundImage: "",
    // Enhanced footnotes
    footnotes: {
      style: "superscript", // superscript | bracket | paren
      placement: "footnote", // footnote | endnote
      numberFormat: "decimal", // decimal | roman | letter
      separatorLine: "partial", // none | partial | full
      continuationNotices: true,
    },
    // Table of Contents
    tocInclude: true,
    tocDepth: 3,
    tocLeaderDots: true,
    // Images
    imageMaxWidth: 100, // percentage
    imageAlignment: "center", // left | center | right
    imageCaptionStyle: "italic",
    // Text transforms (smart punctuation)
    transforms: {
      smartQuotes: true,
      replaceDashes: true, // -- → em dash
      ellipsis: true, // ... → …
    },
  },
  specialElements: {
    // Title page specific
    titlePageCentered: true,
    titlePageFontSize: 24,
    titlePageSpacing: 30,
    // Part divider specific
    partDividerCentered: true,
    partDividerFontSize: 18,
    partDividerPageBreak: true,
    // Epigraph specific
    epigraphAlignment: "right",
    epigraphFontSize: 11,
    epigraphItalic: true,
  },
};

// Font options (unchanged, but included for completeness)
export const FONT_FAMILIES = [
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Garamond, serif", label: "Garamond" },
  { value: "'Palatino Linotype', serif", label: "Palatino" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "Verdana, sans-serif", label: "Verdana" },
];

// Alignment options
export const ALIGNMENT_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "center", label: "Center" },
  { value: "justify", label: "Justify" },
];

// Page number positions
export const PAGE_NUMBER_POSITIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

// Number format options
export const NUMBER_FORMATS = [
  { value: "decimal", label: "1, 2, 3..." },
  { value: "roman", label: "i, ii, iii..." },
  { value: "letter", label: "a, b, c..." },
];

// Page break options
export const PAGE_BREAK_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "always", label: "Always" },
  { value: "odd", label: "Odd Page" },
  { value: "even", label: "Even Page" },
  { value: "none", label: "None" },
];

// Border style options
export const BORDER_STYLES = [
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

// Helper variables for header/footer
export const HEADER_FOOTER_VARIABLES = [
  { value: "{title}", label: "Title" },
  { value: "{author}", label: "Author" },
  { value: "{pageNumber}", label: "Page Number" },
  { value: "{totalPages}", label: "Total Pages" },
  { value: "{chapterTitle}", label: "Chapter Title" },
  { value: "{date}", label: "Date" },
];

// Settings categories for UI organization
export const SETTINGS_CATEGORIES = [
  { key: "layout", label: "Page Layout", icon: "icon-[mdi--page-layout-body]" },
  { key: "typography", label: "Typography", icon: "icon-[mdi--format-text]" },
  { key: "headersFooters", label: "Headers & Footers", icon: "icon-[mdi--page-layout-header-footer]" },
  { key: "pageNumbers", label: "Page Numbers", icon: "icon-[mdi--numeric]" },
  { key: "sectionBreaks", label: "Section Breaks", icon: "icon-[mdi--page-next-outline]" },
  { key: "titleFormat", label: "Title Format", icon: "icon-[mdi--format-title]" },
  { key: "advanced", label: "Advanced", icon: "icon-[mdi--cog]" },
  { key: "specialElements", label: "Special Elements", icon: "icon-[mdi--star]" },
];

// Additional constants for new options
export const NUMBER_STYLE_OPTIONS = [
  { value: "arabic", label: "1, 2, 3" },
  { value: "roman", label: "I, II, III" },
  { value: "word", label: "One, Two, Three" },
];

export const TITLE_CASE_OPTIONS = [
  { value: "as-is", label: "As in document" },
  { value: "uppercase", label: "ALL CAPS" },
  { value: "capitalize", label: "Capitalize Each Word" },
];

export const FOOTNOTE_PLACEMENT_OPTIONS = [
  { value: "footnote", label: "Bottom of page" },
  { value: "endnote", label: "End of document/chapter" },
];

export const LIST_STYLE_OPTIONS = [
  { value: "decimal", label: "1, 2, 3" },
  { value: "lower-roman", label: "i, ii, iii" },
  { value: "upper-roman", label: "I, II, III" },
  { value: "lower-alpha", label: "a, b, c" },
  { value: "upper-alpha", label: "A, B, C" },
];