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

export const ALIGN_H_OPTIONS = [
  { value: "inherit", label: "Inherit (Default)" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export const ALIGN_V_OPTIONS = [
  { value: "inherit", label: "Inherit (Default)" },
  { value: "top", label: "Top" },
  { value: "middle", label: "Middle" },
  { value: "bottom", label: "Bottom" },
];

export const NUMBER_FORMATS = [
  { value: "decimal", label: "1, 2, 3" },
  { value: "upper-roman", label: "I, II, III" },
  { value: "lower-roman", label: "i, ii, iii" },
  { value: "upper-alpha", label: "A, B, C" },
  { value: "lower-alpha", label: "a, b, c" },
];

export const HEADER_FOOTER_VARIABLES = [
  { value: "", label: "None" },
  { value: "{title}", label: "Manuscript Title" },
  { value: "{author}", label: "Author Name" },
  { value: "{chapterTitle}", label: "Chapter Title" },
  { value: "{page}", label: "Page Number" },
  { value: "{pages}", label: "Total Pages" },
  { value: "{date}", label: "Current Date" },
  { value: "{contact}", label: "Contact Info" },
  { value: "{words}", label: "Word Count" },
  { value: "{words100}", label: "Word Count (rounded to 100)" },
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
    breakBefore: "page", // auto | page | avoid | left | right
    breakAfter: "auto", // auto | page | avoid | left | right
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
  marginHeaderFooters: {
    enabled: true,
    fontFamily: "Inter",
    headerSize: 9,
    headerLineHeight: 1.2,
    footerSize: 9,
    footerLineHeight: 1.2,
    verticalAlign: "middle", // top | middle | bottom
    // Top boxes
    topLeftCorner: "",
    topLeftCornerHAlign: "inherit",
    topLeftCornerVAlign: "inherit",
    topLeftCornerPaddingTop: 0,
    topLeftCornerPaddingBottom: 0,
    topLeftCornerPaddingLeft: 0,
    topLeftCornerPaddingRight: 0,
    topLeft: "",
    topLeftHAlign: "inherit",
    topLeftVAlign: "inherit",
    topLeftPaddingTop: 0,
    topLeftPaddingBottom: 0,
    topLeftPaddingLeft: 0,
    topLeftPaddingRight: 0,
    topCenter: "",
    topCenterHAlign: "inherit",
    topCenterVAlign: "inherit",
    topCenterPaddingTop: 0,
    topCenterPaddingBottom: 0,
    topCenterPaddingLeft: 0,
    topCenterPaddingRight: 0,
    topRight: "",
    topRightHAlign: "inherit",
    topRightVAlign: "inherit",
    topRightPaddingTop: 0,
    topRightPaddingBottom: 0,
    topRightPaddingLeft: 0,
    topRightPaddingRight: 0,
    topRightCorner: "",
    topRightCornerHAlign: "inherit",
    topRightCornerVAlign: "inherit",
    topRightCornerPaddingTop: 0,
    topRightCornerPaddingBottom: 0,
    topRightCornerPaddingLeft: 0,
    topRightCornerPaddingRight: 0,
    // Bottom boxes
    bottomLeftCorner: "",
    bottomLeftCornerHAlign: "inherit",
    bottomLeftCornerVAlign: "inherit",
    bottomLeftCornerPaddingTop: 0,
    bottomLeftCornerPaddingBottom: 0,
    bottomLeftCornerPaddingLeft: 0,
    bottomLeftCornerPaddingRight: 0,
    bottomLeft: "",
    bottomLeftHAlign: "inherit",
    bottomLeftVAlign: "inherit",
    bottomLeftPaddingTop: 0,
    bottomLeftPaddingBottom: 0,
    bottomLeftPaddingLeft: 0,
    bottomLeftPaddingRight: 0,
    bottomCenter: "{page}",
    bottomCenterHAlign: "inherit",
    bottomCenterVAlign: "inherit",
    bottomCenterPaddingTop: 0,
    bottomCenterPaddingBottom: 0,
    bottomCenterPaddingLeft: 0,
    bottomCenterPaddingRight: 0,
    bottomRight: "",
    bottomRightHAlign: "inherit",
    bottomRightVAlign: "inherit",
    bottomRightPaddingTop: 0,
    bottomRightPaddingBottom: 0,
    bottomRightPaddingLeft: 0,
    bottomRightPaddingRight: 0,
    bottomRightCorner: "",
    bottomRightCornerHAlign: "inherit",
    bottomRightCornerVAlign: "inherit",
    bottomRightCornerPaddingTop: 0,
    bottomRightCornerPaddingBottom: 0,
    bottomRightCornerPaddingLeft: 0,
    bottomRightCornerPaddingRight: 0,
    // Left boxes
    leftTop: "",
    leftTopHAlign: "inherit",
    leftTopVAlign: "inherit",
    leftTopPaddingTop: 0,
    leftTopPaddingBottom: 0,
    leftTopPaddingLeft: 0,
    leftTopPaddingRight: 0,
    leftBottom: "",
    leftBottomHAlign: "inherit",
    leftBottomVAlign: "inherit",
    leftBottomPaddingTop: 0,
    leftBottomPaddingBottom: 0,
    leftBottomPaddingLeft: 0,
    leftBottomPaddingRight: 0,
    // Right boxes
    rightTop: "",
    rightTopHAlign: "inherit",
    rightTopVAlign: "inherit",
    rightTopPaddingTop: 0,
    rightTopPaddingBottom: 0,
    rightTopPaddingLeft: 0,
    rightTopPaddingRight: 0,
    rightBottom: "",
    rightBottomHAlign: "inherit",
    rightBottomVAlign: "inherit",
    rightBottomPaddingTop: 0,
    rightBottomPaddingBottom: 0,
    rightBottomPaddingLeft: 0,
    rightBottomPaddingRight: 0,
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
    contactInfo: "",
    wordCount: 0,
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
  dynamicContent: {
    beforePageContent: "",
    afterPageContent: "",
  },
};

export const SETTINGS_CATEGORIES = [
  { key: "layout", label: "Layout", icon: "icon-[mdi--layout-outline]" },
  { key: "typography", label: "Typography", icon: "icon-[mdi--format-text]" },
  {
    key: "marginHeaderFooters",
    label: "Margin Header Footers",
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
    key: "dynamicContent",
    label: "Dynamic Content",
    icon: "icon-[mdi--code-tags]",
  },
  {
    key: "specialElements",
    label: "Special Elements",
    icon: "icon-[mdi--star-outline]",
  },
  { key: "metadata", label: "E-book Metadata", icon: "icon-[mdi--database]" },
];
