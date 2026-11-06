/** 出題順 (head: 先頭から / fewer: 出題回数が少ない順) */
export type QuestionOrder = "head" | "fewer";

/** アイテム (エクセルの設定シートの情報) */
export interface Item {
  /** エクセルのパス */
  filePath: string;
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
  /** 再開位置 (次に出題する問題 No。未記録なら null) */
  resumeNo: number | null;
  /** 再開位置を記録したときの出題順 */
  resumeOrder: QuestionOrder;
  /** 出題数 */
  questionCount: number;
  /** 出題順 */
  questionOrder: QuestionOrder;
  /** 自動再生 */
  autoPlay: boolean;
  /** 再生回数 */
  repeatCount: number;
  /** 再生後に次の問題へ移動する */
  autoMove: boolean;
  /** 再生速度 */
  playbackSpeed: number;
}

/** アイテム一覧の 1 件. 読み込めなかったアイテムも一覧に残す */
export interface ItemEntry {
  /** エクセルのパス */
  filePath: string;
  /** アイテム (読み込めなかった場合は null) */
  item: Item | null;
  /** 読み込めなかった理由 (読み込めた場合は null) */
  errorMessage: string | null;
}
