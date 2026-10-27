interface ItemSetting {
    /** id */
    id: string
    /** 表示名 */
    displayName: string
    /** 周回数 */
    playCount: number
    /** 再開位置  */
    resumeNo?: number | null
    /** 再開位置を記録したときの出題順 */
    resumeOrder?: number | null
    /** 出題対象の閾値 */
    hiddenThreshhold: number
    /** 前回医の出題対象の閾値 */
    prevHiddenThreshold: number
    /** 音声ファイルの格納フォルダ */
    audioDir: string
    /** 出題数 */
    questionCount?: number
    /** 出題順(0:先頭から、1:出題数が少ない) */
    order?: number
    /** 自動再生 */
    autoPlay?:boolean
    /** 再生回数 */
    autoPlayCount?:number
    /** 再生後の移動 */
    autoMove?:boolean
    /** 再生速度 */
    autoPlaySpeed?:number
}
