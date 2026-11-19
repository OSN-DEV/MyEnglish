import { invoke } from "@tauri-apps/api/core";
import type { Item, ItemEntry } from "../types/Item";

// Rust 側で Err(String) を返すと、そのメッセージで reject される

/**
 * 登録済みのアイテム一覧を返却する.
 * 読み込めなかったアイテムもエラーメッセージ付きで含む.
 */
export const getItems = async (): Promise<ItemEntry[]> => {
  return invoke<ItemEntry[]>("get_items");
};

/**
 * エクセルをアイテムとして登録し、読み込んだアイテムを返却する.
 * @param filePath エクセルのパス
 */
export const addItem = async (filePath: string): Promise<Item> => {
  return invoke<Item>("add_item", { filePath });
};

/**
 * アイテムを一覧から外す (エクセルファイルは削除しない).
 * @param filePath エクセルのパス
 */
export const removeItem = async (filePath: string): Promise<void> => {
  return invoke("remove_item", { filePath });
};

/**
 * アイテム一覧の並び順を保存する.
 * @param filePaths 並べ替え後のエクセルのパス (登録済みのパスすべて)
 */
export const reorderItems = async (filePaths: string[]): Promise<void> => {
  return invoke("reorder_items", { filePaths });
};
