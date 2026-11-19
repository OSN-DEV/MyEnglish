import { describe, expect, it } from "vitest";
import type { Item } from "../../../types/Item";
import type { Question } from "../../../types/Question";
import {
  goNext,
  goPrev,
  interruptSession,
  setHidden,
  startSession,
  toSessionResult,
  type SessionState,
} from "./session";

/** テスト用の問題 */
const question = (no: number, askedCount = 0, isHidden = false): Question => ({
  no,
  title1: "",
  title2: "",
  title3: "",
  askedCount,
  english: `english ${no}`,
  japanese: "",
  memo: "",
  isHidden,
});

/** テスト用のアイテム (必要な項目だけ上書きする) */
const item = (overrides: Partial<Item> = {}): Item => ({
  filePath: "/tmp/book.xlsx",
  id: "1",
  displayName: "test",
  playCount: 0,
  hiddenThreshold: 3,
  prevHiddenThreshold: 1,
  audioDir: "./audio",
  resumeNo: null,
  resumeOrder: "head",
  questionCount: 10,
  questionOrder: "head",
  autoPlay: false,
  repeatCount: 1,
  autoMove: false,
  playbackSpeed: 1.0,
  ...overrides,
});

const nos = (questions: Question[]) => questions.map((q) => q.no);

/** startSession が null でないことを確かめて返す */
const start = (ordered: Question[], overrides: Partial<Item> = {}, isResume = false) => {
  const state = startSession(ordered, item(overrides), isResume);
  if (state === null) throw new Error("session is null");
  return state;
};

/** n 回「次へ」を押す */
const next = (state: SessionState, times = 1): SessionState => {
  let current = state;
  for (let i = 0; i < times; i++) current = goNext(current).state;
  return current;
};

describe("startSession", () => {
  const ordered = [question(1), question(2), question(3), question(4), question(5)];

  it("1. 非表示と、出題回数 = hiddenThreshold の問題は出題対象から外れる", () => {
    const state = start([question(1, 0, true), question(2, 3), question(3, 2)]);
    expect(nos(state.eligible)).toEqual([3]);
  });

  it("出題対象が 0 件なら null", () => {
    expect(startSession([question(1, 3)], item(), false)).toBeNull();
  });

  it("3. 出題数 > 出題対象の件数 → 出題対象の件数ぶん", () => {
    expect(nos(start(ordered, { questionCount: 10 }).questions)).toEqual([1, 2, 3, 4, 5]);
  });

  it("3a. 出題数 0 → 全件", () => {
    expect(nos(start(ordered, { questionCount: 0 }).questions)).toEqual([1, 2, 3, 4, 5]);
  });

  it("開始は先頭から出題数ぶん (resumeNo があっても無視)", () => {
    const state = start(ordered, { questionCount: 2, resumeNo: 3 }, false);
    expect(nos(state.questions)).toEqual([1, 2]);
  });

  it("4. 再開: resumeOrder 一致 → resumeNo の位置から", () => {
    const state = start(ordered, { questionCount: 2, resumeNo: 3 }, true);
    expect(nos(state.questions)).toEqual([3, 4]);
  });

  it("4. 再開: resumeOrder 不一致 → 先頭から", () => {
    const state = start(
      ordered,
      { questionCount: 2, resumeNo: 3, resumeOrder: "fewer", questionOrder: "head" },
      true,
    );
    expect(nos(state.questions)).toEqual([1, 2]);
  });

  it("再開で出題数 0 → resumeNo の位置から最後まで", () => {
    const state = start(ordered, { questionCount: 0, resumeNo: 4 }, true);
    expect(nos(state.questions)).toEqual([4, 5]);
  });

  it("5. 再開: resumeNo の問題が閾値到達 → 並び順でその次の問題から", () => {
    const withReached = [question(1), question(2), question(3, 3), question(4)];
    const state = start(withReached, { questionCount: 2, resumeNo: 3 }, true);
    expect(nos(state.questions)).toEqual([4]);
  });

  it("再開: resumeNo より後ろに出題対象が無い → 先頭から", () => {
    const withReached = [question(1), question(2), question(3, 3)];
    const state = start(withReached, { questionCount: 2, resumeNo: 3 }, true);
    expect(nos(state.questions)).toEqual([1, 2]);
  });

  it("再開: resumeNo の問題がエクセルに無い → 先頭から", () => {
    const state = start(ordered, { questionCount: 1, resumeNo: 99 }, true);
    expect(nos(state.questions)).toEqual([1]);
  });
});

