import type { Item } from "./Item";

/** 書き戻す問題 1 件分の変更. 変わっていない項目は null (エクセルに書かない) */
export interface QuestionProgress {
  /** 問題 No */
  no: number;
  /** 出題回数 (E 列) */
  askedCount: number | null;
  /** 非表示 (I 列) */
  isHidden: boolean | null;
}

/** セッション終了時にエクセルへ書き戻す内容 */
export interface SessionResult {
  /** 設定シートに書き戻す値 (playCount・resumeNo・resumeOrder と、開始時の出題・再生設定) */
  item: Item;
  /** 問題シートに書き戻す、変更のあった問題 */
  progresses: QuestionProgress[];
}
