use tauri_plugin_store::StoreExt;
use serde_json::json;

// アプリケーションの状態やデータを保持する構造体
pub struct AppStore {}

impl AppStore {
    // コンストラクタ
    pub fn new() -> Self {
        Self {}
    }

    /**
     * パスを追加する(すでに登録済みの場合は追加しない)
     *
     */
    pub fn add_excel_path(&self, app: tauri::AppHandle, file_path: &str) -> Result<(), String> {
        // app.store("setting.json")
        // → 成功時はストアのインスタンスを返却する(Result<Store, Error>)
        // .map_err(|e| e.to_string())
        // → (e) => e.toString()と同じようなイメージ。
        // 末尾の ?;
        // → 処理に成功した場合はstoreにインスタンスを設定。失敗した場合は即座に呼び出し元にリターンする
        let store = app.store("settings.json").map_err(|e| e.to_string())?;

        // if let Some(value) = store.get("excel_path")
        // →
        // if store.get("excel_path").is_some() {
        //   let value = store.get("excel_path").unwrap();
        // }
        // と同義
        let mut paths: Vec<String> = if let Some(value) = store.get("excel_path") {
            serde_json::from_value(value.clone()).unwrap_or_default()
        } else {
            Vec::new()
        };

        // 2. まだリストに含まれていない場合のみ追加する（重複を防ぐ場合）
        if !paths.contains(&file_path.to_string()) {
            paths.push(file_path.to_string());
        }

        // 3. リストを JSON の配列としてストアに保存する
        store.set("excel_path".to_string(), json!(paths));

        // （必要に応じてファイルに書き込み保存）
        store.save().map_err(|e| e.to_string())?;

        Ok(())
    }
}
