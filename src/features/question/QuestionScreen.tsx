import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Gauge, Play, RotateCcw, StickyNote } from "lucide-react";
import type { Item } from "../../types/Item";
import type { Question } from "../../types/Question";


interface QuestionScreenProps {
  item: Item
  questions: Question[]
  onExit: () => void
  onComplete: () => void
}

export const QuestionScreen = (props: QuestionScreenProps) => {
  const {item, questions, onExit, onComplete} = props;

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
            ALL IN ONE
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">
            今回:{" "}
            <strong id="q-progress-session" className="text-indigo-600">
              1 / 10
            </strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-medium text-slate-500">
            アイテム内No:{" "}
            <strong id="q-progress-total" className="text-slate-700">
              15
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
              Part1 整理して覚える最重要動詞23
            </span>
          </div>
          <div className="flex gap-4 text-xs text-slate-500 pt-1 border-t border-slate-50 mt-1">
              <strong id="q-meta-h2" className="font-normal text-slate-700">
                1 Break
              </strong>
              <strong id="q-meta-h3" className="font-normal text-slate-700">
              見出し3
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
              className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed tracking-wide"
            >
              He is easy to offend and impossible to please. He is rather difficult to get along with, to say the least.<br/>
A good boss is hard to come by.
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
                className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100"
              >
                あの人はすぐに気分を害するし、それに絶対満足してくれない。控えめな言い方をしても、かなり付き合いにくい人だよ。<br/>
いい上司に当たるのって難しいよね。
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
            <p>
              <span className="font-semibold text-slate-800">
                offend[эfe'nd]
              </span>
              : 気分を害する
            </p>
            <p>
              <span className="font-semibold text-slate-800">
                ～, to say the least (of it).
              </span>
              : 控えめに言っても～である
            </p>
            <p>
              <span className="font-semibold text-slate-800">
                come by ～
              </span>
              : ～を手に入れる[もつ、見つける]
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
                className="text-[11px] font-bold bg-transparent text-slate-600 focus:outline-none cursor-pointer"
              >
                <option value="0.8">0.8x</option>
                <option value="0.9">0.9x</option>
                <option value="1.0" selected>
                  1.0x
                </option>
                <option value="1.1">1.1x</option>
                <option value="1.2">1.2x</option>
                <option value="1.3">1.3x</option>
                <option value="1.4">1.4x</option>
                <option value="1.5">1.5x</option>
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