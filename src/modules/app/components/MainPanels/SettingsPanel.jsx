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
} from "firebase/auth";
import firebaseApp from "../../lib/Firebase";

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const uppercaseRegex = /[A-Z]/g;
const lowercaseRegex = /[a-z]/g;
const digitRegex = /\d/g;
const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
const minLengthRegex = /^.{8,}$/g;
const maxLengthRegex = /^.{1,128}$/g;

const SettingsPanel = () => {
  console.log("rendering settings panel");
  const { deviceType } = useDeviceType();
  const user = appStore((state) => state.user);

  const defaultSettings = settingsStore((state) => state.defaultSettings);
  const settings = settingsStore((state) => state.settings);

  const setSettings = settingsStore((state) => state.setSettings);

  const [newSettings, setNewSettings] = useState(settings);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const [authProps, setAuthProps] = useState({
    email: "",
    password: "",
  });

  const isValidEmail = useMemo(() => {
    return authProps.email === "" || emailRegex.test(authProps.email);
  }, [authProps]);

  const passwordValidityStatus = useMemo(() => {
    const pwd = authProps.password;
    return {
      uppercase: pwd === "" || uppercaseRegex.test(pwd),
      lowercase: pwd === "" || lowercaseRegex.test(pwd),
      digit: pwd === "" || digitRegex.test(pwd),
      specialChar: pwd === "" || specialCharRegex.test(pwd),
      minLength: pwd === "" || minLengthRegex.test(pwd),
      maxLength: pwd === "" || maxLengthRegex.test(pwd),
    };
  }, [authProps]);

  const createUser = useCallback(async () => {
    const email = authProps.email;
    const password = authProps.password;

    if (!emailRegex.test(authProps.email)) {
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

    const user = await createUserWithEmailAndPassword(
      getAuth(firebaseApp),
      email,
      password
    );
  }, [authProps]);

  const handleAuthPropChange = (e) => {
    const { name, value } = e.target;
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
    <div id="SettingsContainer" className={`h-full w-full flex flex-col`}>
      <div
        id="SettingsHeader"
        className={`flex items-center justify-between px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow`}
      >
        <h1 className="h-fit w-fit pt-1 pb-[0.38rem] ml-4 text-libraryManagerHeaderText text-neutral-300 order-2">
          Settings
        </h1>
        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-3
 `}
          onClick={handleResetToDefault}
        >
          <span className="icon-[material-symbols-light--reset-settings]] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-4
 `}
          onClick={handleSave}
        >
          <span className="icon-[material-symbols-light--check-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
      </div>

      <div
        id="SettingsBody"
        className={`flex-grow flex flex-col w-full justify-start items-end overflow-y-scroll py-3 px-4 gap-3 ${
          deviceType === "mobile" ? "no-scrollbar" : "pl-[0.75rem]"
        }`}
      >
        <motion.div
          id="AuthContainer"
          animate={{ height: "fit-content" }}
          className="w-full flex flex-col items-start rounded-md gap-2"
        >
          <AnimatePresence mode="wait">
            {!user && (
              <>
                <div className="w-full h-fit border border-appLayoutBorder rounded-md">
                  <p className="w-full h-fit flex justify-center items-center text-detailsPanelPropsFontSize px-3 py-2 rounded-md bg-appBackground ">
                    You are not logged in
                  </p>
                </div>

                <motion.div
                  animate={{ height: "fit-content" }}
                  className={`relative w-full border border-appLayoutBorder rounded-md overflow-hidden bg-clip-padding`}
                >
                  <input
                    id="emailInput"
                    name="email"
                    className="w-full h-fit text-detailsPanelPropsFontSize px-3 pb-2 pt-detailsPanelPropLabelHeight bg-appBackground focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 "
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
                      height: !isValidEmail
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
                  className={`relative w-full border border-appLayoutBorder rounded-md overflow-hidden bg-clip-padding`}
                >
                  <input
                    id="passwordInput"
                    name="password"
                    className="w-full h-fit text-detailsPanelPropsFontSize px-3 pb-2 pt-detailsPanelPropLabelHeight rounded-t-md bg-appBackground focus:outline-none focus:bg-appLayoutInputBackground transition-colors duration-200 "
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
                      height: !passwordValidityStatus.lowercase
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
                      height: !passwordValidityStatus.uppercase
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
                      height: !passwordValidityStatus.digit
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
                      height: !passwordValidityStatus.specialChar
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
                      height: !passwordValidityStatus.minLength
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
                      height: !passwordValidityStatus.maxLength
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
                    <button
                      className="w-full py-2 text-detailsPanelPropsFontSize"
                      onClick={createUser}
                    >
                      Register
                    </button>
                  </div>
                  <div className="w-1/2 h-fit border border-appLayoutBorder rounded-md">
                    <button className="w-full py-2 text-detailsPanelPropsFontSize">
                      Login
                    </button>
                  </div>
                </div>
              </>
            )}
            {user && (
              <>
                <div className="relative w-full h-fit border border-appLayoutBorder rounded-md">
                  <p
                    id="loggedInUserDisplay"
                    className="w-full h-fit flex justify-start items-center text-detailsPanelPropsFontSize px-3 pb-2 pt-detailsPanelPropLabelHeight rounded-md bg-appBackground "
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

              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPanel;
