import { describe, expect, it } from "vitest";
import { resolveAudioPathCandidates } from "./audioPath";

describe("resolveAudioPathCandidates", () => {
  it("4 桁ゼロ埋め → 3 桁ゼロ埋めの順に返す", () => {
    expect(resolveAudioPathCandidates("/a/book.xlsx", "/a/audio", 1)).toEqual([
      "/a/audio/0001.mp3",
      "/a/audio/001.mp3",
    ]);
    expect(resolveAudioPathCandidates("/a/book.xlsx", "/a/audio", 71)).toEqual([
      "/a/audio/0071.mp3",
      "/a/audio/071.mp3",
    ]);
    expect(resolveAudioPathCandidates("/a/book.xlsx", "/a/audio", 123)).toEqual([
      "/a/audio/0123.mp3",
      "/a/audio/123.mp3",
    ]);
  });

  it("No が 1000 以上なら 1 件だけ", () => {
    expect(resolveAudioPathCandidates("/a/book.xlsx", "/a/audio", 1234)).toEqual([
      "/a/audio/1234.mp3",
    ]);
  });

  it("絶対パスはそのまま使い、末尾の区切りは除く", () => {
    expect(resolveAudioPathCandidates("/x/book.xlsx", "/data/audio/", 3)[0]).toBe(
      "/data/audio/0003.mp3",
    );
  });

  it("相対パスはエクセルのフォルダを基準にする", () => {
    const first = (audioDir: string) =>
      resolveAudioPathCandidates("/x/y/book.xlsx", audioDir, 3)[0];
    expect(first("./audio")).toBe("/x/y/audio/0003.mp3");
    expect(first("audio")).toBe("/x/y/audio/0003.mp3");
    expect(first("./audio/")).toBe("/x/y/audio/0003.mp3");
    expect(first("./")).toBe("/x/y/0003.mp3");
  });

  it("Windows のパスも扱える", () => {
    expect(resolveAudioPathCandidates("C:\\x\\book.xlsx", "D:\\audio", 5)[0]).toBe(
      "D:\\audio/0005.mp3",
    );
    expect(resolveAudioPathCandidates("C:\\x\\book.xlsx", ".\\audio", 5)[0]).toBe(
      "C:\\x/audio/0005.mp3",
    );
  });
});
