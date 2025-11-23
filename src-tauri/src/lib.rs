mod libs;

use libs::filehelper::ENV_FILE;
use libs::tauri_actions::{
    greet, load_access_token, load_code, save_access_token, save_code, test_command,
};
use once_cell::sync::OnceCell;
use std::env;
use tauri::Manager;
use tauri::{command, Emitter, Window};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_oauth::start;
use window_vibrancy::*;

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
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            println!("Single instance triggered with args: {:?}", args);

            // When a second instance is launched (e.g., from a deep link),
            // this callback runs in the FIRST instance with the args from the second instance
            if let Some(url) = args.get(1) {
                println!("Received URL from new instance: {}", url);

                // Get the main window and emit the deep link event
                if let Some(window) = app.get_webview_window("main") {
                    println!("Emitting deep link event: {}", url);
                    let _ = window.emit("oauth://url", url);

                    // Bring window to focus
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_always_on_top(true);
                    let _ = window.set_focus();

                    #[cfg(target_os = "windows")]
                    {
                        use tauri::UserAttentionType;
                        let _ =
                            window.request_user_attention(Some(UserAttentionType::Informational));
                    }

                    // Remove always on top after a brief moment
                    let window_clone = window.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(100));
                        let _ = window_clone.set_always_on_top(false);
                    });

                    println!("Window focus attempted for single instance");
                }
            }
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_oauth::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Register the deep link protocol with the OS for dev mode
            #[cfg(any(windows, target_os = "linux"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                match app.deep_link().register_all() {
                    Ok(_) => println!("Deep link protocol registered successfully!"),
                    Err(e) => eprintln!("Failed to register deep link: {:?}", e),
                }
            }

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

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_blur(&window, Some((18, 18, 18, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

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
