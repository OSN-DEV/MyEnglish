/** 問題 (問題シート Phrases の 1 行). 任意の列が空の場合は "" */
export interface Question {
    /** no */
    no: number
    /** 見出し１ */
    title1: string
    /** 見出し２ */
    title2: string
    /** 見出し３ */
    title3: string
    /** 出題回数 */
    askedCount: number
    /** 英文 */
    english: string
    /** 日本語訳 */
    japanese: string
    /** メモ */
    memo: string
    /** 非表示フラグ */
    isHidden: boolean
}
