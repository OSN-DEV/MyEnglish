import { describe, expect, it } from "vitest";
import type { Question } from "../../../types/Question";
import { takeSessionQuestions } from "./session";

/** テスト用の問題を No だけ指定して作る */
const question = (no: number): Question => ({
  no,
  title1: "",
  title2: "",
  title3: "",
  askedCount: 0,
  english: `english ${no}`,
  japanese: "",
  memo: "",
  isHidden: false,
});

describe("takeSessionQuestions", () => {
  const eligibleQuestions = [question(3), question(1), question(2)];

  it("出題順に並べた先頭から出題数ぶん取り出す", () => {
    const result = takeSessionQuestions(eligibleQuestions, 2);
    expect(result.map((q) => q.no)).toEqual([3, 1]);
  });

  it("出題数が出題対象の件数より多い場合は、出題対象の件数ぶんだけ取り出す", () => {
    const result = takeSessionQuestions(eligibleQuestions, 10);
    expect(result.map((q) => q.no)).toEqual([3, 1, 2]);
  });

  it("出題数が 0 の場合は全件を取り出す", () => {
    const result = takeSessionQuestions(eligibleQuestions, 0);
    expect(result.map((q) => q.no)).toEqual([3, 1, 2]);
  });

  it("出題対象が 0 件の場合は空になる", () => {
    expect(takeSessionQuestions([], 10)).toEqual([]);
  });
});
