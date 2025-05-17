import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { MantineProvider, createTheme } from "@mantine/core";

/* 2. Import Mantine styles defined in `mantine` layer */
import "@mantine/core/styles.layer.css";
import "@mantine/tiptap/styles.css";

import "./index.css";

import App from "./App.jsx";
import { RichTextEditor } from "@mantine/tiptap";

const theme = createTheme({
  activeClassName: "",
  components: {
    RichTextEditor: RichTextEditor.extend({
      classNames: (_theme, props) => ({
        root: "bg-appBackground border border-appLayoutBorder rounded-lg px-1",
        toolbar: "bg-appBackground border-b border-appLayoutBorder",
        content: "bg-appBackground text-appLayoutText",
        controlsGroup: "bg-appBackground",
        control: "bg-appBackground border-none border-appLayoutBorder text-appLayoutText overflow-hidden"
      }),
    }),
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider
      cssVariablesSelector={`:root${":not(#\\#)".repeat(3)}`}
      theme={theme}
    >
      <App />
    </MantineProvider>
  </StrictMode>
);
