import type { Item, QuestionOrder } from "../../../types/Item";
import type { Question } from "../../../types/Question";
import type { QuestionProgress, SessionResult } from "../../../types/Session";

/**
 * 出題セッションの状態.
 * 画面の操作ごとに下の純粋関数で新しい状態を作り、終了時に SessionResult にしてエクセルへ書き戻す.
 */
export interface SessionState {
  /** 出題対象 (出題順). 周回・resumeNo の判定に使う */
  eligible: Question[];
  /** 今回出題する問題 */
  questions: Question[];
  /** 表示中の問題の位置 (questions 上) */
  index: number;
  /** 出題回数が変わった問題の、新しい出題回数 (No → 回数) */
  askedCounts: Record<number, number>;
  /** 非表示にした問題の No */
  hiddenNos: number[];
  /** 周回数 */
  playCount: number;
  /** 次に出題すべき問題 No */
  resumeNo: number | null;
  /** 今回の出題順 */
  resumeOrder: QuestionOrder;
}

/** 出題対象か (非表示でなく、出題回数 < hiddenThreshold). spec 5.1 */
export const isEligible = (question: Question, hiddenThreshold: number): boolean =>
  !question.isHidden && question.askedCount < hiddenThreshold;

/**
 * 出題対象の中で、出題を始める位置を求める (spec 5.3).
 * 再開で出題順が前回と同じなら resumeNo の位置から。その問題が出題対象外なら並び順で次の出題対象から.
 * それ以外 (開始・出題順が違う・位置が見つからない) は先頭 (0).
 * @param ordered 全問題 (出題順。出題対象外も含む)
 * @param eligible 出題対象 (出題順)
 */
export const findStartIndex = (
  ordered: Question[],
  eligible: Question[],
  item: Item,
  isResume: boolean,
): number => {
  if (!isResume || item.resumeNo === null || item.questionOrder !== item.resumeOrder) {
    return 0;
  }
  const resumePosition = ordered.findIndex((q) => q.no === item.resumeNo);
  if (resumePosition < 0) return 0;
  // resumeNo の位置から後ろで、最初の出題対象
  const eligibleNos = new Set(eligible.map((q) => q.no));
  const next = ordered.slice(resumePosition).find((q) => eligibleNos.has(q.no));
  if (next === undefined) return 0;
  return eligible.findIndex((q) => q.no === next.no);
};

/**
 * セッションを開始する (spec 5.3). 出題対象が無ければ null.
 * @param ordered 全問題 (出題順。get_questions の戻り値)
 * @param item 開始時の設定 (トップ画面の値)
 * @param isResume true: 前回の続きから再開、false: 先頭から開始
 */
export const startSession = (
  ordered: Question[],
  item: Item,
  isResume: boolean,
): SessionState | null => {
  const eligible = ordered.filter((q) => isEligible(q, item.hiddenThreshold));
  if (eligible.length === 0) return null;

  const start = findStartIndex(ordered, eligible, item, isResume);
  // 出題数 0 = 開始位置から最後まで (全件)。slice は終わりが範囲外でもあるだけ返す
  const end = item.questionCount === 0 ? eligible.length : start + item.questionCount;
  const questions = eligible.slice(start, end);

  return {
    eligible,
    questions,
    index: 0,
    askedCounts: {},
    hiddenNos: [],
    playCount: item.playCount,
    resumeNo: questions[0].no,
    resumeOrder: item.questionOrder,
  };
};

/** 表示中の問題 */
export const currentQuestion = (state: SessionState): Question => state.questions[state.index];

/** 問題の現在の出題回数 (セッション中の加算を含む) */
export const askedCountOf = (state: SessionState, question: Question): number =>
  state.askedCounts[question.no] ?? question.askedCount;

/**
 * 「次へ」(自動移動・最後の問題での終了を含む) (spec 5.4, 5.5).
 * 表示中の問題の出題回数を +1 し、resumeNo を出題対象で次の問題にする.
 * 表示中が出題対象の最後なら周回数 +1、resumeNo は出題対象の先頭.
 * @returns isFinished: セッションの最後の問題だった (セッション終了)
 */
export const goNext = (state: SessionState): { state: SessionState; isFinished: boolean } => {
  const question = currentQuestion(state);
  const askedCounts = { ...state.askedCounts, [question.no]: askedCountOf(state, question) + 1 };

  const position = state.eligible.findIndex((q) => q.no === question.no);
  const isLapEnd = position === state.eligible.length - 1;
  const playCount = isLapEnd ? state.playCount + 1 : state.playCount;
  const resumeNo = isLapEnd ? state.eligible[0].no : state.eligible[position + 1].no;

  const isFinished = state.index === state.questions.length - 1;
  const index = isFinished ? state.index : state.index + 1;
  return { state: { ...state, askedCounts, playCount, resumeNo, index }, isFinished };
};

/** 「前へ」. 出題回数は加算しない. 先頭では何もしない */
export const goPrev = (state: SessionState): SessionState => {
  if (state.index === 0) return state;
  const index = state.index - 1;
  return { ...state, index, resumeNo: state.questions[index].no };
};

/** 「終了 (中断)」. 出題回数は加算せず、resumeNo は表示中の問題 */
export const interruptSession = (state: SessionState): SessionState => ({
  ...state,
  resumeNo: currentQuestion(state).no,
});

/** 問題の非表示フラグを切り替える */
export const setHidden = (state: SessionState, no: number, isHidden: boolean): SessionState => {
  const others = state.hiddenNos.filter((hiddenNo) => hiddenNo !== no);
  return { ...state, hiddenNos: isHidden ? [...others, no] : others };
};

/** 問題が非表示にされているか */
export const isHiddenInSession = (state: SessionState, no: number): boolean =>
  state.hiddenNos.includes(no);

/**
 * エクセルへ書き戻す内容を作る (spec 6).
 * 出題・再生設定は開始時の item の値をそのまま書き戻す.
 * @param item 開始時の設定
 */
export const toSessionResult = (state: SessionState, item: Item): SessionResult => {
  const changedNos = new Set([...Object.keys(state.askedCounts).map(Number), ...state.hiddenNos]);
  // Set は重複しないので、出題回数と非表示の両方が変わった問題も 1 件にまとまる
  const progresses: QuestionProgress[] = [...changedNos]
    .sort((a, b) => a - b)
    .map((no) => ({
      no,
      askedCount: state.askedCounts[no] ?? null,
      isHidden: state.hiddenNos.includes(no) ? true : null,
    }));
  return {
    item: {
      ...item,
      playCount: state.playCount,
      resumeNo: state.resumeNo,
      resumeOrder: state.resumeOrder,
    },
    progresses,
  };
};
