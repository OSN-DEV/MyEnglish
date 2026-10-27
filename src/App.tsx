import { useState } from "react";
import "./App.css";
import { Question } from "./features/qeustion/Question";
import { Top } from "./features/top/Top";
function App() {
  const [currentScreen, setCurrentScreen] = useState<"top"|"question">("top")
  return (
    <div className="w-full h-screen bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">
      {currentScreen == "top" && <Top />}
      {currentScreen == "question" && <Question />}
    </div>
  );
}

export default App;
