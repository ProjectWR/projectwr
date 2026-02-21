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
    isSeparatePage: true,
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
    indentSpacingValue: 2,
  },
  typography: {
    fontFamily: "Times New Roman, sans",
    fontSize: 12,
    lineHeight: 2.0,
    paragraphSpaceBefore: 0,
    paragraphSpaceAfter: 0,
    firstLineIndent: true,
    firstLineIndentValue: 15,
    alignment: "left", // left | right | center | justify
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
    differentOddEven: false,
    pageNumberFormat: "decimal",
    headerFontFamily: "Georgia, serif",
    headerFontSize: 10,
    footerFontFamily: "Georgia, serif",
    footerFontSize: 10,
    headerMarginFromEdge: 15,
    footerMarginFromEdge: 15,
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
    includeTitle: true,
    prefix: "", // e.g., "Chapter "
    useItemTitleAsPrefix: false,
    numberStyle: "arabic", // arabic | roman | word
    suffix: ": ",
    useItemTitleAsSuffix: false,
    subtitle: "",
    useItemTitleAsSubtitle: false,
    includeNumber: true,
  },
  normalTitleFormat: {
    title: "",
    useItemTitleAsTitle: true,
    subtitle: "",
    useItemTitleAsSubtitle: false,
  },
  advanced: {
    borderStyle: "none", // none | solid | dashed | dotted
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 0,
    backgroundColor: "#ffffff",
    // Enhanced footnotes
    footnotes: {
      style: "superscript", // superscript | bracket | paren
      placement: "footnote", // footnote | endnote
      numberFormat: "decimal", // decimal | roman | letter
      separatorLine: "partial", // none | partial | full
      continuationNotices: true,
    },
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
    // Table of Contents specific
    tocInclude: true,
    tocDepth: 3,
    tocLeaderDots: true,
  },
  metadata: {
    identifier: {
      text: "",
      scheme: "ISBN-13",
    },
    title: {
      text: "",
      fileAs: "",
      type: "main",
    },
    creator: {
      text: "",
      role: "author",
      fileAs: "",
    },
    contributor: {
      text: "",
      role: "editor",
      fileAs: "",
    },
    publication: {
      date: "",
      language: "en",
      description: "",
      type: "",
      format: "",
    },
    subject: {
      text: "",
      authority: "",
      term: "",
    },
    rights: {
      rights: "",
      relation: "",
      coverage: "",
    },
    collection: {
      belongsTo: "",
      groupPosition: "",
    },
    visual: {
      coverImage: "",
      pageProgressionDirection: "ltr",
    },
    accessibility: {
      accessModes: "textual",
      accessModeSufficient: "textual",
      hazards: "none",
      features:
        "alternativeText, readingOrder, structuralNavigation, tableOfContents",
      summary: "",
    },
    ibooks: {
      version: "1.0.0",
      specifiedFonts: false,
      ipadOrientationLock: "none",
      iphoneOrientationLock: "none",
      binding: true,
      scrollAxis: "default",
    },
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
  {
    key: "headersFooters",
    label: "Headers & Footers",
    icon: "icon-[mdi--page-layout-header-footer]",
  },

  {
    key: "sectionBreaks",
    label: "Section Breaks",
    icon: "icon-[mdi--page-next-outline]",
  },
  {
    key: "titleFormat",
    label: "Chapter Title Format",
    icon: "icon-[mdi--format-title]",
  },
  {
    key: "normalTitleFormat",
    label: "Normal Title Format",
    icon: "icon-[mdi--format-header-pound]",
  },
  { key: "advanced", label: "Advanced", icon: "icon-[mdi--cog]" },
  {
    key: "specialElements",
    label: "Special Elements",
    icon: "icon-[mdi--star]",
  },
  {
    key: "metadata",
    label: "Metadata",
    icon: "icon-[mdi--information-outline]",
  },
];

// Additional constants for new options
export const NUMBER_STYLE_OPTIONS = [
  { value: "arabic", label: "1, 2, 3" },
  { value: "roman", label: "I, II, III" },
  { value: "word", label: "One, Two, Three" },
];

export const TITLE_CASE_OPTIONS = [
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

export const METADATA_IDENTIFIER_SCHEMES = [
  "ISBN-10",
  "GTIN-13",
  "UPC",
  "ISMN-10",
  "DOI",
  "LCCN",
  "GTIN-14",
  "ISBN-13",
  "Legal deposit number",
  "URN",
  "OCLC",
  "ISMN-13",
  "ISBN-A",
  "JP",
  "OLCC",
].map((s) => ({ value: s, label: s }));

export const METADATA_TITLE_TYPES = [
  { value: "main", label: "Main Title" },
  { value: "subtitle", label: "Subtitle" },
  { value: "short", label: "Short Title" },
  { value: "collection", label: "Collection Title" },
  { value: "edition", label: "Edition Title" },
  { value: "extended", label: "Extended Title" },
];

export const METADATA_ROLES = [
  { value: "author", label: "Author" },
  { value: "editor", label: "Editor" },
  { value: "translator", label: "Translator" },
  { value: "illustrator", label: "Illustrator" },
  { value: "contributor", label: "Contributor" },
].map((r) => ({ value: r.value, label: r.label }));

export const METADATA_SUBJECT_AUTHORITIES = [
  "AAT",
  "BIC",
  "BISAC",
  "CLC",
  "DDC",
  "CLIL",
  "EuroVoc",
  "MEDTOP",
  "LCSH",
  "NDC",
  "Thema",
  "UDC",
  "WGS",
].map((a) => ({ value: a, label: a }));

export const METADATA_PROGRESSION_DIRECTIONS = [
  { value: "ltr", label: "Left-to-Right" },
  { value: "rtl", label: "Right-to-Left" },
];

export const METADATA_IBOOKS_ORIENTATION = [
  { value: "none", label: "None" },
  { value: "portrait-only", label: "Portrait Only" },
  { value: "landscape-only", label: "Landscape Only" },
];

export const METADATA_IBOOKS_SCROLL = [
  { value: "default", label: "Default" },
  { value: "vertical", label: "Vertical" },
  { value: "horizontal", label: "Horizontal" },
];
