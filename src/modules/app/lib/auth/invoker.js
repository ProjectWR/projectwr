import { invoke } from '@tauri-apps/api/core';
import * as commands from './commands.js';
import { AuthStore } from './DBStores.js';
import settings from '../../../../config/settings.js';


const storeConstant = settings.storage.constants;

export async function save_auth_code(code) {
    // return await commands.saveCode(code);
    await AuthStore.set(storeConstant.authcode, code);
    return { message: "Code saved", token: code, success: true };


}

export async function get_auth_code() {
    // return await commands.loadCode();
    return await AuthStore.get(storeConstant.authcode) ?? "";

}

export async function save_access_token(token) {
    const accessTokenText = typeof token === "string" ? JSON.parse(token) : token;
    // return await commands.saveAccessToken(accessTokenText);
    await AuthStore.set(storeConstant.access_token, accessTokenText);
    return { message: "Token saved", success: true, token };
}

export async function get_access_token() {
    // return await commands.loadAccessToken();
    return await AuthStore.get(storeConstant.access_token) ?? {};
}

export async function test_command() {
    return await commands.testCommand();
}

export async function greet(name) {
    return await commands.greet(name);
}

export async function generate_oauth_port() {
    return await invoke("plugin:oauth|start");
}
