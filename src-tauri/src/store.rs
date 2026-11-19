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

/// パス一覧を、指定した並び順で保存し直す (トップ画面の一覧の手動並び替え).
/// 登録済みのパスと過不足がある場合は、パスが消えたり増えたりしないようエラーにする
pub fn reorder_item_paths(app: &AppHandle, ordered_paths: &[String]) -> Result<(), String> {
    let paths = get_item_paths(app)?;
    if !is_same_paths(&paths, ordered_paths) {
        return Err("アイテム一覧が変更されています。アプリを再起動してください".to_string());
    }
    save_item_paths(app, ordered_paths)
}

/// 2 つのパス一覧が、並び順を除いて同じ内容か.
/// (並び替えの前後で、パスの追加・削除が混ざっていないことの確認に使う)
fn is_same_paths(a: &[String], b: &[String]) -> bool {
    // スライスの .to_vec() は中身をコピーした Vec を作る (引数を書き換えずに並べ替えるため)
    let mut a = a.to_vec();
    let mut b = b.to_vec();
    // 同じ名前で変数を宣言し直す (シャドーイング) と、以降は新しい方 (コピー) を指す
    a.sort();
    b.sort();
    a == b
}

/// パス一覧をファイルに保存する.
fn save_item_paths(app: &AppHandle, paths: &[String]) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(ITEM_PATHS_KEY, json!(paths));
    store.save().map_err(|e| e.to_string())
}

// #[cfg(test)] を付けたモジュールは `cargo test` のときだけコンパイルされる
#[cfg(test)]
mod tests {
    use super::*;

    /// &str の配列から Vec<String> を作る (テスト用)
    fn paths(values: &[&str]) -> Vec<String> {
        values.iter().map(|v| v.to_string()).collect()
    }

    #[test]
    fn 並び順だけが違うなら同じとみなす() {
        assert!(is_same_paths(&paths(&["a", "b", "c"]), &paths(&["c", "a", "b"])));
    }

    #[test]
    fn パスの過不足があれば違うとみなす() {
        assert!(!is_same_paths(&paths(&["a", "b"]), &paths(&["a"])));
        assert!(!is_same_paths(&paths(&["a", "b"]), &paths(&["a", "b", "c"])));
        assert!(!is_same_paths(&paths(&["a", "b"]), &paths(&["a", "x"])));
    }
}
