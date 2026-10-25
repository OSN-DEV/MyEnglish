import "./App.css";
import { Question } from "./features/qeustion/Question";
import { Top } from "./features/top/Top";
function App() {
  return (
    <div className="w-full h-screen bg-white md:rounded-2xl shadow-xl flex flex-col overflow-hidden relative border border-slate-200/80">
      {/* <Top /> */}
      <Question />
    </div>
  );
}

export default App;
