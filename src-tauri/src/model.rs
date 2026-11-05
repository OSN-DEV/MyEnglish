use serde::Serialize;

// フロントエンドに返却したいデータの構造体
#[derive(Serialize, Clone, Debug)]
// フロントへはキャメルケース (display_name → displayName) で渡す
#[serde(rename_all = "camelCase")]
pub struct SettingData {
    pub id: String,
    pub display_name: String,
    pub play_count: i8,
    pub hidden_threshold: i8,
    pub prev_hidden_threshold: i8,
    pub audio_dir: String,
    pub resume_no: String,
    pub resume_order: String,
}
