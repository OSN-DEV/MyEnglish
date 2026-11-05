/** アイテム (エクセルの設定シートの情報 ＋ アプリ側で保持する出題・再生設定) */
export interface Item {
  /** id */
  id: string;
  /** 表示名 */
  displayName: string;
  /** 周回数 */
  playCount: number;
  /** 出題対象の閾値 */
  hiddenThreshold: number;
  /** 前回の出題対象の閾値 */
  prevHiddenThreshold: number;
  /** 音声ファイルの格納フォルダ */
  audioDir: string;
  /** 再開位置 */
  resumeNo: number | null;
  /** 再開位置を記録したときの出題順 */
  resumeOrder: number;
  /** 出題数 */
  questionCount?: number;
  /** 出題順 */
  questionOrder?: number;
  /** 自動再生 */
  autoPlay?: boolean;
  /** 再生回数 */
  repeatCount?: number;
  /** 再生後の移動 */
  autoMove?: boolean;
  /** 再生速度 */
  playbackSpeed?: number;
}

