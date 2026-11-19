/** 音声の再生が終わったあとの動作 */
export type AfterEndedAction = "replay" | "moveNext" | "stop";

/**
 * 自動再生で 1 回の再生が終わったときに、次に何をするかを決める (spec 5.6).
 *
 * @param playedCount この問題で再生し終えた回数 (今回の再生を含む)
 * @param repeatCount 再生回数
 * @param isAutoMove 再生後に次の問題へ移動するか
 */
export const decideAfterEnded = (
  playedCount: number,
  repeatCount: number,
  isAutoMove: boolean,
): AfterEndedAction => {
  if (playedCount < repeatCount) return "replay";
  return isAutoMove ? "moveNext" : "stop";
};
