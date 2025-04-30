import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
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
      fontFamily: {
        body: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      borderWidth: {
        DEFAULT: "1px",
        0: "0",
        2: "2px",
        3: "3px",
        4: "4px",
        6: "6px",
        8: "8px",
      },
      minHeight: {
        ...defaultTheme.height,
      },
      minWidth: {
        ...defaultTheme.width,
      },
    },
  },
  plugins: [

  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  corePlugins: {
    preflight: false,
  },
}
