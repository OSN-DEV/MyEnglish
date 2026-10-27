
export interface QuestionData {
    /** no */
    no: number
    /** 見出し１ */
    title1: string | null
    /** 見出し２ */
    title2: string | null
    /** 見出し３ */
    title3: string | null
    /** 見出し４ */
    playCount: number
    /** 英文 */
    english: string
    /** 日本語訳 */
    japanese: string
    /** メモ */
    memo: string
    /** 表示フラグ */
    isHidden: boolean
}
