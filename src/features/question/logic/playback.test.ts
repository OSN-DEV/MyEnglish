import { describe, expect, it } from "vitest";
import { decideAfterEnded } from "./playback";

describe("decideAfterEnded", () => {
  it("再生回数に達していなければもう一度再生する", () => {
    expect(decideAfterEnded(1, 2, false)).toBe("replay");
    expect(decideAfterEnded(1, 2, true)).toBe("replay");
    expect(decideAfterEnded(2, 3, true)).toBe("replay");
  });

  it("再生回数に達したら autoMove ON なら次へ", () => {
    expect(decideAfterEnded(1, 1, true)).toBe("moveNext");
    expect(decideAfterEnded(2, 2, true)).toBe("moveNext");
  });

  it("再生回数に達したら autoMove OFF なら止まる", () => {
    expect(decideAfterEnded(1, 1, false)).toBe("stop");
    expect(decideAfterEnded(2, 2, false)).toBe("stop");
  });
});
