// Separate default preferences for desktop
const TiptapDesktopDefaultPreferences = {
  paperPreferences: {
    width: 55,
    gapTop: 1,
    paddingTop: 5, // Updated from marginTop
    paddingLeft: 6, // Updated from marginLeft
    paddingRight: 6, // Updated from marginRight
    paddingBottom: 70, // Updated from marginBottom
    font: "serif",
    fontSize: 1.25,
    lineHeight: 1.75,
    marginBottom: 0,
    backgroundColor: "#121212",

    paperBorderWidth: 1,
    paperBorderColor: "#525252",
    paperColor: "#171717",
    roundRadius: 0.5,
    paperShadow: "xl",
    paperShadowColor: "#000",

    h1FontSize: 1.25 * 2,
    h1LineHeight: 1.75 * 2,
    h1MarginBottom: 1.75,

    h2FontSize: 1.25 * 1.5,
    h2LineHeight: 1.75 * 1.5,
    h2MarginBottom: 1.75 * 0.75,

    h3FontSize: 1.25 * 1.3,
    h3LineHeight: 1.75 * 1.3,
    h3MarginBottom: 1.75 * 0.65,

    h4FontSize: 1.25 * 1.2,
    h4LineHeight: 1.75 * 1.2,
    h4MarginBottom: 1.75 * 0.55,

    h5FontSize: 1.25 * 1.1,
    h5LineHeight: 1.75 * 1.1,
    h5MarginBottom: 1.75 * 0.45,

    listPaddingLeft: 1,
    listMarginTop: 0.25,
    listMarginBottom: 1.25,
    hrMarginTop: 2,
    hrMarginBottom: 2,
    hrBorderColor: "#262626",

    blockquotePadding: "2",
    blockquoteBorderColor: "#262626",
  },
  toolbarPreferences: {
    toolbarHeight: 2.6,
    toolbarButtonHeight: 2.3,
    toolbarBorderWidth: 0.0625,
    textFormatButtonWidth: 12,
    marginTop: 0.25,
    marginBottom: 0.25,
    marginLeft: 0.25,
    marginRight: 0.25,
    buttonHeight: 2.3,
    buttonWidth: 2.5,
    buttonRadius: 0.5,
    buttonGap: 0.25,
    backgroundColor: "#171717",
    buttonColor: "#171717",
    dividerColor: "#262626",
    hoverColor: "#121212",
    pressedColor: "#080808",
  },
};

// Mobile preferences updated with padding
const TiptapMobileDefaultPreferences = {
  paperPreferences: {
    width: 55,
    gapTop: 0,
    paddingTop: 1.2, // Updated from marginTop
    paddingLeft: 1.2, // Updated from marginLeft
    paddingRight: 1.2, // Updated from marginRight
    paddingBottom: 12, // Updated from marginBottom
    font: "serif",
    fontSize: 1.1,
    lineHeight: 1.5,
    backgroundColor: "#171717",
    paperBorderWidth: 1,
    paperColor: "#171717",
    paperBorderColor: "#525252",
    roundRadius: 0,
    paperShadow: "none",
    paperShadowColor: "#000",

    h1FontSize: 1.1 * 2,
    h1LineHeight: 1.5 * 2,
    h1MarginBottom: 1.5,

    h2FontSize: 1.1 * 1.5,
    h2LineHeight: 1.5 * 1.5,
    h2MarginBottom: 1.5 * 0.75,

    h3FontSize: 1.1 * 1.3,
    h3LineHeight: 1.5 * 1.3,
    h3MarginBottom: 1.5 * 0.65,

    h4FontSize: 1.1 * 1.2,
    h4LineHeight: 1.5 * 1.2,
    h4MarginBottom: 1.5 * 0.55,

    h5FontSize: 1.1 * 1.1,
    h5LineHeight: 1.5 * 1.1,
    h5MarginBottom: 1.5 * 0.45,

    listPaddingLeft: 1,
    listMarginTop: 1.25,
    listMarginBottom: 1.25,
    hrMarginTop: 2,
    hrMarginBottom: 2,
    hrBorderColor: "white",

    blockquotePadding: "2",
    blockquoteBorderColor: "#262626",
  },
  toolbarPreferences: {
    toolbarHeight: 2.8,
    toolbarButtonHeight: 2.3,
    marginTop: 0.25,
    marginBottom: 0.25,
    marginLeft: 0.25,
    marginRight: 0.25,
    buttonHeight: 2.3,
    buttonWidth: 3,
    backgroundColor: "#171717",
    buttonColor: "#171717",
    dividerColor: "#232323",
    textFormatButtonWidth: 10,
    hoverColor: "#121212",
    pressedColor: "#080808",
  },
};

export const TipTapEditorDefaultPreferences = {
  desktopDefaultPreferences: TiptapDesktopDefaultPreferences,
  mobileDefaultPreferences: TiptapMobileDefaultPreferences,
};
