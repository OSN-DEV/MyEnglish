import { useState } from "react";
import "./App.css";
import { QuestionScreen } from "./features/question/QuestionScreen";
import { TopScreen } from "./features/top/TopScreen";
import type { Item } from "./types/Item";
import type { Question } from "./types/Question";
import { getQuestions } from "./repositories/QuestionRepository";
import { takeSessionQuestions } from "./features/question/logic/session";
import Loading from "./components/Loading";
import { X } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * 開始・再開ボタン押下時の処理.
   * 選択されたアイテムの問題を取得し、問題画面へ切り替える.
   * @param item 開始するアイテム
   * @param isResume true: 前回の続きから再開、false: 先頭から開始
   */
  // TODO: 出題ロジック (quiz-logic) の実装時に isResume を使う
  const handleStartClick = async (item: Item, _isResume: boolean) => {
    setIsLoading(true);
    try {
      const eligibleQuestions = await getQuestions(item);
      const questions = takeSessionQuestions(eligibleQuestions, item.questionCount);
      setScreen({ name: "question", item, questions });
    } catch (error) {
      setErrorMessage(`問題一覧の取得に失敗しました: ${error}`);
    } finally {
      setIsLoading(false);
    }
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
        <QuestionScreen
          item={screen.item}
          questions={screen.questions}
          onExit={handleExit}
          onComplete={handleExit}
        />
      )}
      {errorMessage && (
        <div className="mb-2 p-2 rounded-lg border border-rose-200 bg-rose-50 text-[11px] text-rose-700 flex items-start gap-2">
          <p className="flex-1 break-all">{errorMessage}</p>
          <button
            title="閉じる"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isLoading && <Loading />}
    </div>
  );
}

export default App;
