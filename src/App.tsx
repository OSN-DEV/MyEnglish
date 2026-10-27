import { useState } from "react";
import "./App.css";
import { QuestionScreen } from "./features/question/QuestionScreen";
import { TopScreen } from "./features/top/TopScreen";
import type { Item } from "./types/Item";
import type { Question } from "./types/Question";
import { getQuestions } from "./repositories/QuestionRepository";
function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<"top" | "question">("top");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [item, setItem] = useState<Item | null>(null);

  const handleStartClick = (item: Item, isResume: boolean) => {
    // 開始されるアイテムの詳細を取得する
    setQuestions(getQuestions());
    setCurrentScreen("question");
    setItem(item);
  };

  const handleEixt = () => {
    setCurrentScreen("top")
  }

  return (
    <div className="w-full h-screen bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">
      {currentScreen == "top" && <TopScreen onStartClick={handleStartClick} />}
      {currentScreen == "question" && (
        <QuestionScreen item={item!} questions={questions} onExit={handleEixt} onComplete={handleEixt}/>
      )}
    </div>
  );
}

export default App;
