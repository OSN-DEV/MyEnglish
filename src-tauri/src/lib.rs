use tauri_plugin_store::StoreExt;
use serde_json::json;


use crate::excel::ExcelHandler;
use crate::store::AppStore;

pub mod excel;
pub mod store;
pub mod model;
use crate::model::SettingData;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, add_excel])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tauri::command]
fn add_excel(app: tauri::AppHandle, file_path: String) -> Result<SettingData, String> {
    // ライブラリ内部でパニックが起きてもアプリを落とさず、エラーとしてフロントへ返す
    let setting_data = std::panic::catch_unwind(|| read_setting_data(&file_path))
        .unwrap_or_else(|_| Err(format!("エクセルの読み込み中に予期しないエラーが発生しました: {}", file_path)))?;

    // 読み込めたファイルだけを登録する
    // add_excel_pathのfile_pathのパラメータがStringだと、そこで所有権が移動してしまうので
    // &strで受け取るようにしている。
    let app_store = AppStore{};
    // ?; Resultを返す関数内で使える演算子。例外が発生した場合にエラーを返却して移行の処理を実行しない
    app_store.add_excel_path(app, &file_path)?;

    Ok(setting_data)
}

/// エクセルの設定シートを読み込む.
fn read_setting_data(file_path: &str) -> Result<SettingData, String> {
    // unwrap はエラー時にパニックしてアプリが落ちるため、? でエラーをフロントへ返す
    let reopened = ExcelHandler::open(file_path)?;
    let sheet = reopened.sheet("出力情報")?;

    let col: u32 = 2;
Ok(SettingData {
        id: sheet.get_cell_rc(3, col),
        displayName: sheet.get_cell_rc(4, col),
        playCount: sheet.get_cell_rc(5, col)
            .parse::<i8>()
            .map_err(|_| "playCount の数値変換に失敗しました".to_string())?,
        resumeNo: sheet.get_cell_rc(8, col),
        resumeOrder: sheet.get_cell_rc(9, col),
        hiddenThreshold: sheet.get_cell_rc(6, col)
            .parse::<i8>()
            .map_err(|_| "hiddenThreshold の数値変換に失敗しました".to_string())?,
        prevHiddenThreshold: sheet.get_cell_rc(7, col)
            .parse::<i8>()
            .map_err(|_| "prevHiddenThreshold の数値変換に失敗しました".to_string())?,
        audioDir: sheet.get_cell_rc(10, col),
    })
}