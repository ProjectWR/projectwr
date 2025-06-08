import { Avatar } from "@mantine/core";
import { handleLogin, handleLogout } from "../../../lib/auth/auth";
import { oauthStore } from "../../../stores/oauthStore";
import {
  DetailsPanelButton,
  DetailsPanelButtonsShell,
} from "../../LayoutComponents/DetailsPanel/DetailsPanelButton";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";

export const OauthComponent = ({}) => {
  const { deviceType } = useDeviceType();

  const userProfile = oauthStore((state) => state.userProfile);
  const accessTokenState = oauthStore((state) => state.accessTokenState);

  console.log("OAUTH STATES: ", userProfile, accessTokenState);

  const loggedIn = userProfile && accessTokenState;

  return (
    <section
      id="OauthButtonsContainer"
      className="w-full h-fit grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 px-6"
      style={
        deviceType === "desktop" && {
          maxWidth: `100%`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.25)`,
        }
      }
    >
      <DetailsPanelButton
        onClick={() => {
          if (!loggedIn) {
            handleLogin();
          }
        }}
        loading={false}
        icon={
          !loggedIn ? (
            <span className="icon-[logos--google-drive] w-[85%] h-[85%]"></span>
          ) : (
            <Avatar
              src={userProfile?.picture ?? ""}
              size="sm"
              name={userProfile?.name ?? "default"}
            />
          )
        }
        text={`Google Drive`}
      />
      <DetailsPanelButton
        onClick={() => {
          handleLogout();
        }}
        loading={false}
        icon={
          <span className="icon-[logos--microsoft-onedrive] w-full h-full"></span>
        }
        text={`Onedrive`}
      />{" "}
      <DetailsPanelButton
        onClick={() => {}}
        loading={false}
        icon={<span className="icon-[logos--dropbox] w-[85%] h-[85%]"></span>}
        text={`Dropbox`}
      />
    </section>
  );
};
