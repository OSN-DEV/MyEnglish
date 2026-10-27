import { useState } from "react";
import "./App.css";
import { Question } from "./features/qeustion/Question";
import { Top } from "./features/top/Top";
import { ItemSetting } from "./types/ItemSetting";
import { QuestionData } from "./types/QuestonData";
import { getQuestions } from "./repository/QuestionRespository";
function App() {
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<"top" | "question">("top");
  const [questions, setQeustions] = useState<QuestionData[]>([]);
  const [item, setItem] = useState<ItemSetting | null>(null);

  const handleStarClick = (item: ItemSetting, isResume: boolean) => {
    // 開始されるアイテムの詳細を取得する
    setQeustions(getQuestions());
    setCurrentScreen("question");
    setItem(item);
  };

  return (
    <div className="w-full h-screen bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">
      {currentScreen == "top" && <Top onStartClick={handleStarClick} />}
      {currentScreen == "question" && (
        <Question itemSetting={item!} questions={questions} />
      )}
    </div>
  );
}

export default App;
