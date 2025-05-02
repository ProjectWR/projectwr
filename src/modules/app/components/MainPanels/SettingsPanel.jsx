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

  const [isLoginOpen, loginModalControl] = useDisclosure(false);

  const user = appStore((state) => state.user);
  const setUser = appStore((state) => state.setUser);

  const fonts = useFonts();
  console.log("fonts: ", fonts);

  const defaultSettings = settingsStore((state) => state.defaultSettings);
  const settings = settingsStore((state) => state.settings);

  const setSettings = settingsStore((state) => state.setSettings);

  const [newSettings, setNewSettings] = useState(settings);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

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
      setIsLoginLoading(true);

      await signInWithEmailAndPassword(getAuth(firebaseApp), email, password);
      setIsLoginLoading(false);
    });

  const [authProps, setAuthProps] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  const resetAuthProps = useCallback(() => {
    setAuthProps({
      displayName: "",
      email: "",
      password: "",
    });
  }, [setAuthProps]);

  const isValidEmail = useMemo(() => {
    return emailRegex.test(authProps.email);
  }, [authProps]);

  const passwordValidityStatus = useMemo(() => {
    const pwd = authProps.password;
    return {
      uppercase: uppercaseRegex.test(pwd),
      lowercase: lowercaseRegex.test(pwd),
      digit: digitRegex.test(pwd),
      specialChar: specialCharRegex.test(pwd),
      minLength: minLengthRegex.test(pwd),
      maxLength: maxLengthRegex.test(pwd),
    };
  }, [authProps]);

  const passwordValidityStatusWithoutEmpty = useMemo(() => {
    const pwd = authProps.password;
    return (
      uppercaseRegex.test(pwd) &&
      lowercaseRegex.test(pwd) &&
      digitRegex.test(pwd) &&
      specialCharRegex.test(pwd) &&
      minLengthRegex.test(pwd) &&
      maxLengthRegex.test(pwd)
    );
  }, [authProps]);

  const loginUser = useCallback(async () => {
    const email = authProps.email;
    const password = authProps.password;

    try {
      setIsLoginLoading(true);

      if (!emailRegex.test(email)) {
        throw new Error("Invalid Email");
      }

      const passwordStatus = await validatePassword(
        getAuth(firebaseApp),
        password
      );

      if (!passwordStatus.isValid) {
        console.log(passwordStatus);
        throw new Error("Invalid Password");
      }
    } catch {
      resetAuthProps();
      setIsEmailTouched(true);
      setIsPasswordTouched(true);
      setIsLoginLoading();
      return;
    }

    try {
      await signInWithEmailAndPassword(getAuth(firebaseApp), email, password);
      setIsLoginLoading(false);
    } catch {
      resetAuthProps();
      setIsEmailTouched(false);
      setIsPasswordTouched(false);
      setIsLoginLoading(false);
    }
  }, [authProps, resetAuthProps]);

  const logoutUser = useCallback(async () => {
    try {
      setIsLogoutLoading(true);
      await getAuth(firebaseApp).signOut();
      setIsLogoutLoading(false);
    } catch {
      setIsLogoutLoading(false);
    }
  }, []);

  const handleAuthPropChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setIsEmailTouched(true);
    if (name === "password") setIsPasswordTouched(true);
    setAuthProps({
      ...authProps,
      [name]: value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSettings({
      ...newSettings,
      [name]: value,
    });
  };

  const handleSave = () => {
    setIsSaveLoading(true);
    (async () => {
      try {
        await saveSettings(newSettings);
        const loadedSettings = await loadSettings();

        setSettings(loadedSettings);
        setNewSettings(loadedSettings);
      } catch (error) {
        console.error("Error saving settings: ", error);
      } finally {
        setIsSaveLoading(false);
      }
    })();
  };

  const handleResetToDefault = () => {
    setIsResetLoading(true);
    (async () => {
      try {
        await saveSettings(defaultSettings);
        const loadedSettings = await loadSettings();

        setSettings(loadedSettings);

        setNewSettings(loadedSettings);
      } catch (error) {
        console.error("Error saving settings: ", error);
      } finally {
        setIsResetLoading(false);
      }
    })();
  };

  return (
    <div
      id="SettingsContainer"
      className={`h-full flex flex-col items-center justify-start 
      ${deviceType === "mobile" && "w-full"}   
      ${deviceType === "desktop" && "mt-10"}       
    `}
      style={
        deviceType === "desktop" && {
          width: `var(--detailsPanelWidth)`,
          minWidth: `calc(var(--detailsPanelWidth) * 0.5)`,
        }
      }
    >
      <div
        id="SettingsHeader"
        className={`h-detailsPanelHeaderHeight min-h-detailsPanelHeaderHeight w-full flex items-center justify-start py-1 px-1 
          ${deviceType === "desktop" && "px-6"}
        `}
      >
        <h1 className="h-fit w-fit pt-1 pb-[0.38rem] ml-4 text-detailsPanelNameFontSize text-neutral-300 order-1">
          Settings
        </h1>
      </div>

      <div className="divider w-full px-3">
        <div className="w-full h-px bg-appLayoutBorder"></div>
      </div>
      <div
        id="SettingsBody"
        className="h-fit w-full flex flex-col items-center justify-start py-4 gap-4 px-6"
      >
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
              legend="Log in "
              classNames={{
                legend:
                  "text-3xl pb-1 px-2 mx-auto font-light text-appLayoutText",
                root: "md:border border border-appLayoutBorder rounded-xl overflow-hidden mx-auto xl:mx-auto w-full md:w-[35rem] md:bg-appBackgroundAccent border-appLayoutBorder font-serif w-full pt-2 pb-4 md:pb-6 px-4 md:px-10 flex flex-col gap-4 md:gap-6 md:shadow-2xl shadow-appLayoutDarkHover",
              }}
              radius="lg"
              pos="relative"
            >
              <TextInput
                size="lg"
                classNames={{
                  input:
                    "focus:bg-appLayoutInputBackground font-serif h-fit w-full px-2 py-0 text-appLayoutText border bg-appBackgroundAccent md:bg-appBackground focus:border-appLayoutTextMuted border-appLayoutBorder transition-colors duration-100",
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
                    root: "w-1/3 md:w-fit md:px-4 mt-3 md:mt-9 font-normal border border-appLayoutText text-appBackground bg-appLayoutText hover:bg-appLayoutTextMuted hover:text-appBackgroundAccent hover:border-appLayoutTextMuted",
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
                animate={{ height: "fit-content", opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-fit flex flex-col items-start rounded-md gap-2"
              >
                <div className="w-full h-fit border border-appLayoutBorder rounded-md shadow-sm shadow-appLayoutShadow">
                  <p className="w-full h-fit flex justify-center items-center text-detailsPanelPropsFontSize text-appLayoutTextMuted px-3 py-2 rounded-md bg-appBackground ">
                    You are not logged in
                  </p>
                </div>

                <motion.div
                  animate={{ height: "fit-content" }}
                  className={`relative w-full border border-appLayoutBorder rounded-md overflow-hidden bg-clip-padding shadow-sm shadow-appLayoutShadow`}
                >
                  <input
                    id="emailInput"
                    name="email"
                    className="w-full h-fit text-detailsPanelPropsFontSize px-3 pb-2 pt-detailsPanelPropLabelHeight bg-appBackground focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 shadow-inner shadow-appLayoutGentleShadow"
                    onChange={handleAuthPropChange}
                    value={authProps.email}
                  />
                  <label
                    htmlFor="emailInput"
                    className="absolute top-1 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none"
                  >
                    Email
                  </label>
                  <motion.p
                    initial={{ height: 0 }}
                    animate={{
                      height:
                        isEmailTouched && !isValidEmail
                          ? "var(--detailsPanelPropLabelHeight)"
                          : 0,
                    }}
                    exit={{ height: 0 }}
                    className={`px-3 flex items-center text-appLayoutHighlight bg-validationErrorText text-detailsPanelPropLabelFontSize pointer-events-none overflow-hidden`}
                  >
                    Email is not valid
                  </motion.p>
                </motion.div>

                <motion.div
                  animate={{ height: "fit-content" }}
                  className={`relative w-full border border-appLayoutBorder rounded-md overflow-hidden bg-clip-padding shadow-sm shadow-appLayoutShadow`}
                >
                  <input
                    id="passwordInput"
                    name="password"
                    className="w-full h-fit text-detailsPanelPropsFontSize px-3 pb-2 pt-detailsPanelPropLabelHeight rounded-t-md bg-appBackground focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 shadow-inner shadow-appLayoutGentleShadow"
                    onChange={handleAuthPropChange}
                    value={authProps.password}
                  />
                  <label
                    htmlFor="passwordInput"
                    className="absolute top-1 left-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit pointer-events-none"
                  >
                    Password
                  </label>
                  <motion.p
                    initial={{ height: 0 }}
                    animate={{
                      height:
                        isPasswordTouched && !passwordValidityStatus.lowercase
                          ? "var(--detailsPanelPropLabelHeight)"
                          : 0,
                    }}
                    exit={{ height: 0 }}
                    className={`px-3 flex items-center text-appLayoutHighlight bg-validationErrorText text-detailsPanelPropLabelFontSize pointer-events-none overflow-hidden `}
                  >
                    should contain lowercase letter *
                  </motion.p>
                  <motion.p
                    initial={{ height: 0 }}
                    animate={{
                      height:
                        isPasswordTouched && !passwordValidityStatus.uppercase
                          ? "var(--detailsPanelPropLabelHeight)"
                          : 0,
                    }}
                    exit={{ height: 0 }}
                    className={`px-3 flex items-center text-appLayoutHighlight bg-validationErrorText text-detailsPanelPropLabelFontSize pointer-events-none overflow-hidden`}
                  >
                    should contain uppercase letter *
                  </motion.p>
                  <motion.p
                    initial={{ height: 0 }}
                    animate={{
                      height:
                        isPasswordTouched && !passwordValidityStatus.digit
                          ? "var(--detailsPanelPropLabelHeight)"
                          : 0,
                    }}
                    exit={{ height: 0 }}
                    className={`px-3 flex items-center text-appLayoutHighlight bg-validationErrorText text-detailsPanelPropLabelFontSize pointer-events-none overflow-hidden`}
                  >
                    should contain digit *
                  </motion.p>

                  <motion.p
                    initial={{ height: 0 }}
                    animate={{
                      height:
                        isPasswordTouched && !passwordValidityStatus.specialChar
                          ? "var(--detailsPanelPropLabelHeight)"
                          : 0,
                    }}
                    exit={{ height: 0 }}
                    className={`px-3 flex items-center text-appLayoutHighlight bg-validationErrorText text-detailsPanelPropLabelFontSize pointer-events-none overflow-hidden`}
                  >
                    should contain special character *
                  </motion.p>
                  <motion.p
                    initial={{ height: 0 }}
                    animate={{
                      height:
                        isPasswordTouched && !passwordValidityStatus.minLength
                          ? "var(--detailsPanelPropLabelHeight)"
                          : 0,
                    }}
                    exit={{ height: 0 }}
                    className={`px-3 flex items-center text-appLayoutHighlight bg-validationErrorText text-detailsPanelPropLabelFontSize pointer-events-none overflow-hidden`}
                  >
                    should be more than 8 characters long *
                  </motion.p>
                  <motion.p
                    initial={{ height: 0 }}
                    animate={{
                      height:
                        isPasswordTouched && !passwordValidityStatus.maxLength
                          ? "var(--detailsPanelPropLabelHeight)"
                          : 0,
                    }}
                    exit={{ height: 0 }}
                    className={`px-3 flex items-center text-appLayoutHighlight bg-validationErrorText text-detailsPanelPropLabelFontSize pointer-events-none overflow-hidden`}
                  >
                    should be less than 128 characters long *
                  </motion.p>
                </motion.div>
                <div className={`w-full flex gap-2`}>
                  <div className="w-1/2 h-fit border border-appLayoutBorder rounded-md">
                    <AnimatePresence mode="wait">
                      <GrainyElement className="w-full h-fit rounded-md overflow-hidden">
                        <button
                          className={`w-full h-fit py-2 rounded-md 
                          `}
                          onClick={loginModalControl.open}
                          disabled={isLoginLoading}
                        >
                          <motion.span
                            key={
                              isLoginLoading
                                ? "loginLoading"
                                : "loginNotLoading"
                            }
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-authButtonSize flex items-center justify-center"
                          >
                            {!isLoginLoading ? (
                              <span>Login</span>
                            ) : (
                              <span className="icon-[line-md--loading-twotone-loop] h-authButtonLoadingSize w-authButtonLoadingSize text-appBackground"></span>
                            )}
                          </motion.span>
                        </button>
                      </GrainyElement>
                    </AnimatePresence>
                  </div>
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
                        <GrainyButton
                          className={`w-full h-full border border-appLayoutBorder rounded-md overflow-hidden text-detailsPanelPropsFontSize 
                        
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
                        </GrainyButton>
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          id="FontContainer"
          animate={{
            height: "var(--fontContainerHeight)",
            paddingTop: "var(--detailsPanelPropLabelHeight)",
          }}
          className="w-full flex flex-row gap-2 rounded-lg border border-appLayoutBorder  relative"
        >
          <div
            style={{
              paddingLeft: `var(--scrollbarWidth)`,
            }}
            className="h-full w-full py-2 overflow-y-scroll grid grid-cols-3 gap-2 auto-rows-(--fontItemHeight)"
          >
            {fonts.map((font) => {
              return (
                <div
                  key={font.id}
                  className={`flex items-center justify-between gap-2 pl-3 pr-1 rounded-md bg-appBackground border border-appLayoutBorder`}
                >
                  <p
                    style={{ fontFamily: font.family }}
                    className="text-detailsPanelPropsFontSize text-appLayoutTextMuted grow min-w-0 text-ellipsis text-nowrap overflow-hidden"
                  >
                    {font.family}
                  </p>
                  <button
                    className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center`}
                    onClick={async () => {
                      await fontManager.deleteFont(font.id);
                    }}
                  >
                    <span className="icon-[ph--trash-thin] w-full h-full"></span>
                  </button>
                </div>
              );
            })}
          </div>
          <label
            htmlFor="FontContainer"
            className="absolute top-1 left-0 px-3 text-detailsPanelPropLabelFontSize text-appLayoutTextMuted h-fit w-full flex items-center justify-between"
          >
            <p>Fonts</p>
            <button
              onClick={async () => {
                await fontManager.addFont();
              }}
              className="h-fontAddButtonSize w-fontAddButtonSize hover:bg-appLayoutInverseHover rounded-full"
            >
              <span className="icon-[material-symbols-light--add-2-rounded] w-full h-full"></span>
            </button>
          </label>
        </motion.div>
      </div>

      <div
        id="PreferencesContainer"
        className="w-[96%] h-fit flex flex-col items-center"
      >
        <div
          id="PreferencesHeader"
          className={`h-detailsPanelHeaderTwoHeight min-h-detailsPanelHeaderTwoHeight w-full flex items-center justify-start py-1 px-1 
          ${deviceType === "desktop" && "px-6"}
        `}
        >
          <h1 className="h-fit w-fit pt-1 pb-[0.38rem] ml-4 text-detailsPanelHeaderTwoFontSize text-neutral-300 order-1">
            Preferences
          </h1>

          <div className="grow order-2"></div>
          <button
            className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-3
 `}
            onClick={handleResetToDefault}
          >
            <span className="icon-[material-symbols-light--reset-settings] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
          <button
            className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-4
 `}
            onClick={handleSave}
          >
            <span className="icon-[material-symbols-light--check-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
        </div>

        <div className="w-[93.5%] h-px bg-appLayoutBorder"></div>
      </div>
    </div>
  );
};

export default SettingsPanel;
