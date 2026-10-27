/** 出題順 (head: 先頭から、fewer: 出題数が少ない順) */
export type QuestionOrder = "head" | "fewer";

/** エクセルの設定シートから読み込む情報 */
export interface ItemSetting {
  /** id */
  id: string;
  /** 表示名 */
  displayName: string;
  /** 周回数 */
  playCount: number;
  /** 再開位置 */
  resumeNo: number | null;
  /** 再開位置を記録したときの出題順 */
  resumeOrder: QuestionOrder | null;
  /** 出題対象の閾値 */
  hiddenThreshold: number;
  /** 前回の出題対象の閾値 */
  prevHiddenThreshold: number;
  /** 音声ファイルの格納フォルダ */
  audioDir: string;
  /** 出題数 */
  questionCount?: number;
  /** 出題順 */
  order?: QuestionOrder;
  /** 自動再生 */
  autoPlay?: boolean;
  /** 再生回数 */
  autoPlayCount?: number;
  /** 再生後の移動 */
  autoMove?: boolean;
  /** 再生速度 */
  autoPlaySpeed?: number;
}

