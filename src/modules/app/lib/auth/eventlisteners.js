import { listen } from "@tauri-apps/api/event";


export async function listen_for_auth_code(callback) {

    const unlisten = await listen("oauth://url", async (data) => {
        try {
            console.log("gotten data")
            if (!data.payload) return;
            const url = new URL(data.payload);
            const code = new URLSearchParams(url.search).get("code");
            return callback.onSucess(code);
        } catch (err) {
            unlisten();
            return callback.onError ? callback.onError(err) : null;
        } finally {
            // reestablish the listener
            listen_for_auth_code(callback);
        }
    });
}
