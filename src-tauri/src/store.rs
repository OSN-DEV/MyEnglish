use serde_json::json;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

/// アプリのデータフォルダに保存するファイル名
const STORE_FILE: &str = "settings.json";
/// アイテム一覧 (エクセルのパスのリスト) を保存するキー
const ITEM_PATHS_KEY: &str = "itemPaths";

/// 登録済みのパス一覧を取得する.
pub fn get_item_paths(app: &AppHandle) -> Result<Vec<String>, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    // if let Some(value) = store.get(..) は、is_some() で確認してから unwrap() するのと同義
    let paths = if let Some(value) = store.get(ITEM_PATHS_KEY) {
        serde_json::from_value(value).unwrap_or_default()
    } else {
        Vec::new()
    };
    Ok(paths)
}

/// パスを追加する. 登録済みの場合はエラーを返す.
pub fn add_item_path(app: &AppHandle, file_path: &str) -> Result<(), String> {
    let mut paths = get_item_paths(app)?;
    if paths.iter().any(|path| path == file_path) {
        return Err(format!("このファイルは登録済みです: {}", file_path));
    }
    paths.push(file_path.to_string());
    save_item_paths(app, &paths)
}

/// パスを削除する.
pub fn remove_item_path(app: &AppHandle, file_path: &str) -> Result<(), String> {
    let mut paths = get_item_paths(app)?;
    paths.retain(|path| path != file_path);
    save_item_paths(app, &paths)
}

/// パス一覧をファイルに保存する.
fn save_item_paths(app: &AppHandle, paths: &[String]) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(ITEM_PATHS_KEY, json!(paths));
    store.save().map_err(|e| e.to_string())
}
