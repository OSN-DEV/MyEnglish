use serde::Serialize;

// フロントエンドに返却したいデータの構造体
#[derive(Serialize, Clone, Debug)]
pub struct SettingData {
    pub id: String,
    pub displayName: String,
    pub playCount: i8,
    pub resumeNo: String,
    pub resumeOrder: String,
    pub hiddenThreshold: i8,
    pub prevHiddenThreshold: i8,
    pub audioDir: String
}
