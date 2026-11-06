import { useState } from "react";
import "./App.css";
import { QuestionScreen } from "./features/question/QuestionScreen";
import { TopScreen } from "./features/top/TopScreen";
import type { Item } from "./types/Item";
import type { Question } from "./types/Question";
import { getQuestions } from "./repositories/QuestionRepository";

/** 表示中の画面. 問題画面のときだけ出題中のアイテムと問題を持つ */
type Screen =
  | { name: "top" }
  | { name: "question"; item: Item; questions: Question[] };

/**
 * アプリのルート.
 * トップ画面と問題画面を切り替える.
 */
function App() {
  const [screen, setScreen] = useState<Screen>({ name: "top" });

  /**
   * 開始・再開ボタン押下時の処理.
   * 選択されたアイテムの問題を取得し、問題画面へ切り替える.
   * @param item 開始するアイテム
   * @param isResume true: 前回の続きから再開、false: 先頭から開始
   */
  // TODO: 出題ロジック (quiz-logic) の実装時に isResume を使う
  const handleStartClick = (item: Item, _isResume: boolean) => {
    setScreen({ name: "question", item, questions: getQuestions() });
  };

  /**
   * 問題画面の終了・完了時の処理.
   * トップ画面へ戻る.
   */
  const handleExit = () => {
    setScreen({ name: "top" });
  };

  return (
    <div className="w-full h-screen bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">
      {screen.name === "top" && <TopScreen onStartClick={handleStartClick} />}
      {screen.name === "question" && (
        <QuestionScreen item={screen.item} questions={screen.questions} onExit={handleExit} onComplete={handleExit} />
      )}
    </div>
  );
}

export default App;
