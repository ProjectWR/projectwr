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
        content: "bg-appBackground text-appLayoutText  max-h-[30rem] min-h-[10rem] overflow-y-scroll px-3 py-3",
        controlsGroup: "bg-appBackground gap-1",
        control:
          "bg-appBackground border-none border-appLayoutBorder text-appLayoutText overflow-hidden hover:bg-appLayoutInverseHover hover:text-appLayoutText  data-active:bg-appLayoutPressed data-active:shadow-inner shadow-appLayoutShadow",
        
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
