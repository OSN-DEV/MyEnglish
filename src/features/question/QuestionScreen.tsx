import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Gauge, Play, RotateCcw, StickyNote } from "lucide-react";
import type { Item } from "../../types/Item";
import type { Question } from "../../types/Question";
import { useState } from "react";
import { SPEED_OPTIONS } from "../../constants";


interface QuestionScreenProps {
  item: Item
  questions: Question[]
  onExit: () => void
  onComplete: () => void
}

/**
 * 問題画面.
 * 問題を 1 問ずつ表示し、音声の再生と問題の移動を行う.
 */
export const QuestionScreen = (props: QuestionScreenProps) => {
  const {item, questions, onExit, onComplete} = props;
  
  // TODO:このあたりはリストの作り方を考えてから、改めて実装する
  const no = item.resumeNo ??   questions[0].no;
  // resumeNo の問題が今回の問題に無い場合は先頭から表示する
  const [index, setIndex] = useState<number>(
    Math.max(0, questions.findIndex((q) => q.no === no))
  )
  const question = questions[index];

  /**
   * 次へボタンを押したときの処理.
   * 最後の問題なら完了を親へ通知し、それ以外は次の問題へ進む.
   */
  const handleNextClick = () => {
    if (questions.length <= index + 1) {
      onComplete();
    } else {
      setIndex((prev) => prev + 1);
    }
  }

  return (
    <div
      id="question-screen"
      className="w-full h-full flex flex-col overflow-hidden bg-slate-50"
    >
      {/* HEADER AREA (Fixed Height) */}
      <header className="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            id="btn-exit"
            onClick={onExit}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft  className="w-4 h-4" />
            終了
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <span
            id="q-item-name"
            className="text-xs font-bold text-slate-700 truncate max-w-[200px]"
          >
            {item.displayName}
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">
            今回:{" "}
            <strong id="q-progress-session" className="text-indigo-600">
              {index + 1} / {questions.length}
            </strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-medium text-slate-500">
            アイテム内No:{" "}
            <strong id="q-progress-total" className="text-slate-700">
              {question.no}
            </strong>
          </span>
        </div>
      </header>

      {/* MAIN LEARNING AREA (Scrollable) */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Meta Info Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span
              id="q-meta-title"
              className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded"
            >
              {question.title1}
            </span>
          </div>
          <div className="flex gap-4 text-xs text-slate-500 pt-1 border-t border-slate-50 mt-1">
              <strong id="q-meta-h2" className="font-normal text-slate-700">
                {question.title2}
              </strong>
              <strong id="q-meta-h3" className="font-normal text-slate-700">
              {question.title3}
              </strong>
          </div>
        </div>

        {/* Main Sentence Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 relative">
          {/* English Sentence */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              English
            </span>
            <p
              id="q-text-en"
              className="whitespace-pre-line text-lg md:text-xl font-bold text-slate-800 leading-relaxed tracking-wide"
            >
              {question.english}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Japanese Translation (Toggleable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Japanese
              </span>
              <button
                id="btn-toggle-jp"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 focus:outline-none"
              >
                <Eye id="icon-jp-eye"
                  className="w-3.5 h-3.5" />
                <span id="text-toggle-jp">日本語訳を隠す</span>
              </button>
            </div>
            <div id="wrapper-jp" className="transition-all duration-200">
              <p
                id="q-text-jp"
                className="whitespace-pre-line text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100"
              >
                {question.japanese}
              </p>
            </div>
          </div>
        </div>

        {/* Note Area (Words / Explanations) */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
            <StickyNote  className="w-4 h-4 text-amber-500"/>
            学習メモ・解説
          </div>
          <div
            id="q-notes"
            className="text-xs text-slate-600 leading-normal space-y-1"
          >
            <p className="whitespace-pre-line">
              {question.memo}
            </p>
          </div>
        </div>
      </main>

      {/* CONTROL AREA (Fixed Bottom) */}
      <footer className="bg-white border-t border-slate-200/80 p-3 space-y-3 shrink-0 shadow-lg z-10">
        {/* Player Controls & Seekbar */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-2">
          {/* Seekbar & Time */}
          <div className="flex items-center gap-3 px-1">
            <span
              id="player-time-current"
              className="text-[10px] font-mono font-medium text-slate-400 w-8 text-right"
            >
              0:00
            </span>
            <input
              type="range"
              id="player-seekbar"
              defaultValue="0"
              min="0"
              max="100"
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span
              id="player-time-total"
              className="text-[10px] font-mono font-medium text-slate-400 w-8"
            >
              0:03
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Hide Question Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="btn-hide-question"
                className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span className="text-xs font-semibold text-slate-600">
                問題を非表示
              </span>
            </label>

            {/* Play Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-restart"
                title="先頭から再生"
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                <RotateCcw  className="w-4 h-4" />
              </button>

              <button
                id="btn-play"
                className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md shadow-indigo-200 transition active:scale-95"
              >
                <Play id="icon-play"
                  className="w-4 h-4 fill-white translate-x-0.5" />
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-1">
              <Gauge  className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="player-speed"
                defaultValue={(item.playbackSpeed ?? 1.0).toFixed(1)}
                className="text-[11px] font-bold bg-transparent text-slate-600 focus:outline-none cursor-pointer"
              >
                {SPEED_OPTIONS.map((speed) => (
                  <option key={speed} value={speed.toFixed(1)}>
                    {speed.toFixed(1)}x
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pagination Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-prev"
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 active:scale-[0.98]"
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </button>
          <button
            id="btn-next"
            onClick={handleNextClick}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
          >
            次へ
            <ChevronRight  className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};