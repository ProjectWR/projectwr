import axios from "axios";
import { readTextFile, remove, writeTextFile } from '@tauri-apps/plugin-fs';
import { delete_access_token, generate_oauth_port, get_access_token, get_auth_code, save_access_token, save_auth_code } from "./invoker";
import settings from "../../../../config/settings";
import { CLIENT_ID, CLIENT_SECRET } from "../../../../config/credentials";
import { openUrl } from "@tauri-apps/plugin-opener";
import { AuthStore } from "./DBStores";
import { wait } from "lib0/promise";
import { oauthStore } from "../../stores/oauthStore";


const DEFAULT_DIRECTORY = settings.fs.DEFAULT_DIRECTORY;
const GOOGLE_OAUTH_ENDPOINT = settings.auth.GOOGLE_OAUTH_ENDPOINT;
const SCOPE = settings.auth.SCOPE;
const STORAGE_PATHS = settings.storage.paths;
// anonymous class for managing port
class PortManager {
  async getPort() {
    this.port = this.port || await this.generatePort();
    return this.port;
  }
  async generatePort() {
    const port = await generate_oauth_port();
    return port;
  }
}

const portManager = new PortManager();

export async function getAccessToken(code) {
  try {
    const port = await portManager.getPort();
    const data = {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: getLocalHostUrl(port),
      grant_type: "authorization_code",
    };
    console.log(data, "data");
    const response = await axios.post("https://oauth2.googleapis.com/token", data);
    console.log(response, "response from getAccessToken");
    return response.data;
  }
  catch (error) {
    console.log(error, "error from getAccessToken");
    throw new Error("Error getting access token");
  }

}

export async function refreshAccessToken(refreshToken) {
  try {
    const data = {
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
    };
    console.log('attempting to refresh access token', data);
    const response = await axios.post("https://oauth2.googleapis.com/token", data);
    console.log("RESPONSE: ", response);
    return { ...response.data, refresh_token: refreshToken };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Error refreshing access token");
  }
}

export async function refreshAndSaveAccessToken(refreshToken) {
  try {
    const accessToken = await refreshAccessToken(refreshToken);
    await saveAccessToken(accessToken);
    return accessToken;
  } catch (error) {
    console.error("Error refreshing and saving access token:", error);
    throw new Error("Error refreshing and saving access token");
  }
}

export async function revokeAccessToken(accessToken) {
  try {
    const data = {
      token: accessToken,
    };
    const response = await axios.post("https://oauth2.googleapis.com/revoke", data);
    return response.data;
  } catch (error) {
    console.error("Error revoking access token:", error);
    throw new Error("Error revoking access token");
  }
}


export async function fetchUserProfile(accessToken) {
  try {
    // Fetch user profile information using the access token
    const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response.data, "response from fetchUserProfile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Error fetching user profile");
  }
}



// to handle login to get auth
export async function openAuthWindow() {
  // create and set a new URL object with the endpoint and query parameters
  const url = new URL(GOOGLE_OAUTH_ENDPOINT);
  url.searchParams.append("scope", SCOPE);
  url.searchParams.append("access_type", "offline");
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", CLIENT_ID);
  url.searchParams.append("redirect_uri", getLocalHostUrl(await portManager.getPort()));
  url.searchParams.append("include_granted_scopes", "true");
  url.searchParams.append("state", "state_parameter_passthrough_value");
  openUrl(url.href);
}

// save the auth code to storage
export async function saveAuthCode(code) {
  try {
    return await save_auth_code(code);
  } catch (error) {
    console.error("Error saving auth code:", error);
    throw new Error("Error saving auth code");
  }
}

// get the auth code from storage
export async function getAuthCode() {
  try {
    return await get_auth_code();
  } catch (error) {
    console.error("Error getting auth code:", error);
    return null;
  }
}

export async function saveAccessToken(accessToken) {
  try {
    localStorage.setItem("lastLogin", Date.now() + "");
    return await save_access_token(accessToken);
  } catch (error) {
    console.error("Error saving access token:", error);
    localStorage.removeItem("lastLogin");
    throw new Error("Error saving access token");
  }
}



export async function getAccessTokenFromStorage() {
  try {
    let accessToken = await get_access_token();

    console.log("ACCESS TOKEN FROM STORAGE: ", accessToken);

    if (Object.keys(accessToken).length < 1) {
      throw new Error("No access token found");
    }

    console.log('new access token found')
    // check if the access token is expired
    console.log(accessToken, "accessToken");
    const lastLogin = parseInt(localStorage.getItem("lastLogin") || "0");
    console.log("(accessToken.expires_in < Date.now() || Date.now() - lastLogin > 3620)", Date.now(), lastLogin)
    if ((accessToken.expires_in < lastLogin - Date.now()) && navigator.onLine) {
      console.log("Access token expired");
      accessToken = await refreshAndSaveAccessToken(accessToken.refresh_token);
    }
    return accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}


export async function deleteAccessToken() {
  try {
    return await delete_access_token();
  } catch (error) {
    console.error("Error deleting access token:", error);
    throw new Error("Error deleting access token");
  }
}


export async function saveUserProfile(userProfile) {
  try {
    return await writeTextFile(STORAGE_PATHS.user_profile, JSON.stringify(userProfile), { baseDir: DEFAULT_DIRECTORY });
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw new Error("Error saving user profile");
  }
}

export async function getUserProfileFromStorage() {
  try {
    const userProfile = await readTextFile(STORAGE_PATHS.user_profile, { baseDir: DEFAULT_DIRECTORY });
    return JSON.parse(userProfile);
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}


export async function handleLogin() {
  try {
    const storedAccessToken = await getAccessTokenFromStorage();
    if (storedAccessToken) {
      handleLoadFrom(storedAccessToken);
      return;
    }
    await openAuthWindow();

    await wait(2000);
    console.log(await getAccessTokenFromStorage());
  } catch (error) {
    console.log(error);

  }
}


export async function handleLoadFrom(accessTokenBody) {
  try {
    await saveAccessToken(JSON.stringify(accessTokenBody, null, 2))
    //   setAccessToken(accessTokenBody.access_token);
    oauthStore.setState({ accessTokenState: accessTokenBody.access_token });
    const userProfile = await fetchUserProfile(accessTokenBody.access_token);
    await saveUserProfile(userProfile)

    oauthStore.setState({ userProfile: userProfile });
  }
  catch (err) {
    console.log(err);
    await handleLogout();
  }
}

export async function handleLogout() {
  oauthStore.setState({ accessTokenState: null });
  oauthStore.setState({ userProfileState: null });

  await deleteAccessToken();
}


export async function handleInitialLogin() {
  // get access token from storage
  const accessToken = await getAccessTokenFromStorage();
  if (!accessToken) throw new Error("Signin required");

  const profile = await fetchUserProfile(accessToken.access_token);
  if (!profile || !profile?.email) throw new Error("Something went wrong, please try again");
  oauthStore.setState({ userProfile: profile });
  // setProfile(profile);
  // setAccessToken(accessToken.access_token);
  oauthStore.setState({ accessTokenState: accessToken.access_token });
}



function getLocalHostUrl(port) {
  return `http://localhost:${port}`;
}



