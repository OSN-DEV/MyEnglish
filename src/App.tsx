import { useState } from "react";
import "./App.css";
import { QuestionScreen } from "./features/question/QuestionScreen";
import { TopScreen } from "./features/top/TopScreen";
import type { Item } from "./types/Item";
import type { SessionResult } from "./types/Session";
import { getQuestions } from "./repositories/QuestionRepository";
import { saveSession } from "./repositories/SessionRepository";
import {
  startSession,
  toSessionResult,
  type SessionState,
} from "./features/question/logic/session";
import { SaveErrorDialog } from "./components/SaveErrorDialog";
import Loading from "./components/Loading";
import { X } from "lucide-react";

/** 表示中の画面. 問題画面のときだけ出題中のアイテムと開始時のセッションを持つ */
type Screen =
  | { name: "top" }
  | { name: "question"; item: Item; session: SessionState };

/**
 * アプリのルート.
 * トップ画面と問題画面を切り替える.
 */
function App() {
  const [screen, setScreen] = useState<Screen>({ name: "top" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 書き戻しに失敗したときの、再試行する内容とエラー. null ならダイアログを出さない
  const [saveError, setSaveError] = useState<{ result: SessionResult; message: string } | null>(
    null,
  );

  /**
   * 開始・再開ボタン押下時の処理.
   * 選択されたアイテムの問題を取得し、問題画面へ切り替える.
   * @param item 開始するアイテム
   * @param isResume true: 前回の続きから再開、false: 先頭から開始
   */
  const handleStartClick = async (item: Item, isResume: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // エクセルは開始のたびに読み直す (キャッシュしない)
      const orderedQuestions = await getQuestions(item);
      const session = startSession(orderedQuestions, item, isResume);
      if (session === null) {
        setErrorMessage(`出題可能な問題がありません。`);
        return;
      }

      console.log(`handleStartClick: ${session.questions.length}`)
      setScreen({ name: "question", item, session });
    } catch (error) {
      setErrorMessage(`問題一覧の取得に失敗しました: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 書き戻して、成功したらトップ画面へ戻る. 失敗したら再試行 / キャンセルのダイアログを出す.
   */
  const save = async (result: SessionResult) => {
    setIsLoading(true);
    setSaveError(null);
    try {
      await saveSession(result);
      setScreen({ name: "top" });
    } catch (error) {
      setSaveError({ result, message: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 問題画面の終了 (最後の問題で「次へ」・終了ボタン) 時の処理.
   * セッションの結果をエクセルへまとめて 1 回書き戻してから、トップ画面へ戻る (spec 6).
   */
  const handleFinish = (item: Item, session: SessionState) => {
    save(toSessionResult(session, item));
  };

  /** 書き戻し失敗ダイアログの「キャンセル」. 保存せずにトップ画面へ戻る */
  const handleSaveCancel = () => {
    setSaveError(null);
    setScreen({ name: "top" });
  };

  return (
    <div className="w-full h-screen bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">
      {screen.name === "top" && <TopScreen onStartClick={handleStartClick} />}
      {screen.name === "question" && (
        <QuestionScreen
          item={screen.item}
          initialSession={screen.session}
          onFinish={(session) => handleFinish(screen.item, session)}
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

      {saveError && (
        <SaveErrorDialog
          errorMessage={saveError.message}
          onRetry={() => save(saveError.result)}
          onCancel={handleSaveCancel}
        />
      )}

      {isLoading && <Loading />}
    </div>
  );
}

export default App;
