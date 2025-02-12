import {
  scrollbarGutter,
  scrollbarWidth,
  scrollbarColor,
} from "tailwind-scrollbar-utilities";
import { addIconSelectors } from "@iconify/tailwind";
import { addDynamicIconSelectors } from "@iconify/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  safelist: [
    "bg-zinc-200",
    "shadow-md",
    "shadow-lg",
    "dark:hover:shadow-lg",
    {
      pattern: /text-*/,
    },
    {
      pattern: /border-*/,
    },
    {
      pattern: /my-*/,
    },
    {
      pattern: /shadow-*/,
    },
    {
      pattern: /rounded-*/,
    },
    {
      pattern: /w-*/,
    },
    {
      pattern: /grow-*/,
    }
  ],
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
  theme: {
    extend: {
      colors: {
        appBackground: "hsl(var(--appBackground))",
        appLayoutBorder: "hsl(var(--appLayoutBorder))",
        appLayoutText: "hsl(var(--appLayoutText))",
        appLayoutTextMuted: "hsl(var(--appLayoutTextMuted))",
        appLayoutShadow: "hsl(var(--appLayoutShadow))",
        appLayoutGentleShadow: "hsl(var(--appLayoutGentleShadow))",
        appLayoutHover: "hsl(var(--appLayoutHover))",
        appLayoutHoverLight: "hsl(var(--appLayoutHoverLight))",
        appLayoutInverseHover: "hsl(var(--appLayoutInverseHover))",
        appLayout: "hsl(var(--appLayoutInverseHover))",
        appLayoutInputBackground: "hsl(var(--appLayoutInputBackground))",
        appLayoutPressed: "hsl(var(--appLayoutPressed))",
        appLayoutDestruct: "hsl(var(--appLayoutDestruct))",
        appLayoutHighlight: "hsl(var(--appLayoutHighlight))",
        activitySelectLine: "hsl(var(--activitySelectLine))",
        appLayoutSubmitButton: "hsl(var(--appLayoutSubmitButton))",
      },
      spacing: {
        actionBarHeight: "var(--actionBarHeight)",
        actionBarLogoSize: "var(--actionBarLogoSize)",
        activityBarWidth: "var(--activityBarWidth)",
        activityBarHeight: "var(--activityBarHeight)",
        activityButtonHeight: "var(--activityButtonHeight)",
        activityBarIconSize: "var(--activityBarIconSize)",
        sidePanelWidth: "var(--sidePanelWidth)",
        libraryManagerHeaderHeight: "var(--libraryManagerHeaderHeight)",
        libraryManagerNodeHeight: "var(--libraryManagerNodeHeight)",
        libraryManagerAddButtonSize: "var(--libraryManagerAddButtonSize)",
        libraryManagerNodeEditButtonWidth: "var(--libraryManagerNodeEditButtonWidth)",
        libraryManagerNodeIconSize: "var(--libraryManagerNodeIconSize)",
        detailsPanelHeaderHeight: "var(--detailsPanelHeaderHeight)",
        detailsPanelDescriptionInputSize: "var(--detailsPanelDescriptionInputSize)",
        detailsPanelPropLabelHeight: "var(--detailsPanelPropLabelHeight)",
        libraryDirectoryBookNodeHeight: "var(--libraryDirectoryBookNodeHeight)",
        libraryDirectoryPaperNodeHeight: "var(--libraryDirectoryPaperNodeHeight)",
        libraryDirectorySectionNodeHeight: "var(--libraryDirectorySectionNodeHeight)",
        libraryDirectoryBookNodeIconSize: "var(--libraryDirectoryBookNodeIconSize)",
        libraryDirectoryPaperNodeIconSize: "var(--libraryDirectoryPaperNodeIconSize)",
        libraryDirectorySectionNodeIconSize: "var(--libraryDirectorySectionNodeIconSize)",
        templateDetailsPanelDeviceHeaderHeight: "var(--templateDetailsPanelDeviceHeaderHeight)",
        templateDetailsPanelSectionHeaderHeight: "var(--templateDetailsPanelSectionHeaderHeight)",
        templateDetailsPreferenceInputHeight: "var(--templateDetailsPreferenceInputHeight)",
        templateDetailsPreferenceLabelWidth: "var(--templateDetailsPreferenceLabelWidth)",
        templateDetailsPreferencesColorInputSize: "var(--templateDetailsPreferencesColorInputSize)",
      },
      fontSize: {
        activityBarFontSize: "var(--activityBarFontSize)",
        libraryManagerHeaderText: "var(--libraryManagerHeaderText)",
        libraryManagerNodeText: "var(--libraryManagerNodeText)",
        detailsPanelNameFontSize: "var(--detailsPanelNameFontSize)",
        detailsPanelPropsFontSize: "var(--detailsPanelPropsFontSize)",
        detailsPanelPropLabelFontSize: "var(--detailsPanelPropLabelFontSize)",
        detailsPanelSaveButtonFontSize: "var(--detailsPanelSaveButtonFontSize)",
        libraryDirectoryBookNodeFontSize: "var(--libraryDirectoryBookNodeFontSize)",
        libraryDirectoryPaperNodeFontSize: "var(--libraryDirectoryPaperNodeFontSize)",
        libraryDirectorySectionNodeFontSize: "var(--libraryDirectorySectionNodeFontSize)",
        templateDetailsPanelPreferenceFontSize: "var(--templateDetailsPanelPreferenceFontSize)",
        templateDetailsPanelPreferenceInputFontSize: "var(--templateDetailsPanelPreferenceInputFontSize)",
      },
      fontFamily: {
        heading: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI Variable Display",
          "Segoe UI",
          "Helvetica",
          "Apple Color Emoji",
          "Arial",
          "sans-serif",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        mono: [...require("tailwindcss/defaultTheme").fontFamily.mono],
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI Variable Display",
          "Segoe UI",
          "Helvetica",
          "Apple Color Emoji",
          "Arial",
          "sans-serif",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      screens: {
        "main-hover": {
          raw: "(hover: hover)",
        },
      },
    },
  },
  plugins: [
    scrollbarGutter(), // no options to configure
    scrollbarWidth(), // no options to configure
    scrollbarColor(), // no options to configure
    addIconSelectors(["mdi", "vscode-icons"]),
    addDynamicIconSelectors(["mdi"]),
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide"),
  ],
};
