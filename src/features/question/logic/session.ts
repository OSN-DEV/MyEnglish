import type { Question } from "../../../types/Question";

/**
 * 今回のセッションで出題する問題を取り出す (開始: 先頭から出題数ぶん).
 * @param eligibleQuestions 出題対象 (出題順に並べ済み)
 * @param questionCount 出題数. 0 の場合は全件
 */
// TODO: 再開 (resumeNo の位置から) は quiz-logic の実装時に追加する
export const takeSessionQuestions = (
  eligibleQuestions: Question[],
  questionCount: number,
): Question[] => {
  // 0 = 全件 (spec.md 5.3)
  if (questionCount === 0) {
    return eligibleQuestions;
  }
  // slice は元の配列を変えずに新しい配列を返す. 件数が足りなければあるだけ返す
  return eligibleQuestions.slice(0, questionCount);
};
