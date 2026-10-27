import type { ItemSetting } from "../types/ItemSetting";

/** 出題・再生設定の既定値 */
// export const DEFAULT_SESSION_SETTING: SessionSetting = {
//   questionCount: 10,
//   order: "head",
//   autoPlay: true,
//   autoPlayCount: 1,
//   autoMove: true,
//   autoPlaySpeed: 1.0,
// };

/**
 * アイテム設定情報一覧を返却する.
 * バックエンド (Tauri コマンド) の実装が完了するまではダミーを返す.
 */
export const getItemSettings = async (): Promise<ItemSetting[]> => {
  return getItemSettingsProcDummy().map((info) => ({
    ...info,
    // ...DEFAULT_SESSION_SETTING,
  }));
};

/**
 * ダミーのアイテム情報一覧を返却する.
 */
const getItemSettingsProcDummy = (): ItemSetting[] => {
  return [
    {
      id: "202616170000",
      displayName: "ALL IN ONE",
      playCount: 10,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshold: 9,
      prevHiddenThreshold: 8,
      audioDir: "/User/take",
    },
    {
      id: "202616170001",
      displayName: "キクタン【Advanced】",
      playCount: 4,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshold: 5,
      prevHiddenThreshold: 4,
      audioDir: "/User/take",
    },
    {
      id: "202616170002",
      displayName: "イラストでわかるネイティブ句動詞",
      playCount: 3,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshold: 4,
      prevHiddenThreshold: 3,
      audioDir: "/User/take",
    },
    {
      id: "202616170003",
      displayName: "初めての英語シャドーイング",
      playCount: 0,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshold: 3,
      prevHiddenThreshold: 0,
      audioDir: "/User/take",
    },
    {
      id: "202616170004",
      displayName: "３分間パワー音読トレーニング",
      playCount: 0,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshold: 3,
      prevHiddenThreshold: 0,
      audioDir: "/User/take",
    },
  ];
};
