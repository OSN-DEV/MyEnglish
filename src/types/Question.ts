
export interface Question {
    /** no */
    no: number
    /** 見出し１ */
    title1: string | null
    /** 見出し２ */
    title2: string | null
    /** 見出し３ */
    title3: string | null
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
