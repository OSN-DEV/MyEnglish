import { useState } from "react";
import "./App.css";
import { QuestionScreen } from "./features/question/QuestionScreen";
import { TopScreen } from "./features/top/TopScreen";
import type { Item } from "./types/Item";
import type { Question } from "./types/Question";
import { getQuestions } from "./repositories/QuestionRepository";

/**
 * アプリのルート.
 * トップ画面と問題画面を切り替える.
 */
function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<"top" | "question">("top");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [item, setItem] = useState<Item | null>(null);

  /**
   * 開始・再開ボタン押下時の処理.
   * 選択されたアイテムの問題を取得し、問題画面へ切り替える.
   * @param item 開始するアイテム
   * @param isResume true: 前回の続きから再開、false: 先頭から開始
   */
  const handleStartClick = (item: Item, isResume: boolean) => {
    // 開始されるアイテムの詳細を取得する
    setQuestions(getQuestions());
    setCurrentScreen("question");
    setItem(item);
  };

  /**
   * 問題画面の終了・完了時の処理.
   * トップ画面へ戻る.
   */
  const handleExit = () => {
    setCurrentScreen("top")
  }

  return (
    <div className="w-full h-screen bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">
      {currentScreen == "top" && <TopScreen onStartClick={handleStartClick} />}
      {currentScreen == "question" && (
        <QuestionScreen item={item!} questions={questions} onExit={handleExit} onComplete={handleExit}/>
      )}
    </div>
  );
}

export default App;
