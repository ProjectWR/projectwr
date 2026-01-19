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
import {
  HoverListDivider,
  HoverListHeader,
  ListShell,
} from "../../LayoutComponents/HoverListShell";

export const OauthComponent = ({}) => {
  const { deviceType } = useDeviceType();

  const userProfile = oauthStore((state) => state.userProfile);
  const accessTokenState = oauthStore((state) => state.accessTokenState);

  console.log("OAUTH STATES: ", userProfile, accessTokenState);

  const loggedIn = userProfile && accessTokenState;

  return (
    <ListShell className={`h-full w-full min-w-0 bg-appBackgroundAccent`}>
      <HoverListHeader className={"gap-4"}>
        <span>Drive Backup</span>
      </HoverListHeader>

      <HoverListDivider />

      <section className="flex gap-2 w-full h-fit px-2">
        <div className="h-full w-1/2 flex flex-col items-center justify-center gap-2">
          <div className="h-[75%] w-full flex flex-col items-center justify-center gap-2">
            <AnimatePresence>
              {loggedIn && (
                <>
                  <div className="w-fit h-fit flex items-center justify-center gap-3">
                    <div className="h-[5.5rem] w-[5.5rem] flex items-center justify-center">
                      <span className="icon-[logos--google-drive] w-[80%] h-[80%]"></span>
                    </div>
                    <div className="h-[5.5rem] w-[5.5rem] flex items-center justify-center">
                      <Avatar
                        src={userProfile?.picture ?? ""}
                        size="90%"
                        name={userProfile?.name ?? "default"}
                      />
                    </div>
                  </div>
                  <span className="w-full text-center">
                    {userProfile.email}
                  </span>
                </>
              )}
              {!loggedIn && (
                <>
                  <div className="h-[5.5rem] w-[5.5rem] flex items-center justify-center">
                    <Avatar src={""} size="85%" name={"default"} />
                  </div>
                  <span className="w-full text-center">Not logged in</span>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-fit py-2 w-1/2 flex flex-col gap-2">
          {" "}
          <AnimatePresence>
            {!loggedIn && (
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
                    : "Sync via Google Drive"
                }
              />
            )}
            {loggedIn && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: `100%` }}
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
                  className={`h-full w-full p-2 text-appLayoutText border border-appLayoutBorder rounded-lg overflow-hidden flex items-center`}
                >
                  <span className="h-fit grow min-w-0">
                    {" "}
                    Log out of Google Drive
                  </span>
                  <span className="icon-[ion--exit-outline] w-[2rem] h-[2rem]"></span>
                </GrainyElementButton>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-[3rem] w-full"></div>
          <div className="h-[3rem] w-full"></div>
        </div>
      </section>
    </ListShell>
  );
};
