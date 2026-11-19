import { invoke } from "@tauri-apps/api/core";

/**
 * 音声ファイルの候補のうち、最初に存在するファイルのパスを返却する.
 * どれも無ければ null.
 * @param candidates 優先順に並べた候補のパス
 */
export const findAudioFile = (candidates: string[]): Promise<string | null> => {
  return invoke<string | null>("find_audio_file", { candidates });
};
