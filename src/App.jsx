import { DeviceTypeProvider } from "./modules/app/ConfigProviders/DeviceTypeProvider";
import { SizingProvider } from "./modules/app/ConfigProviders/SizingThemeProvider";
import { ThemeProvider } from "./modules/app/ConfigProviders/ThemeProvider";
import WritingApp from "./modules/app/components/WritingApp";

function App() {
  return (
    <DeviceTypeProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SizingProvider defaultSizingMode="normal" storageKey="vite-ui-sizing">
          <WritingApp key={'WritingApp'} />
        </SizingProvider>
      </ThemeProvider>
    </DeviceTypeProvider>
  );
}

export default App;
