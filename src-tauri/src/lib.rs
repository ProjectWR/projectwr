mod libs;

use libs::filehelper::ENV_FILE;
use libs::tauri_actions::{
    greet, load_access_token, load_code, save_access_token, save_code, test_command,
};
use once_cell::sync::OnceCell;
use std::env;
use tauri::{command, Emitter, Window};
use tauri_plugin_oauth::start;

static SETTINGS: OnceCell<Settings> = OnceCell::new();

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct Settings {
    theme: String,
    ui_scale: f64,
}

#[command]
fn fetch_default_settings() -> Result<Settings, String> {
    SETTINGS
        .get()
        .cloned()
        .ok_or_else(|| "Settings not initialized".to_string())
}

#[command]
async fn start_server(window: Window) -> Result<u16, String> {
    start(move |url| {
        // Because of the unprotected localhost port, you must verify the URL here.
        // Preferebly send back only the token, or nothing at all if you can handle everything else in Rust.
        let _ = window.emit("redirect_uri", url);
    })
    .map_err(|err| err.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv::from_filename(ENV_FILE).ok();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_oauth::init())
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                let settings_data = std::fs::read_to_string("resources/default_settings.json")
                    .map_err(|e| e.to_string())?;
                let settings: Settings =
                    serde_json::from_str(&settings_data).map_err(|e| e.to_string())?;
                SETTINGS
                    .set(settings)
                    .map_err(|_| "Failed to set settings".to_string())?;
                Ok::<(), String>(())
            })?;

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_default_settings,
            save_access_token,
            load_access_token,
            greet,
            test_command,
            save_code,
            load_code,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
