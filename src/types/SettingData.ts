/** エクセルの設定シートの情報 (バックエンド add_excel の戻り値。Rust の model.rs の SettingData と対応) */
export interface SettingData {
  /** id */
  id: string;
  /** 表示名 */
  displayName: string;
  /** 周回数 */
  playCount: number;
  /** 再開位置 */
  resumeNo: string;
  /** 再開位置を記録したときの出題順 */
  resumeOrder: string;
  /** 出題対象の閾値 */
  hiddenThreshold: number;
  /** 前回の出題対象の閾値 */
  prevHiddenThreshold: number;
  /** 音声ファイルの格納フォルダ */
  audioDir: string;
}
