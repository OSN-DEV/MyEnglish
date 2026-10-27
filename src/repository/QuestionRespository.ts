import { QuestionData } from "../types/QuestonData";

export const getQuestions = (): QuestionData[] => {
  return getQuestionsDummyProc();
};

const getQuestionsDummyProc = (): QuestionData[] => {
  return [
    {
      no: 1,
      title1: "Chapter1",
      title2: "AAA",
      title3: "BBB",
      playCount: 3,
      english: `He grinned and said, "I make lots of money. On weekdays I receive an average of 50 orders a day from all over the globe via the Internet."`,
      japanese: `彼はにっこり笑って「とても儲かっていますよ。平日はインターネット経由で世界中から１日平均50件の注文があるんです」と言った。`,
      memo: `grin[gri'n]：歯を見せてにっこり[ニコッ・ニッ・ニヤッ]と笑う`,
      isHidden: false
    },
    {
      no: 2,
      title1: "Chapter1",
      title2: "AAA",
      title3: "",
      playCount: 3,
      english: `What does your son do?\nWell, he used to work for a multinational corporation, but unfortunately he is unemployed at the moment.`,
      japanese: `息子さんのご職業はなんですか？\nええそれがですね、以前は多国籍企業に勤めていたのですが、残念ながら今は失業中なんです。`,
      memo: ``,
      isHidden: true
    },
    {
      no: 3,
      title1: "Chapter1",
      title2: "AAA",
      title3: "",
      playCount: 3,
      english: `Guess what! I quit my full-time job last autumn and at present I'm traveling around the countryside.\nYou never cease to astonish me!`,
      japanese: `実はね、僕この秋に常勤の仕事を辞めてね。今は地方をあちこち旅しているところなんだ。\nあなたにはいつもびっくりさせられるわ。`,
      memo: `Guess what!：あのねえ、じつはね\ncease[si':s]：～をやめる、停止する`,
      isHidden: false
    },
  ];
};
