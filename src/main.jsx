import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { MantineProvider, createTheme } from "@mantine/core";

import "./index.css";
import App from "./App.jsx";

const theme = createTheme({
  activeClassName: "",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider cssVariablesSelector={`:root${":not(#\\#)".repeat(3)}`} theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>
);
