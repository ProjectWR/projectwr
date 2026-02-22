export const FONT_FAMILIES = [
  { value: "inherit", label: "Inherit (Global Typography)" },
  { value: "Inter", label: "Inter" },
  { value: "Libre Baskerville", label: "Libre Baskerville" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Lora", label: "Lora" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Courier New", label: "Courier New" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Arial", label: "Arial" },
];

export const ALIGNMENT_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justified" },
];

export const NUMBER_FORMATS = [
  { value: "arabic", label: "1, 2, 3" },
  { value: "roman-upper", label: "I, II, III" },
  { value: "roman-lower", label: "i, ii, iii" },
  { value: "alpha-upper", label: "A, B, C" },
  { value: "alpha-lower", label: "a, b, c" },
];

export const HEADER_FOOTER_VARIABLES = [
  { value: "", label: "None" },
  { value: "{title}", label: "Manuscript Title" },
  { value: "{author}", label: "Author Name" },
  { value: "{chapterTitle}", label: "Chapter Title" },
  { value: "{page}", label: "Page Number" },
  { value: "{pages}", label: "Total Pages" },
  { value: "{date}", label: "Current Date" },
];

export const PAGE_BREAK_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "page", label: "Always" },
  { value: "avoid", label: "Avoid" },
  { value: "left", label: "Always (Left Page)" },
  { value: "right", label: "Always (Right Page)" },
];

export const NUMBER_STYLE_OPTIONS = [
  { value: "arabic", label: "Arabic (1, 2, 3)" },
  { value: "roman", label: "Roman (I, II, III)" },
  { value: "word", label: "Word (One, Two, Three)" },
  { value: "none", label: "No Numbering" },
];

export const FOOTNOTE_PLACEMENT_OPTIONS = [
  { value: "page-bottom", label: "Bottom of Page" },
  { value: "section-end", label: "End of Section" },
];

export const LIST_STYLE_OPTIONS = [
  { value: "decimal", label: "1, 2, 3" },
  { value: "upper-roman", label: "I, II, III" },
  { value: "lower-roman", label: "i, ii, iii" },
  { value: "upper-alpha", label: "A, B, C" },
  { value: "lower-alpha", label: "a, b, c" },
];

export const PAGE_SIZE_PRESETS = {
  a4: { width: 210, height: 297, label: "A4 (210 x 297 mm)" },
  letter: { width: 215.9, height: 279.4, label: "Letter (8.5 x 11 in)" },
  legal: { width: 215.9, height: 355.6, label: "Legal (8.5 x 14 in)" },
  trade: { width: 152.4, height: 228.6, label: "Trade Paperback (6 x 9 in)" },
  digest: { width: 139.7, height: 215.9, label: "Digest (5.5 x 8.5 in)" },
  pocket: { width: 107.95, height: 171.45, label: "Pocket (4.25 x 6.75 in)" },
  custom: { width: 210, height: 297, label: "Custom Size" },
};

