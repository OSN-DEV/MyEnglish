use tauri::menu::{Menu, MenuEvent, MenuItem, Submenu};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_opener::OpenerExt;

const OPEN_APP_DATA_DIR_ID: &str = "debug_open_app_data_dir";
const OPEN_DEVTOOLS_ID: &str = "debug_open_devtools";

/// 標準のメニューに「デバッグ」メニューを追加したメニューを作る.
/// (Menu::default を使うのは、macOS でコピー&ペーストなどの標準メニューを残すため)
pub fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let menu = Menu::default(app)?;
    let debug_menu = Submenu::with_items(
        app,
        "デバッグ",
        true,
        &[
            &MenuItem::with_id(
                app,
                OPEN_APP_DATA_DIR_ID,
                "アプリデータのフォルダを開く",
                true,
                None::<&str>,
            )?,
            &MenuItem::with_id(
                app,
                OPEN_DEVTOOLS_ID,
                "開発者ツールを開く",
                true,
                Some("CmdOrCtrl+Alt+I"),
            )?,
        ],
    )?;
    menu.append(&debug_menu)?;
    Ok(menu)
}

/// 「デバッグ」メニューのクリックを処理する.
pub fn handle_event<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    let result = match event.id().as_ref() {
        OPEN_APP_DATA_DIR_ID => open_app_data_dir(app),
        OPEN_DEVTOOLS_ID => open_devtools(app),
        _ => Ok(()),
    };
    if let Err(e) = result {
        eprintln!("デバッグメニューの処理に失敗しました: {}", e);
    }
}

/// store (settings.json) の保存先フォルダを開く.
/// tauri-plugin-store は相対パスを AppData 基準で解決するため app_data_dir を開く
fn open_app_data_dir<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    // まだ一度も保存していないとフォルダが無いので作っておく
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    app.opener()
        .open_path(dir.to_string_lossy(), None::<&str>)
        .map_err(|e| e.to_string())
}

/// メインウィンドウの開発者ツールを開く.
fn open_devtools<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("メインウィンドウが見つかりません")?;
    window.open_devtools();
    Ok(())
}
