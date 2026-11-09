use serde::{Deserialize, Serialize};

/// 出題順. エクセルには数値 (0 = 先頭から / 1 = 出題回数が少ない順) で保存する.
// フロントへは "head" / "fewer" の文字列で渡す
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum QuestionOrder {
    Head,
    Fewer,
}

/// アイテム (エクセルの設定シートの内容).
// フロントへはキャメルケース (display_name → displayName) で渡す
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub file_path: String,             // エクセルのパス
    pub id: String,                    // アイテムの識別子
    pub display_name: String,          // 表示名称
    pub play_count: u32,               // 周回数
    pub hidden_threshold: u32,         // 出題対象の閾値
    pub prev_hidden_threshold: u32,    // 前回の出題対象の閾値
    pub audio_dir: String,             // 音声ファイルの格納フォルダ
    pub resume_no: Option<u32>,        // 再開位置 (次に出題する問題 No。未記録なら None)
    pub resume_order: QuestionOrder,   // 再開位置を記録したときの出題順
    pub question_count: u32,           // 出題数
    pub question_order: QuestionOrder, // 出題順
    pub auto_play: bool,               // 自動再生
    pub repeat_count: u32,             // 再生回数
    pub auto_move: bool,               // 再生後に次の問題へ移動する
    pub playback_speed: f64,           // 再生速度
}

/// アイテム一覧の 1 件. 読み込めなかったアイテムも一覧に残すため、エラーと一緒に返す.
#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ItemEntry {
    pub file_path: String,
    pub item: Option<Item>,            // 読み込めなかった場合は None
    pub error_message: Option<String>, // 読み込めた場合は None
}

/// 問題の１件
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub no: u32,
    pub title1: String,
    pub title2: String,
    pub title3: String,
    pub asked_count: u32,
    pub english: String,
    pub japanese: String,
    pub memo: String,
    pub is_hidden: bool,
}
