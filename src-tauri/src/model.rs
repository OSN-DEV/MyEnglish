use serde::Serialize;

// フロントエンドに返却したいデータの構造体
#[derive(Serialize, Clone, Debug)]
pub struct SettingData {
    pub id: String,
    pub display_name: String,
    pub play_count: i8,
    pub resume_no: String,
    pub resume_order: String,
    pub hidden_threshold: i8,
    pub prev_hidden_threshold: i8,
    pub audio_dir: String
}
