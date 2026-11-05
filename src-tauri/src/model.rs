use serde::Serialize;

// フロントエンドに返却したいデータの構造体
#[derive(Serialize, Clone, Debug)]

// フロントへはキャメルケース (display_name → displayName) で渡す
#[serde(rename_all = "camelCase")]
pub struct SettingData {
    pub id: String,                 // id
    pub display_name: String,       // 表示名称
    pub play_count: u8,             // 再生回数
    pub hidden_threshold: u8,       // 非表示の閾値
    pub prev_hidden_threshold: u8,  // 前回の非表示の閾値
    pub audio_dir: String,          // オーディオファイルの格納フォルダ    
    pub resume_no: String,          // リジューム予定の問題番号
    pub resume_order: u8,           // リジューム時の問題並び順
    pub question_count: u8,         // 出題数
    pub question_order: u8,         // 出題順
    pub auto_play: bool,            // 自動再生
    pub repeat_count: u8,           // 再生回数
    pub auto_move: bool,            // 自動移動
    pub playback_speed: f32         // 再生速度
}
