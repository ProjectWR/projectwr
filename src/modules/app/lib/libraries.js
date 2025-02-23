import { load } from "@tauri-apps/plugin-store";

/**
 * 
 * @returns {Store}
 */
export async function fetchUserLibraryListStore() {
    const store = await load('app/user-libraries.json');
    return store;
}