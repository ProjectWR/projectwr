// Separate default preferences for desktop
const TiptapDesktopDefaultPreferences = {
  paperPreferences: {
    width: "880px",
    gapTop: 32,
    paddingTop: 80, // Updated from marginTop
    paddingLeft: 96, // Updated from marginLeft
    paddingRight: 96, // Updated from marginRight
    paddingBottom: 1120, // Updated from marginBottom
    font: "serif",
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 0,
    backgroundColor: "#121212",

    paperBorderWidth: 1,
    paperBorderColor: "#525252",
    paperColor: "#171717",
    roundRadius: 8,
    paperShadow: 0.5,
    paperShadowColor: "#000000AA",

    h1FontSize: 40,
    h1LineHeight: 56,
    h1MarginBottom: 28,

    h2FontSize: 30,
    h2LineHeight: 42,
    h2MarginBottom: 21,

    h3FontSize: 26,
    h3LineHeight: 36.4,
    h3MarginBottom: 18.2,

    h4FontSize: 24,
    h4LineHeight: 33.6,
    h4MarginBottom: 15.4,

    h5FontSize: 22,
    h5LineHeight: 30.8,
    h5MarginBottom: 12.65,

    listPaddingLeft: 16,
    listMarginTop: 4,
    listMarginBottom: 20,
    hrMarginTop: 32,
    hrMarginBottom: 32,
    hrBorderColor: "#525252",

    blockquoteBorderWidth: 3.2,
    blockquotePadding: 32,
    blockquoteBorderColor: "#525252",
    borderImageSource: "",
    borderImageSlice: "",
    borderImageWidth: "",
    borderImageOutset: "",
    borderImageRepeat: "",
  },
  toolbarPreferences: {
    toolbarHeight: 35,
    toolbarButtonHeight: 36.8,
    toolbarBorderWidth: 1,
    textFormatButtonWidth: 192,
    toolbarGapTop: 8,
    toolbarFontSize: 20,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 4,
    marginRight: 4,
    buttonHeight: 28.8,
    buttonWidth: 33.6,
    buttonRadius: 8,
    buttonGap: 4,
    backgroundColor: "#171717",
    buttonColor: "#171717",
    borderColor: "#262626",
    dividerColor: "#262626",
    iconColor: "#a3a3a3",
    fontColor: "#a3a3a3",
    hoverColor: "#121212",
    pressedColor: "#080808",
    scrollbarThumbColor: "#676767"
  },
};

// Mobile preferences updated with padding
const TiptapMobileDefaultPreferences = {
  paperPreferences: {
    width: `100%`,
    gapTop: 0,
    paddingTop: 19.2, // Updated from marginTop
    paddingLeft: 19.2, // Updated from marginLeft
    paddingRight: 19.2, // Updated from marginRight
    paddingBottom: 192, // Updated from marginBottom
    font: "serif",
    fontSize: 17.6,
    lineHeight: 24,
    backgroundColor: "#171717",
    paperBorderWidth: 0,
    paperColor: "#171717",
    paperBorderColor: "#525252",
    roundRadius: 0,
    paperShadow: "none",
    paperShadowColor: "#000",

    h1FontSize: 35.2,
    h1LineHeight: 48,
    h1MarginBottom: 24,

    h2FontSize: 26.4,
    h2LineHeight: 36,
    h2MarginBottom: 18,

    h3FontSize: 22.88,
    h3LineHeight: 31.2,
    h3MarginBottom: 15.6,

    h4FontSize: 21.12,
    h4LineHeight: 28.8,
    h4MarginBottom: 13.2,

    h5FontSize: 19.36,
    h5LineHeight: 26.4,
    h5MarginBottom: 10.8,

    listPaddingLeft: 16,
    listMarginTop: 20,
    listMarginBottom: 20,
    hrMarginTop: 32,
    hrMarginBottom: 32,
    hrBorderColor: "white",

    blockquoteBorderWidth: 3.2,
    blockquotePadding: 32,
    blockquoteBorderColor: "#262626",
    borderImageSource: "",
    borderImageSlice: "",
    borderImageWidth: "",
    borderImageOutset: "",
    borderImageRepeat: "",
  },
  toolbarPreferences: {
    toolbarHeight: 2.8,
    toolbarButtonHeight: 2.3,
    toolbarGapTop: 0,
    marginTop: 0.25,
    marginBottom: 0.25,
    marginLeft: 0.25,
    marginRight: 0.25,
    buttonHeight: 2.3,
    buttonWidth: 3,
    backgroundColor: "#171717",
    buttonColor: "#171717",
    borderColor: "#232323",
    dividerColor: "#232323",
    iconColor: "#a3a3a3",
    fontColor: "#a3a3a3",
    textFormatButtonWidth: 10,
    hoverColor: "#121212",
    pressedColor: "#080808",
    scrollbarThumbColor: "#121212"
  },
};

export const TipTapEditorDefaultPreferences = {
  desktopDefaultPreferences: TiptapDesktopDefaultPreferences,
  mobileDefaultPreferences: TiptapMobileDefaultPreferences,
};
