use once_cell::sync::OnceCell;
use tauri::command;

static SETTINGS: OnceCell<Settings> = OnceCell::new();

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct Settings {
    name: String,
    phone: String,
    email: String,
}

#[command]
fn fetch_default_settings() -> Result<Settings, String> {
    SETTINGS.get().cloned().ok_or_else(|| "Settings not initialized".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                let settings_data = std::fs::read_to_string("resources/default_settings.json").map_err(|e| e.to_string())?;
                let settings: Settings = serde_json::from_str(&settings_data).map_err(|e| e.to_string())?;
                SETTINGS.set(settings).map_err(|_| "Failed to set settings".to_string())?;
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
        .invoke_handler(tauri::generate_handler![fetch_default_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