describe("出題中", () => {
  const ordered = [question(1), question(2, 1), question(3), question(4)];

  it("「次へ」で移動元の出題回数 +1、resumeNo は次の問題", () => {
    const { state, isFinished } = goNext(start(ordered, { questionCount: 3 }));
    expect(isFinished).toBe(false);
    expect(state.index).toBe(1);
    expect(state.askedCounts).toEqual({ 1: 1 });
    expect(state.resumeNo).toBe(2);
  });

  it("出題回数はエクセルの値に加算する", () => {
    const state = next(start(ordered, { questionCount: 3 }), 2);
    expect(state.askedCounts).toEqual({ 1: 1, 2: 2 });
  });

  it("セッションの最後の問題で「次へ」→ 終了", () => {
    const state = next(start(ordered, { questionCount: 2 }), 1);
    const result = goNext(state);
    expect(result.isFinished).toBe(true);
    expect(result.state.askedCounts).toEqual({ 1: 1, 2: 2 });
    expect(result.state.resumeNo).toBe(3);
  });

  it("「前へ」は +1 しない。resumeNo は表示中の問題", () => {
    const state = goPrev(next(start(ordered), 2));
    expect(state.index).toBe(1);
    expect(state.askedCounts).toEqual({ 1: 1, 2: 2 });
    expect(state.resumeNo).toBe(2);
  });

  it("先頭で「前へ」は何もしない", () => {
    const state = start(ordered);
    expect(goPrev(state)).toBe(state);
  });

  it("6. 「前へ」で戻ってから「次へ」→ その問題が再度 +1 される", () => {
    const state = goNext(goPrev(next(start(ordered), 1))).state;
    expect(state.askedCounts).toEqual({ 1: 2 });
  });

  it("7. 出題対象の最後で「次へ」→ playCount +1、resumeNo は先頭", () => {
    const result = goNext(next(start(ordered, { questionCount: 0, playCount: 2 }), 3));
    expect(result.isFinished).toBe(true);
    expect(result.state.playCount).toBe(3);
    expect(result.state.resumeNo).toBe(1);
  });

  it("8. 出題対象の最後に達しない → playCount は増えない", () => {
    const result = goNext(next(start(ordered, { questionCount: 2, playCount: 2 }), 1));
    expect(result.isFinished).toBe(true);
    expect(result.state.playCount).toBe(2);
  });

  it("fewer: 出題順の最後 (No 最大でなくても) で周回する", () => {
    // fewer で並べた結果 [4, 1] を想定 (No 最大の 4 が先頭)
    const fewerOrdered = [question(4), question(1, 2)];
    const state = start(fewerOrdered, { questionOrder: "fewer", questionCount: 0 });
    const afterFirst = goNext(state).state;
    expect(afterFirst.playCount).toBe(0);
    const result = goNext(afterFirst);
    expect(result.state.playCount).toBe(1);
    expect(result.state.resumeNo).toBe(4);
    expect(result.state.resumeOrder).toBe("fewer");
  });

  it("9. 中断 → 出題回数は +1 されず、resumeNo は表示中の問題", () => {
    const state = interruptSession(next(start(ordered), 1));
    expect(state.askedCounts).toEqual({ 1: 1 });
    expect(state.resumeNo).toBe(2);
  });

  it("中断 (開始直後) → resumeNo は最初の問題", () => {
    const state = interruptSession(start(ordered, { resumeNo: 3 }, true));
    expect(state.askedCounts).toEqual({});
    expect(state.resumeNo).toBe(3);
  });
});

describe("toSessionResult", () => {
  const ordered = [question(1), question(2), question(3)];

  it("周回数・再開位置を item に反映し、変わった問題だけを返す", () => {
    let state = start(ordered, { playCount: 1, questionOrder: "head" });
    state = setHidden(next(state, 1), 3, true);
    const result = toSessionResult(interruptSession(state), item({ playCount: 1 }));
    expect(result.item.playCount).toBe(1);
    expect(result.item.resumeNo).toBe(2);
    expect(result.item.resumeOrder).toBe("head");
    expect(result.progresses).toEqual([
      { no: 1, askedCount: 1, isHidden: null },
      { no: 3, askedCount: null, isHidden: true },
    ]);
  });

  it("非表示を戻した問題は書き戻さない", () => {
    const state = setHidden(setHidden(start(ordered), 2, true), 2, false);
    expect(toSessionResult(state, item()).progresses).toEqual([]);
  });

  it("出題回数と非表示の両方が変わった問題は 1 件にまとめる", () => {
    const state = setHidden(next(start(ordered), 1), 1, true);
    expect(toSessionResult(state, item()).progresses).toEqual([
      { no: 1, askedCount: 1, isHidden: true },
    ]);
  });

  it("出題・再生設定は開始時の item の値", () => {
    const startItem = item({ questionCount: 5, playbackSpeed: 1.3, autoPlay: true });
    const state = startSession(ordered, startItem, false)!;
    const result = toSessionResult(state, startItem);
    expect(result.item.questionCount).toBe(5);
    expect(result.item.playbackSpeed).toBe(1.3);
    expect(result.item.autoPlay).toBe(true);
  });
});
