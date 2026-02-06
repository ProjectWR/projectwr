import { useEffect } from "react";
import { DeviceTypeProvider } from "./modules/app/ConfigProviders/DeviceTypeProvider";
import { ThemeProvider } from "./modules/app/ConfigProviders/ThemeProvider";
import WritingApp from "./modules/app/components/WritingApp";
import {
  getAccessToken,
  handleInitialLogin,
  handleLoadFrom,
  saveAuthCode,
} from "./modules/app/lib/auth/auth";
import { listen_for_auth_code } from "./modules/app/lib/auth/eventlisteners";
import { oauthStore } from "./modules/app/stores/oauthStore";
import driveOrchestrator from "./modules/app/lib/drive/driveOrchestrator";
import { getCurrentWindow } from "@tauri-apps/api/window";

function App() {
  const accessTokenState = oauthStore((state) => state.accessTokenState);
  const setAccessTokenState = oauthStore((state) => state.setAccessTokenState);
  const setProfile = oauthStore((state) => state.setProfile);

  useEffect(() => {
    if (!accessTokenState && driveOrchestrator.getManager("googleDrive")) {
      driveOrchestrator.stopSync("googleDrive");
    }
  }, [accessTokenState]);

  useEffect(() => {
    return () => {
      driveOrchestrator.stopSync("googleDrive");
      setAccessTokenState(null);
      setProfile(null);
    };
  }, [setAccessTokenState, setProfile]);

  return (
    <DeviceTypeProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <WritingApp key={"WritingApp"} />
      </ThemeProvider>
    </DeviceTypeProvider>
  );
}

export default App;