export const BORDER_STYLES = [
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

export const METADATA_IDENTIFIER_SCHEMES = [
  { value: "uuid", label: "UUID" },
  { value: "isbn", label: "ISBN" },
  { value: "doi", label: "DOI" },
  { value: "uri", label: "URI" },
];

export const METADATA_TITLE_TYPES = [
  { value: "main", label: "Main Title" },
  { value: "subtitle", label: "Subtitle" },
  { value: "short", label: "Short Title" },
  { value: "collection", label: "Collection Title" },
  { value: "edition", label: "Edition Title" },
  { value: "extended", label: "Extended Title" },
];

export const METADATA_ROLES = [
  { value: "aut", label: "Author" },
  { value: "edt", label: "Editor" },
  { value: "trl", label: "Translator" },
  { value: "ill", label: "Illustrator" },
  { value: "pht", label: "Photographer" },
  { value: "ctb", label: "Contributor" },
];

export const METADATA_SUBJECT_AUTHORITIES = [
  { value: "bisac", label: "BISAC" },
  { value: "bic", label: "BIC" },
  { value: "lcc", label: "LCC" },
  { value: "ddc", label: "DDC" },
];

export const METADATA_PROGRESSION_DIRECTIONS = [
  { value: "ltr", label: "Left-to-Right" },
  { value: "rtl", label: "Right-to-Left" },
  { value: "default", label: "Default" },
];

export const METADATA_IBOOKS_ORIENTATION = [
  { value: "none", label: "None" },
  { value: "portrait-only", label: "Portrait Only" },
  { value: "landscape-only", label: "Landscape Only" },
];

export const METADATA_IBOOKS_SCROLL = [
  { value: "vertical", label: "Vertical" },
  { value: "horizontal", label: "Horizontal" },
  { value: "default", label: "Default" },
];

export const DEFAULT_FORMAT_SETTINGS = {
  layout: {
    pageSize: "trade",
    orientation: "portrait",
    customWidth: 152.4, // mm
    customHeight: 228.6, // mm
    marginTop: 20, // mm
    marginBottom: 20, // mm
    marginLeft: 20, // mm
    marginRight: 20, // mm
    marginGutter: 0, // mm
    columns: 1,
    columnGap: 5, // mm
    columnRule: "none", // none | solid | dashed | dotted
    isSeparatePage: true,
    indentSpacingValue: 4,
  },
  typography: {
    fontFamily: "Libre Baskerville",
    fontSize: 11, // pt
    lineHeight: 1.5,
    alignment: "justify", // left | center | right | justify
    hyphenation: true,
    firstLineIndent: true,
    firstLineIndentValue: 20, // pt
    indentWidthValue: 20, // pt (general indent)
    pSpaceBefore: 0, // pt
    pSpaceAfter: 0, // pt
    list: {
      listIndent: 20,
      orderedListStyle: "decimal",
    },
  },
  headersFooters: {
    headerEnabled: true,
    headerFont: "Inter",
    headerSize: 9,
    headerLeft: "",
    headerCenter: "",
    headerRight: "{title}",
    footerEnabled: true,
    footerFont: "Inter",
    footerSize: 9,
    footerLeft: "",
    footerCenter: "{page}",
    footerRight: "",
    differentOddEven: false,
    differentFirstPage: false,
    pageNumberFormat: "arabic",
    startPageNumber: 1,
  },
  sectionBreaks: {
    pageBreakBefore: "page",
    pageBreakAfter: "auto",
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
    subtitleItalic: true,
    subtitleFontFamily: "inherit",
    subtitleFontSize: 16,
    subtitleLineHeight: 1.2,
    includeNumber: true,
    fontFamily: "inherit",
    fontSize: 24,
    lineHeight: 1.2,
    titleAlignment: "center",
    subtitleAlignment: "center",
    spacingBefore: 0,
    spacingAfter: 30,
  },
  normalTitleFormat: {
    title: "",
    useItemTitleAsTitle: true,
    subtitle: "",
    useItemTitleAsSubtitle: false,
    subtitleItalic: true,
    subtitleFontFamily: "inherit",
    subtitleFontSize: 14,
    subtitleLineHeight: 1.2,
    fontFamily: "inherit",
    fontSize: 18,
    lineHeight: 1.2,
    titleAlignment: "center",
    subtitleAlignment: "center",
    spacingBefore: 0,
    spacingAfter: 20,
  },
  advanced: {
    borderStyle: "none", // none | solid | dashed | dotted
    borderWidth: 0,
    borderColor: "#000000",
    borderRadius: 0,
    backgroundColor: "transparent",
    padding: 0,
    footnotes: {
      style: "superscript",
      placement: "page-bottom",
    },
  },
  specialElements: {
    titlePageCentered: true,
    titlePageFontSize: 36,
    titlePageSpacing: 50,
    partDividerCentered: true,
    partDividerFontSize: 28,
    partDividerPageBreak: true,
    epigraphAlignment: "right",
    epigraphFontSize: 10,
    epigraphItalic: true,
    tocInclude: true,
    tocDepth: 2,
    tocLeaderDots: true,
  },
  metadata: {
    publication: {
      language: "en-US",
      date: "",
      publisher: "",
    },
    identifier: {
      scheme: "uuid",
      value: "",
    },
    title: {
      main: "",
      subtitle: "",
      type: "main",
    },
    creator: {
      name: "",
      role: "aut",
      fileAs: "",
    },
    contributor: {
      name: "",
      role: "ctb",
    },
    subject: {
      value: "",
      authority: "bisac",
    },
    description: "",
    rights: "",
    visual: {
      coverImage: "",
      pageProgressionDirection: "default",
    },
    ibooks: {
      ipadOrientationLock: "none",
      iphoneOrientationLock: "none",
      scrollAxis: "default",
    },
    accessibility: {
      accessModes: ["textual", "visual"],
      accessibilitySummary: "",
    },
  },
};

export const SETTINGS_CATEGORIES = [
  { key: "layout", label: "Layout", icon: "icon-[mdi--layout-outline]" },
  { key: "typography", label: "Typography", icon: "icon-[mdi--format-text]" },
  {
    key: "headersFooters",
    label: "Headers & Footers",
    icon: "icon-[mdi--page-layout-header-footer]",
  },
  {
    key: "sectionBreaks",
    label: "Breaks",
    icon: "icon-[mdi--format-page-break]",
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
    icon: "icon-[mdi--star-outline]",
  },
  { key: "metadata", label: "E-book Metadata", icon: "icon-[mdi--database]" },
];
