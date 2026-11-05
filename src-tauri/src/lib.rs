use crate::excel::ExcelHandler;
use crate::store::AppStore;

pub mod debug_menu;
pub mod excel;
pub mod model;
pub mod store;
use crate::model::Item;
use std::path::Path;

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
        .menu(debug_menu::build)
        .on_menu_event(debug_menu::handle_event)
        .invoke_handler(tauri::generate_handler![greet, add_item, get_items])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
// 追加されているエクセル一覧を取得する
fn get_items(app: tauri::AppHandle) -> Result<Vec<Item>, String> {
    let app_store = AppStore {};
    let paths = app_store
        .get_item_paths(app.clone())
        .map_err(|e| format!("Failed to getItems {}", e))?;

    let mut items = Vec::new();

    for path in &paths {
        let file = Path::new(path);
        if !file.exists() {
            app_store.remove_item_path(app.clone(), path);
            continue;
        }

        let item = std::panic::catch_unwind(|| read_item(&path)).unwrap_or_else(|_| {
            Err(format!(
                "エクセルの読み込み中に予期しないエラーが発生しました: {}",
                path
            ))
        })?;
        items.push(item);
    }

    Ok(items)
}

// エクセルを追加する
#[tauri::command]
fn add_item(app: tauri::AppHandle, file_path: String) -> Result<Item, String> {
    // ライブラリ内部でパニックが起きてもアプリを落とさず、エラーとしてフロントへ返す
    let item = std::panic::catch_unwind(|| read_item(&file_path)).unwrap_or_else(|_| {
        Err(format!(
            "エクセルの読み込み中に予期しないエラーが発生しました: {}",
            file_path
        ))
    })?;

    // 読み込めたファイルだけを登録する
    // add_excel_pathのfile_pathのパラメータがStringだと、そこで所有権が移動してしまうので
    // &strで受け取るようにしている。
    let app_store = AppStore {};
    // ?; Resultを返す関数内で使える演算子。例外が発生した場合にエラーを返却して移行の処理を実行しない
    app_store.add_item_path(app, &file_path)?;

    Ok(item)
}

/// エクセルの設定シートを読み込む.
fn read_item(file_path: &str) -> Result<Item, String> {
    // unwrap はエラー時にパニックしてアプリが落ちるため、? でエラーをフロントへ返す
    let reopened = ExcelHandler::open(file_path)?;
    let sheet = reopened.sheet("出力情報")?;

    let col: u32 = 3;
    // Ok(SettingData {
    //     id: sheet.get_cell_rc(1, col),
    //     display_name: sheet.get_cell_rc(2, col),
    //     play_count: sheet.get_cell_rc(3, col).parse::<u8>().map_err(|_| "Failed to convert playcount".to_string())?,
    //     hidden_threshold: sheet.get_cell_rc(4, col).parse::<u8>().map_err(|_| "Failed to convert hiddenThreshold".to_string())?,
    //     prev_hidden_threshold: sheet.get_cell_rc(5, col).parse::<u8>().map_err(|_| "Failed to convert prevHiddenThreshold".to_string())?,
    //     audio_dir: sheet.get_cell_rc(6, col),
    //     resume_no: sheet.get_cell_rc(7, col),
    //     resume_order: sheet.get_cell_rc(8, col).parse::<u8>().map_err(|_| "Failed to convert resumeOrder".to_string())?,
    //     question_count: sheet.get_cell_rc(9, col).parse::<u8>().map_err(|_| "Failed to convert questionCount".to_string())?,
    //     question_order: sheet.get_cell_rc(10, col).parse::<u8>().map_err(|_| "Failed to convert questionCount".to_string())?,
    //     auto_play: sheet.get_cell_rc(11, col).parse<bool>().map_err(|_| "Failed to convert autoPlay".to_string())?,
    //     repeat_count: sheet.get_cell_rc(12, col).parse::<u8>().map_err(|_| "Failed to convert repeatCount".to_string())?,
    //     auto_move: sheet.get_cell_rc(13, col).parse::<bool>().map_err(|_| "Failed to convert autoMove".to_string())?,
    //     playback_speed: sheet.get_cell_rc(14, col).parse::<f32>().map_err(|_| "Failed to convert playbackSpeed".to_string())?
    // })

    let get = |row: u32| sheet.get_cell_rc(row, col);
    // let parse = |row: u32, field_name: &str| sheet.parse_cell!(row, col, &field_name);

    // クロージャーを使うと最初にクロージャーを読んだときの型に固定されてしまうため、マクロを使用する。
    macro_rules! parse_cell {
        // 引数として「行番号」と「フィールド名（文字列）」を受け取る
        ($row:expr, $field_name:expr) => {
            // マクロ内でシートからの取得・パース・エラー変換を完結させる
            // Target Type Inference（代入先の型推論）が働くため、u8やboolを自動で切り替えられます
            sheet.get_cell_rc($row, col)
                .parse()
                .map_err(|_| format!("Failed to convert {}", $field_name))
        };
    }

    Ok(Item {
        id: get(1),
        display_name: get(2),
        play_count: parse_cell!(3, "play_count")?,
        hidden_threshold: parse_cell!(4, "hidden_threshold")?,
        prev_hidden_threshold: parse_cell!(5, "prev_hidden_threshold")?,
        audio_dir: get(6),
        resume_no: get(7),
        resume_order: parse_cell!(8, "resume_order")?,
        question_count: parse_cell!(9, "question_count")?,
        question_order: parse_cell!(10, "question_order")?,
        auto_play: parse_cell!(11, "auto_play")?,
        repeat_count: parse_cell!(12, "repeat_count")?,
        auto_move: parse_cell!(13, "auto_move")?,
        playback_speed: parse_cell!(14, "playback_speed")?,
    })
}
