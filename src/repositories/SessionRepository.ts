import { invoke } from "@tauri-apps/api/core";
import type { SessionResult } from "../types/Session";

/**
 * セッションの結果をエクセルへ書き戻す.
 * エクセルで開かれている等で保存できない場合は、エラーメッセージで reject される.
 */
export const saveSession = (result: SessionResult): Promise<void> => {
  return invoke("save_session", { result });
};
