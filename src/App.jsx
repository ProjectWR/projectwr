import { DeviceTypeProvider } from "./modules/app/ConfigProviders/DeviceTypeProvider";
import WritingApp from "./modules/app/components/WritingApp";

function App() {
  return (
    <DeviceTypeProvider>
      <WritingApp />
    </DeviceTypeProvider>
  );
}

export default App;
