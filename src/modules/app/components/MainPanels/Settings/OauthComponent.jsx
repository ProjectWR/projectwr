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
        <span>Periodic Drive Backup</span>
      </HoverListHeader>

      <HoverListDivider />

      <section className="flex items-start gap-2 w-full h-fit px-2">
        {loggedIn && (
          <div className="h-fit grow basis-0 min-w-0 flex flex-col items-center justify-center gap-2">
            <div className="h-fit py-3 w-full flex flex-col items-center justify-center gap-2">
              <AnimatePresence>
                {loggedIn && (
                  <>
                    <div className="w-fit h-fit flex items-center justify-center gap-3">
                      <div className="h-oauthAvatarSize w-oauthAvatarSize flex items-center justify-center">
                        <span className="icon-[logos--google-drive] w-[80%] h-[80%]"></span>
                      </div>
                      <div className="h-oauthAvatarSize w-oauthAvatarSize flex items-center justify-center">
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
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="h-fit grow basis-0 min-w-0 flex flex-col gap-2">
          {" "}
          <AnimatePresence>
            {!loggedIn && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: `100%` }}
                exit={{ opacity: 0, width: 0 }}
                className="w-full flex flex-wrap py-2 gap-1"
              >
                <button
                  onClick={() => {
                    if (!loggedIn) {
                      handleLogin();
                    }
                  }}
                  className="w-fit h-fit text-libraryDirectoryBookNodeFontSize flex items-center gap-2 px-2 py-1 border rounded-md border-appLayoutBorder hover:bg-appLayoutInverseHover"
                >
                  <span className="icon-[logos--google-drive]  w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize"></span>
                  Sync via Google Drive
                </button>
                <span className="w-fit h-fit text-libraryDirectoryBookNodeFontSize flex items-center gap-2 px-2 py-1 border rounded-md border-appLayoutBorder text-appLayoutTextMuted">
                  More integrations coming soon...
                </span>
              </motion.div>
            )}
            {loggedIn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-wrap px-4 mt-1 gap-1"
              >
                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="w-fit h-fit text-libraryDirectoryBookNodeFontSize flex items-center gap-2 px-2 py-1 border rounded-md border-appLayoutBorder hover:bg-appLayoutInverseHover"
                >
                  <span className="icon-[ion--exit-outline]  w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize"></span>
                  Log out of Google Drive
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="w-fit h-fit text-libraryDirectoryBookNodeFontSize flex items-center gap-2 px-2 py-1 border rounded-md border-appLayoutBorder hover:bg-appLayoutInverseHover"
                >
                  <span className="icon-[mdi--table-of-contents]  w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize"></span>
                  Manage your drive libraries
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="w-fit h-fit text-libraryDirectoryBookNodeFontSize flex text-nowrap items-center gap-2 px-2 py-1 border rounded-md border-appLayoutBorder hover:bg-appLayoutInverseHover"
                >
                  <span className="icon-[material-symbols-light--cloud-outline] text-nowrap  w-libraryDirectoryBookNodeIconSize h-libraryDirectoryBookNodeIconSize"></span>
                  Get real-time sync across all devices
                </button>
                {/* <GrainyElementButton
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
                </GrainyElementButton> */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </ListShell>
  );
};
