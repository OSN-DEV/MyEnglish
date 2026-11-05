import { invoke } from "@tauri-apps/api/core";
import type { Item } from "../types/Item";

/**
 * アイテム設定情報一覧を返却する.
 * バックエンド (Tauri コマンド) の実装が完了するまではダミーを返す.
 */
export const getItems = async (): Promise<Item[]> => {
  return getItemsProc();
};

const getItemsProc = async (): Promise<Item[]> => {
  let items: Item[] = [];
  try {
    // Rust側のコマンドを呼び出してパスを保存
    items = await invoke<Item[]>("get_items", {});
  } catch (error) {
    console.error("fail to add excel:", error);
    return [];
  }
  return items;
};

/**
 * ダミーのアイテム情報一覧を返却する.
 */
const getItemsDummyProc = (): Item[] => {
  return [
    {
      id: "202616170000",
      displayName: "ALL IN ONE",
      playCount: 10,
      resumeNo: null,
      resumeOrder: 0,
      hiddenThreshold: 9,
      prevHiddenThreshold: 8,
      audioDir: "/User/take",
    },
    {
      id: "202616170001",
      displayName: "キクタン【Advanced】",
      playCount: 4,
      resumeNo: null,
      resumeOrder: 0,
      hiddenThreshold: 5,
      prevHiddenThreshold: 4,
      audioDir: "/User/take",
    },
    {
      id: "202616170002",
      displayName: "イラストでわかるネイティブ句動詞",
      playCount: 3,
      resumeNo: null,
      resumeOrder: 0,
      hiddenThreshold: 4,
      prevHiddenThreshold: 3,
      audioDir: "/User/take",
    },
    {
      id: "202616170003",
      displayName: "初めての英語シャドーイング",
      playCount: 0,
      resumeNo: null,
      resumeOrder: 0,
      hiddenThreshold: 3,
      prevHiddenThreshold: 0,
      audioDir: "/User/take",
    },
    {
      id: "202616170004",
      displayName: "３分間パワー音読トレーニング",
      playCount: 0,
      resumeNo: null,
      resumeOrder: 0,
      hiddenThreshold: 3,
      prevHiddenThreshold: 0,
      audioDir: "/User/take",
    },
  ];
};
