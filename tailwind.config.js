import {
  scrollbarGutter,
  scrollbarWidth,
  scrollbarColor,
} from "tailwind-scrollbar-utilities";
import { addIconSelectors } from "@iconify/tailwind";
import { addDynamicIconSelectors } from "@iconify/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", "class"],
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
  ],
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        shadow: {
          DEFAULT: "hsl(var(--shadow))",
          partial: "hsl(var(--shadow-partial))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        toolbar: "hsl(var(--toolbar))",
        border: {
          DEFAULT: "hsl(var(--border))",
          bright: "hsl(var(--border-bright))",
        },
        input: {
          DEFAULT: "hsl(var(--input))",
          background: "hsl(var(--input-background))",
        },
        ring: "hsl(var(--ring))",
        text: {
          DEFAULT: "hsl(var(--text))",
          ambient: "hsl(var(--text-ambient))",
          muted: "hsl(var(--text-muted))",
        },
        hover: "hsl(var(--hover))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
