import { DeviceTypeProvider } from "./modules/app/ConfigProviders/DeviceTypeProvider";
import { ThemeProvider } from "./modules/app/ConfigProviders/ThemeProvider";
import WritingApp from "./modules/app/components/WritingApp";

function App() {
  return (
      <DeviceTypeProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <WritingApp key={"WritingApp"} />
        </ThemeProvider>
      </DeviceTypeProvider>
  );
}

export default App;
