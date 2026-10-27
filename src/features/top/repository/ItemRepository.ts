export const getItemSettings = (): ItemSetting[] => {
  return getItemSettingsProcDummy();
};

/**
 * 空のアイテム設定情報を返却する
 */
export const getEmptyItemSetting = (): ItemSetting => {
  return {
      id: "",
      displayName: "",
      playCount: 0,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshhold: 0,
      prevHiddenThreshold: 0,
      audioDir: "",
  }
}


/**
 * アイテム設定情報一覧を返却する.
 */
const getItemSettingsProc = (): ItemSetting[] => {
    return [];
};

/**
 * ダミーのアイテム設定情報一覧を返却する.
 */
const getItemSettingsProcDummy = (): ItemSetting[] => {
 return [
    {
      id: "202616170000",
      displayName: "ALL IN ONE",
      playCount: 10,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshhold: 9,
      prevHiddenThreshold: 8,
      audioDir: "/User/take",
    },
    {
      id: "202616170001",
      displayName: "キクタン【Advanced】",
      playCount: 4,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshhold: 5,
      prevHiddenThreshold: 4,
      audioDir: "/User/take",
    },
    {
      id: "202616170002",
      displayName: "イラストでわかるネイティブ句動詞",
      playCount: 3,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshhold: 4,
      prevHiddenThreshold: 3,
      audioDir: "/User/take",
    },
    {
      id: "202616170003",
      displayName: "初めての英語シャドーイング",
      playCount: 0,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshhold: 3,
      prevHiddenThreshold: 0,
      audioDir: "/User/take",
    },
    {
      id: "202616170004",
      displayName: "３分間パワー音読トレーニング",
      playCount: 0,
      resumeNo: null,
      resumeOrder: null,
      hiddenThreshhold: 3,
      prevHiddenThreshold: 0,
      audioDir: "/User/take",
    },
  ];
};
