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

function App() {
  const accessTokenState = oauthStore((state) => state.accessTokenState);

  // // check the offline data for access token
  // useEffect(() => {
  //   handleInitialLogin().catch((err) => {
  //     console.log(err);
  //   });
  // }, []);

  // // to generate a port and listen to it
  // useEffect(() => {
  //   listen_for_auth_code({
  //     onSucess: (code) => {
  //       console.log(code, "code generated");
  //       if (code) {
  //         saveAuthCode(code).then(() => {
  //           console.log("code saved");
  //         });
  //         getAccessToken(code).then((accessTokenBody) => {
  //           handleLoadFrom(accessTokenBody);
  //         });
  //       }
  //     },
  //     onError: (err) => {
  //       console.log(err);

  //     },
  //   });
  // }, []);

  useEffect(() => {
    if (!accessTokenState && driveOrchestrator.getManager("googleDrive")) {
      driveOrchestrator.stopSync("googleDrive");
    }
  }, [accessTokenState])

  return (
    <DeviceTypeProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <WritingApp key={"WritingApp"} />
      </ThemeProvider>
    </DeviceTypeProvider>
  );
}

export default App;
