pub mod audio;
pub mod debug_menu;
pub mod excel;
pub mod model;
pub mod question_sheet;
pub mod session_writer;
pub mod setting_sheet;
pub mod store;

use crate::model::{Item, ItemEntry, Question, SessionResult};
use std::path::Path;
use tauri::AppHandle;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .menu(debug_menu::build)
        .on_menu_event(debug_menu::handle_event)
        .invoke_handler(tauri::generate_handler![
            get_items,
            add_item,
            remove_item,
            reorder_items,
            get_questions,
            find_audio_file,
            save_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// 登録済みのアイテム一覧を取得する.
/// ファイルが無い・読み込めないアイテムも、エラーメッセージ付きで一覧に残す
#[tauri::command]
fn get_items(app: AppHandle) -> Result<Vec<ItemEntry>, String> {
    let paths = store::get_item_paths(&app)?;
    Ok(paths.iter().map(|path| load_entry(path)).collect())
}

/// エクセルをアイテムとして登録する.
/// 読み込めないファイルや、登録済みのアイテムと id が同じファイルは登録しない
#[tauri::command]
fn add_item(app: AppHandle, file_path: String) -> Result<Item, String> {
    let item = setting_sheet::read_item(&file_path)?;

    let registered_paths = store::get_item_paths(&app)?;
    let duplicate = registered_paths
        .iter()
        .filter_map(|path| load_entry(path).item)
        .find(|registered| registered.id == item.id);
    if let Some(registered) = duplicate {
        return Err(format!(
            "id が同じアイテムが登録済みです: {} ({})",
            registered.display_name, registered.file_path
        ));
    }

    store::add_item_path(&app, &file_path)?;
    Ok(item)
}

/// アイテムを一覧から外す (エクセルファイルは削除しない).
#[tauri::command]
fn remove_item(app: AppHandle, file_path: String) -> Result<(), String> {
    store::remove_item_path(&app, &file_path)
}

/// アイテム一覧を、指定したパスの並び順で保存する (トップ画面の手動並び替え).
#[tauri::command]
fn reorder_items(app: AppHandle, file_paths: Vec<String>) -> Result<(), String> {
    store::reorder_item_paths(&app, &file_paths)
}

/// 1 件分のアイテムを読み込む. 失敗した場合はエラーメッセージを持たせる.
fn load_entry(path: &str) -> ItemEntry {
    let result = if Path::new(path).exists() {
        setting_sheet::read_item(path)
    } else {
        Err(format!("ファイルが見つかりません: {}", path))
    };
    match result {
        Ok(item) => ItemEntry {
            file_path: path.to_string(),
            item: Some(item),
            error_message: None,
        },
        Err(e) => ItemEntry {
            file_path: path.to_string(),
            item: None,
            error_message: Some(e),
        },
    }
}

/// 問題の一覧を取得する
#[tauri::command]
fn get_questions(item: Item) -> Result<Vec<Question>, String> {
    let questions = question_sheet::read_questions(&item)?;
    println!("get_questions {}", questions.len());
    Ok(questions)
}

/// 音声ファイルの候補のうち、最初に存在するもののパスを返す (どれも無ければ null).
/// Option を返すと、フロントには Some(パス) は文字列、None は null として届く
#[tauri::command]
fn find_audio_file(candidates: Vec<String>) -> Option<String> {
    audio::find_existing_file(&candidates)
}

/// セッションの結果をエクセルへ書き戻す (セッション終了時に 1 回).
/// 失敗したらエラーメッセージを返し、フロントで「再試行 / キャンセル」を選ばせる
#[tauri::command]
fn save_session(result: SessionResult) -> Result<(), String> {
    session_writer::save_session(&result)
}
