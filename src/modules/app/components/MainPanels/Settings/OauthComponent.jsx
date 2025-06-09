import { Avatar } from "@mantine/core";
import { handleLogin, handleLogout } from "../../../lib/auth/auth";
import { oauthStore } from "../../../stores/oauthStore";
import {
  DetailsPanelButton,
  DetailsPanelButtonsShell,
  DetailsPanelCenteredButton,
} from "../../LayoutComponents/DetailsPanel/DetailsPanelButton";
import { useDeviceType } from "../../../ConfigProviders/DeviceTypeProvider";
import { GrainyElementButton } from "../../LayoutComponents/GrainyHoverButton";
import { AnimatePresence, motion } from "motion/react";

export const OauthComponent = ({}) => {
  const { deviceType } = useDeviceType();

  const userProfile = oauthStore((state) => state.userProfile);
  const accessTokenState = oauthStore((state) => state.accessTokenState);

  console.log("OAUTH STATES: ", userProfile, accessTokenState);

  const loggedIn = userProfile && accessTokenState;

  return (
    <section
      id="OauthButtonsContainer"
      className="w-full h-fit grid grid-cols-1 gap-3 px-6"
      style={
        deviceType === "desktop" && {
          maxWidth: `100%`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.25)`,
        }
      }
    >
      <div className="h-fit flex gap-3">
        {" "}
        <DetailsPanelCenteredButton
          onClick={() => {
            if (!loggedIn) {
              handleLogin();
            }
          }}
          loading={false}
          disabled={loggedIn}
          icon={
            <span className="icon-[logos--google-drive] w-[85%] h-[85%]"></span>
          }
          rightIcon={
            loggedIn ? (
              <Avatar
                src={userProfile?.picture ?? ""}
                size="85%"
                name={userProfile?.name ?? "default"}
              />
            ) : (
              <span className="w-[85%] h-[85%]"></span>
            )
          }
          text={
            loggedIn
              ? `Logged in as ${userProfile.email}`
              : "Log into Google Drive"
          }
        />
        <AnimatePresence>
          {loggedIn && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: `4rem` }}
              exit={{ opacity: 0, width: 0 }}
              style={{
                height: `3rem`,
              }}
            >
              <GrainyElementButton
                gradientSize={100}
                gradientSizeY={10}
                onClick={() => {
                  handleLogout();
                }}
                className={`h-full w-full p-2 text-appLayoutTextMuted border border-appLayoutBorder rounded-lg overflow-hidden`}
              >
                <span className="icon-[ion--exit-outline] w-full h-full"></span>
              </GrainyElementButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <DetailsPanelCenteredButton
        onClick={() => {
          handleLogout();
        }}
        loading={false}
        icon={
          <span className="icon-[logos--microsoft-onedrive] w-full h-full"></span>
        }
        text={`Login to OneDrive`}
      />{" "}
      <DetailsPanelCenteredButton
        onClick={() => {}}
        loading={false}
        icon={<span className="icon-[logos--dropbox] w-[85%] h-[85%]"></span>}
        text={`Login to Dropbox`}
      />
    </section>
  );
};
