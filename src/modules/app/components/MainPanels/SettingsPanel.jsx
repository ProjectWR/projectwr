import { useCallback, useMemo, useState } from "react";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { settingsStore } from "../../stores/settingsStore";
import { loadSettings, saveSettings } from "../../lib/settings";
import { AnimatePresence, motion } from "motion/react";
import { appStore } from "../../stores/appStore";

import {
  getAuth,
  validatePassword,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import firebaseApp from "../../lib/Firebase";
import GrainyButton from "../../../design-system/GrainyButton";
import { useFonts } from "../../hooks/useFonts";
import fontManager from "../../lib/font";
import { useDisclosure } from "@mantine/hooks";
import {
  Button,
  Fieldset,
  LoadingOverlay,
  Modal,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLoadingCallback } from "react-loading-hook";
import { GrainyElement } from "../../../design-system/GrainyElement";
import DetailsPanel from "../LayoutComponents/DetailsPanel.jsx/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelDivider";
import { DetailsPanelBody } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelBody";
import {
  HoverListBody,
  HoverListDivider,
  HoverListHeader,
  HoverListItem,
  HoverListShell,
  ListShell,
} from "../LayoutComponents/HoverListShell";
import useZoom from "../../hooks/useZoom";
import { round } from "lib0/math";
import { DetailsPanelNameLabel } from "../LayoutComponents/DetailsPanel.jsx/DetailsPanelNameInput";
import { useImages } from "../../hooks/useImages";
import imageManager from "../../lib/image";
import { GrainyElementButton } from "../LayoutComponents/GrainyHoverButton";

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const uppercaseRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const digitRegex = /\d/;
const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const minLengthRegex = /^.{8,}$/;
const maxLengthRegex = /^.{1,128}$/;

const SettingsPanel = () => {
  console.log("rendering settings panel");
  const { deviceType } = useDeviceType();

  const zoom = appStore((state) => state.zoom);

  const { zoomIn, zoomOut } = useZoom();

  const [isLoginOpen, loginModalControl] = useDisclosure(false);

  const [fontImageToggle, setFontImageToggle] = useState("font");

  const user = appStore((state) => state.user);
  const setUser = appStore((state) => state.setUser);

  const fonts = useFonts();
  console.log("fonts: ", fonts);

  const images = useImages();
  console.log("images: ", images);

  const settings = settingsStore((state) => state.settings);

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const loginForm = useForm({
    mode: "uncontrolled",
    onSubmitPreventDefault: "always",
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const [handleLoginWithEmailAndPassword, isEmailLoading, loginError] =
    useLoadingCallback(async ({ email, password }) => {
      await signInWithEmailAndPassword(getAuth(firebaseApp), email, password);
    });

  const logoutUser = useCallback(async () => {
    try {
      setIsLogoutLoading(true);
      await getAuth(firebaseApp).signOut();
      setIsLogoutLoading(false);
    } catch {
      setIsLogoutLoading(false);
    }
  }, []);

  console.log("settings: ", settings);

  return (
    <DetailsPanel>
      <DetailsPanelBody>
        <Modal
          opened={isLoginOpen}
          onClose={loginModalControl.close}
          withCloseButton={false}
          p={0}
          zIndex={1000}
          size="auto"
          classNames={{
            root: "bg-transparent",
            content: "bg-transparent",
            body: "bg-transparent",
          }}
          centered
        >
          {/* Modal content */}
          <form
            className="h-fit w-fit md:w-fit mx-auto relative"
            onSubmit={loginForm.onSubmit(handleLoginWithEmailAndPassword)}
          >
            <LoadingOverlay
              visible={isEmailLoading}
              zIndex={1000}
              overlayProps={{ blur: 0, opacity: 0 }}
            />

            <Fieldset
              variant="unstyled"
              legend="Log in to Tulip Writer"
              classNames={{
                legend:
                  "text-3xl pb-1 px-2 mx-auto font-light text-appLayoutText",
                root: "md:border border border-appLayoutBorder rounded-xl overflow-hidden mx-auto xl:mx-auto w-full md:w-[35rem] md:bg-appBackgroundAccent/85 border-appLayoutBorder font-serif w-full pt-2 pb-4 md:pb-6 px-4 md:px-10 flex flex-col gap-4 md:gap-6 md:shadow-2xl shadow-appLayoutDarkHover",
              }}
              radius="lg"
              pos="relative"
            >
              <TextInput
                size="lg"
                classNames={{
                  input:
                    "focus:bg-appLayoutInputBackground font-serif h-fit w-full px-2 py-0 text-appLayoutText border bg-appBackgroundAccent md:bg-appBackground focus:border-appLayoutTextMuted border-appLayoutBorder transition-colors duration-100 rounded-lg",
                  label: "text-lg mb-2 pl-1 text-appLayoutTextMuted",
                }}
                key={loginForm.key("email")}
                {...loginForm.getInputProps("email")}
                label="Email"
                placeholder="Email"
                radius="md"
              />

              <div className="flex h-fit w-full flex-col items-end gap-3 md:flex-row md:items-center">
                <PasswordInput
                  size="lg"
                  classNames={{
                    root: "w-full md:grow-1",
                    innerInput:
                      " focus:bg-appLayoutInputBackground text-appLayoutText px-2 py-0 font-serif  bg-appBackgroundAccent md:bg-appBackground border border-appLayoutBorder overflow-hidden rounded-lg focus:border-appLayoutTextMuted transition-colors duration-100",
                    input:
                      "bg-transparent border-appLayoutBorder border-none focus:border-appLayoutTextMuted transition-colors duration-100",
                    label: "text-lg mb-2 pl-1 text-appLayoutTextMuted",
                  }}
                  key={loginForm.key("password")}
                  {...loginForm.getInputProps("password")}
                  label="Password"
                  radius="md"
                  placeholder="Password"
                />

                <Button
                  radius="md"
                  classNames={{
                    root: "w-1/3 md:w-fit md:px-4 mt-3 md:mt-9 font-normal border border-appLayoutText text-appBackground bg-appLayoutText hover:bg-appLayoutTextMuted hover:text-appBackgroundAccent hover:border-appLayoutTextMuted transition-colors duration-100 rounded-lg",
                  }}
                  size="lg"
                  variant="outline"
                  type="submit"
                >
                  <span className="icon-[ep--right] h-full w-[2rem]"></span>
                </Button>
              </div>

              <div className="my-2 flex h-fit w-full items-center gap-2 md:my-4">
                <span className="bg-appLayoutInverseHover h-px grow-1"></span>
                <span className="text-appLayoutTextMuted flex items-center justify-center h-[1rem] w-fit md:h-[1.5rem]">
                  or
                </span>
                <span className="bg-appLayoutInverseHover h-px grow-1"></span>
              </div>

              <div className="h-[5rem] w-full"></div>
            </Fieldset>
          </form>
        </Modal>

        <motion.div
          id="AuthContainer"
          animate={{ height: "fit-content" }}
          className="w-full"
        >
          <AnimatePresence mode="wait">
            {!user && (
              <motion.div
                key={"loggedOutComponent"}
                initial={{ opacity: 0 }}
                animate={{ height: "3rem", opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex rounded-md gap-1"
              >
                <div className="grow-9 basis-0 h-full border border-appLayoutBorder rounded-md ">
                  <p className="w-full h-full flex justify-center items-center text-detailsPanelPropsFontSize text-appLayoutText rounded-md bg-appBackground ">
                    Log in to protect your story's journey
                  </p>
                </div>

                <div className="grow basis-0 h-full">
                  <AnimatePresence mode="wait">
                    <button
                      className={`w-full h-full rounded-md border border-appLayoutBorder overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-px active:shadow-md shadow-md shadow-appLayoutGentleShadow
                          `}
                      type="button"
                      onClick={() => {
                        loginModalControl.open();
                      }}
                    >
                      <GrainyElement className="w-full h-full overflow-hidden flex items-center justify-center">
                        <motion.span
                          key={"loginButton"}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="h-authButtonSize w-authButtonSize flex items-center justify-center"
                        >
                          <span className="icon-[ep--right] h-full w-full"></span>
                        </motion.span>
                      </GrainyElement>
                    </button>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
            {user && (
              <motion.div
                key={"loggedInComponent"}
                initial={{ opacity: 0 }}
                animate={{ height: "fit-content", opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-start rounded-md gap-2"
              >
                <div className="relative w-full h-fit border border-appLayoutBorder pt-detailsPanelPropLabelHeight  rounded-md">
                  <p
                    id="loggedInUserDisplay"
                    className="w-full h-fit overflow-x-hidden text-ellipsis flex justify-start items-center text-detailsPanelPropsFontSize px-3 pb-2 rounded-md bg-appBackground "
                  >
                    {user.email}
                  </p>
                  <label
                    htmlFor="loggedInUserDisplay"
                    className="absolute top-1 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none"
                  >
                    Logged in as:
                  </label>
                </div>

                {deviceType === "mobile" && (
                  <>
                    <div className="relative w-full h-fit border border-appLayoutBorder rounded-md flex items-center">
                      <p
                        id="loggedInUserDisplay"
                        className="grow h-fit flex justify-start items-center text-detailsPanelPropsFontSize px-3 py-2 rounded-md bg-appBackground "
                      >
                        {user.emailVerified
                          ? "Free Plan"
                          : "Email is not verified"}
                      </p>
                      <button
                        className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutInverseHover text-appLayoutTextMuted hover:text-appLayoutHighlight flex items-center justify-center`}
                        onClick={async () => {
                          const user = getAuth(firebaseApp).currentUser;
                          await user.reload();
                          console.log("user:", user);
                          setUser({ ...user });
                        }}
                      >
                        <span className="icon-[iwwa--reset] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
                      </button>
                    </div>

                    <div
                      className={`w-full h-fit flex gap-2 rounded-md border border-appLayoutBorder`}
                    >
                      <AnimatePresence mode="wait">
                        <button
                          className={`w-full h-fit py-2 rounded-md text-detailsPanelPropsFontSize 
                        
                        ${!isLogoutLoading ? "hover:bg-specialButtonHover" : ""}
                          
                        bg-specialButton text-appLayoutHover transition-colors duration-200`}
                          onClick={logoutUser}
                          disabled={isLogoutLoading}
                        >
                          <motion.span
                            key={
                              isLogoutLoading
                                ? "logoutLoading"
                                : "logoutNotLoading"
                            }
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-authButtonSize flex items-center justify-center"
                          >
                            {!isLogoutLoading ? (
                              <span>Logout</span>
                            ) : (
                              <span className="icon-[line-md--loading-twotone-loop] h-authButtonLoadingSize w-authButtonLoadingSize"></span>
                            )}
                          </motion.span>
                        </button>
                      </AnimatePresence>
                    </div>
                  </>
                )}

                {deviceType === "desktop" && (
                  <div className="w-full h-fit flex flex-row gap-2">
                    <div className="relative w-1/2 h-userPlanDisplayHeight border border-appLayoutBorder rounded-md flex items-center">
                      <p
                        id="loggedInUserDisplay"
                        className="grow h-full flex justify-start items-center text-detailsPanelPropsFontSize px-3 py-2 rounded-md bg-appBackground "
                      >
                        {user.emailVerified
                          ? "Free Plan"
                          : "Email is not verified"}
                      </p>
                      <button
                        className={`w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutInverseHover text-appLayoutTextMuted hover:text-appLayoutHighlight flex items-center justify-center`}
                        onClick={async () => {
                          const user = getAuth(firebaseApp).currentUser;
                          await user.reload();
                          console.log("user:", user);
                          setUser({ ...user });
                        }}
                      >
                        <span className="icon-[system-uicons--reset-alt] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
                      </button>
                    </div>

                    <div className={`w-1/2 h-userPlanDisplayHeight`}>
                      <AnimatePresence mode="wait">
                        <GrainyElementButton
                          gradientSize={50}
                          className={`w-full h-full border border-appLayoutInverseHover rounded-md overflow-hidden text-detailsPanelPropsFontSize 
                        
                          ${isLogoutLoading ? "text-appLayoutTextMuted" : ""}

                            `}
                          onClick={logoutUser}
                          disabled={isLogoutLoading}
                        >
                          {(isLogoutLoading && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className={`relative w-[3rem] h-[3rem]`}>
                                <span
                                  className="w-full h-full"
                                  // animate={{ rotate: 360 }}
                                  // transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={"100%"}
                                    height={"100%"}
                                    viewBox="0 0 24 24"
                                  >
                                    <g
                                      fill="none"
                                      stroke="#fff"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={0.3}
                                    >
                                      <path
                                        strokeDasharray={16}
                                        strokeDashoffset={16}
                                        d="M12 3c4.97 0 9 4.03 9 9"
                                      >
                                        <animate
                                          fill="freeze"
                                          attributeName="stroke-dashoffset"
                                          dur="0.3s"
                                          values="16;0"
                                        ></animate>
                                        <animateTransform
                                          attributeName="transform"
                                          dur="1.5s"
                                          repeatCount="indefinite"
                                          type="rotate"
                                          values="0 12 12;360 12 12"
                                        ></animateTransform>
                                      </path>
                                      <path
                                        strokeDasharray={64}
                                        strokeDashoffset={64}
                                        strokeOpacity={0.3}
                                        d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                                      >
                                        <animate
                                          fill="freeze"
                                          attributeName="stroke-dashoffset"
                                          dur="1.2s"
                                          values="64;0"
                                        ></animate>
                                      </path>
                                    </g>
                                  </svg>
                                </span>
                                <motion.div
                                  initial={{ opacity: 0.4 }}
                                  animate={{ opacity: 1 }}
                                  transition={{
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: 1.2,
                                    ease: "linear",
                                  }}
                                  className="absolute w-full h-full p-[20%] top-0 left-0"
                                >
                                  <span className="icon-[ph--flower-tulip-thin] h-full w-full"></span>
                                </motion.div>
                              </div>
                            </div>
                          )) || (
                            <motion.span
                              key={
                                isLogoutLoading
                                  ? "logoutLoading"
                                  : "logoutNotLoading"
                              }
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="h-authButtonSize flex items-center justify-center"
                            >
                              {!isLogoutLoading ? (
                                <span>Logout</span>
                              ) : (
                                <span className="icon-[line-md--loading-twotone-loop] h-authButtonLoadingSize w-authButtonLoadingSize"></span>
                              )}
                            </motion.span>
                          )}
                        </GrainyElementButton>
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex flex-row grow basis-0 gap-2 w-full box-border">
          <ListShell
            className={`h-full grow basis-0 min-w-0 bg-appBackgroundAccent`}
          >
            <HoverListHeader className={"gap-4"}>
              <button
                className={`
                  hover:text-appLayoutText
                  ${
                    fontImageToggle === "font"
                      ? "text-appLayoutText"
                      : "text-appLayoutTextMuted"
                  } `}
                onClick={() => setFontImageToggle("font")}
              >
                Fonts
              </button>

              <button
                className={`
                  hover:text-appLayoutText
                  ${
                    fontImageToggle === "image"
                      ? "text-appLayoutText"
                      : "text-appLayoutTextMuted"
                  } `}
                onClick={() => setFontImageToggle("image")}
              >
                Images
              </button>

              <span className="grow"></span>
              <button
                onClick={async () => {
                  if (fontImageToggle === "font") {
                    await fontManager.addFont();
                  }

                  if (fontImageToggle === "image") {
                    await imageManager.addImage();
                  }
                }}
                className="h-fontAddButtonSize w-fontAddButtonSize min-w-0 hover:bg-appLayoutInverseHover rounded-full text-appLayoutText"
              >
                <span className="icon-[material-symbols-light--add-2-rounded] w-full h-full"></span>
              </button>
            </HoverListHeader>
            <HoverListDivider />
            <HoverListBody>
              {fontImageToggle === "font" &&
                fonts.map((font) => {
                  return (
                    <HoverListItem disabled={true} key={font.id}>
                      <div className="w-full h-full flex items-center gap-2 justify-between">
                        <p
                          style={{ fontFamily: font.family }}
                          className="text-detailsPanelPropsFontSize text-appLayoutTextMuted w-fit min-w-0 text-ellipsis text-nowrap overflow-hidden"
                        >
                          {font.family}
                        </p>
                        <span className="grow basis-0 h-px bg-appLayoutBorder"></span>
                        <button
                          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-100 p-1 rounded-full hover:bg-appLayoutInverseHover text-appLayoutTextMuted hover:text-appLayoutHighlight flex items-center justify-center`}
                          onClick={async () => {
                            await fontManager.deleteFont(font.id);
                          }}
                        >
                          <span className="icon-[typcn--delete] w-full h-full"></span>
                        </button>
                      </div>
                    </HoverListItem>
                  );
                })}

              {fontImageToggle === "image" &&
                images.map((image) => {
                  return (
                    <HoverListItem disabled={true} key={image.id}>
                      <div className="w-full h-full flex items-center gap-2 justify-between">
                        <p className="text-detailsPanelPropsFontSize text-appLayoutTextMuted w-fit min-w-0 text-ellipsis text-nowrap overflow-hidden">
                          {image.fileName}
                        </p>
                        <span className="grow basis-0 h-px bg-appLayoutBorder"></span>
                        <button
                          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-100 p-1 rounded-full hover:bg-appLayoutInverseHover text-appLayoutTextMuted hover:text-appLayoutHighlight flex items-center justify-center`}
                          onClick={async () => {
                            await imageManager.deleteImage(image.id);
                          }}
                        >
                          <span className="icon-[typcn--delete] w-full h-full"></span>
                        </button>
                      </div>
                    </HoverListItem>
                  );
                })}
            </HoverListBody>
          </ListShell>

          <div
            id="PreferencesContainer"
            className="grow basis-0 px-1 border border-transparent min-w-0 h-full flex flex-col items-center"
          >
            <div
              id="PreferencesHeader"
              className={`h-detailsPanelHeaderTwoHeight min-h-detailsPanelHeaderTwoHeight w-full flex items-center justify-start py-1 px-1 
                ${deviceType === "desktop" && "px-3"}
              `}
            >
              <h1 className="h-fit w-fit pt-1 pb-[0.38rem]  text-detailsPanelHeaderTwoFontSize text-appLayoutText order-1">
                Preferences
              </h1>
            </div>
            <div className="divider w-full px-3">
              <div className="w-full h-px bg-appLayoutBorder"></div>
            </div>
            <div
              id="PreferencesBody"
              className={`grow basis-0 w-full flex flex-col gap-2 items-center justify-start py-1 px-1                 ${
                deviceType === "desktop" && "px-6"
              }
              `}
            >
              <div className="w-full h-preferencesItemHeight flex gap-2 items-center justify-between">
                <h1 className="h-fit w-fit pt-1 pb-[0.38rem]  text-detailsPanelPropLabelFontSize text-appLayoutText">
                  Zoom
                </h1>

                <span className="h-px grow basis-0 bg-appLayoutBorder"></span>

                <div className="ZoomContainer w-fit h-full flex gap-2 flex-row items-center">
                  <button
                    className="zoomInButton w-preferencesItemButtonSize h-preferencesItemButtonSize flex items-center justify-center rounded-full  hover:bg-appLayoutInverseHover"
                    onClick={zoomIn}
                  >
                    <span className="icon-[material-symbols-light--add-rounded] w-full h-full"></span>
                  </button>
                  <div className="zoomDisplay text-preferencesItemFontSize w-ZoomDisplayWidth h-preferencesItemButtonSize pb-px flex items-center justify-center select-none border border-appLayoutBorder rounded-lg">
                    {zoom && `${round(zoom * 100)}%`}
                  </div>
                  <button
                    className="zoomInButton w-preferencesItemButtonSize h-preferencesItemButtonSize flex items-center justify-center  rounded-full  hover:bg-appLayoutInverseHover"
                    onClick={zoomOut}
                  >
                    <span className="icon-[material-symbols-light--remove-rounded] w-full h-full"></span>
                  </button>
                </div>
              </div>

              <div className="w-full h-preferencesItemHeight flex gap-2 items-center justify-between">
                <h1 className="h-fit w-fit pt-1 pb-[0.38rem]  text-detailsPanelPropLabelFontSize text-appLayoutText">
                  Theme
                </h1>
                <span className="h-px grow basis-0 bg-appLayoutBorder"></span>
                <span>Dark</span>
              </div>
            </div>
          </div>
        </div>
      </DetailsPanelBody>
    </DetailsPanel>
  );
};

export default SettingsPanel;
