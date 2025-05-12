import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { MantineProvider, createTheme } from "@mantine/core";

import "./index.css";

/* 2. Import Mantine styles defined in `mantine` layer */
import '@mantine/core/styles.layer.css'


import App from "./App.jsx";

const theme = createTheme({
  activeClassName: "",
});

createRoot(document.getElementById("root")).render(
  <>
    <MantineProvider cssVariablesSelector={`:root${":not(#\\#)".repeat(3)}`} theme={theme}>
      <App />
    </MantineProvider>
  </>
);
