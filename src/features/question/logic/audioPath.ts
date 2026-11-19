/** 絶対パスか (`/` 始まり、または `C:\` / `C:/` 形式) */
const isAbsolutePath = (path: string): boolean =>
  path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path);

/** パスの末尾の区切り文字 (`/` / `\`) を取り除く */
const trimTrailingSeparator = (path: string): string => path.replace(/[\\/]+$/, "");

/**
 * 音声ファイルの格納フォルダを求める.
 * audioDir が相対パスならエクセルのあるフォルダを基準にする.
 */
const resolveAudioDir = (filePath: string, audioDir: string): string => {
  if (isAbsolutePath(audioDir)) {
    return trimTrailingSeparator(audioDir);
  }
  // エクセルのフォルダ = 最後の区切り文字より前
  const lastSeparator = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  const excelDir = lastSeparator >= 0 ? filePath.slice(0, lastSeparator) : ".";
  const relative = trimTrailingSeparator(audioDir.replace(/^\.[\\/]/, ""));
  return relative === "" || relative === "." ? excelDir : `${excelDir}/${relative}`;
};

/** ファイル名のゼロ埋め桁数. 先頭ほど優先 (spec 3.3) */
const PAD_LENGTHS = [4, 3];

/**
 * 問題の音声ファイルの候補パスを優先順に返す (spec 3.3).
 * ファイル名は No を 4 桁ゼロ埋めした `.mp3`、無ければ 3 桁ゼロ埋め。
 * (No が 1000 以上なら 4 桁と 3 桁は同じ名前になるので 1 件だけ)
 *
 * @param filePath エクセルのパス
 * @param audioDir 音声ファイルの格納フォルダ (絶対パス or エクセルからの相対パス)
 * @param no 問題 No
 */
export const resolveAudioPathCandidates = (
  filePath: string,
  audioDir: string,
  no: number,
): string[] => {
  const dir = resolveAudioDir(filePath, audioDir);
  const fileNames = PAD_LENGTHS.map((length) => `${String(no).padStart(length, "0")}.mp3`);
  // Set で重複を除く (挿入順は保たれる)
  return [...new Set(fileNames)].map((fileName) => `${dir}/${fileName}`);
};
