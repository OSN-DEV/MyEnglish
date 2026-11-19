import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Gauge, Pause, Play, RotateCcw, StickyNote } from "lucide-react";
import type { Item } from "../../types/Item";
import { useEffect, useRef, useState } from "react";
import { SPEED_OPTIONS } from "../../constants";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { resolveAudioPathCandidates } from "./logic/audioPath";
import { findAudioFile } from "../../repositories/AudioRepository";
import { decideAfterEnded } from "./logic/playback";
import {
  currentQuestion,
  goNext,
  goPrev,
  interruptSession,
  isHiddenInSession,
  setHidden,
  type SessionState,
} from "./logic/session";

/** 自動再生の繰り返し終了から次の問題へ移動するまでの待ち時間 (ミリ秒) */
const AUTO_MOVE_DELAY_MS = 300;

/** 秒数を「分:秒」(例 0:03) にする */
const formatTime = (sec: number): string => {
  const safe = Number.isFinite(sec) ? Math.max(0, sec) : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};


interface QuestionScreenProps {
  /** 開始時の設定 */
  item: Item
  /** 開始時のセッション (startSession の戻り値) */
  initialSession: SessionState
  /** セッション終了 (最後の問題で「次へ」・終了ボタン) を親へ通知する. 親がエクセルへ書き戻す */
  onFinish: (session: SessionState) => void
}

/**
 * 問題画面.
 * 問題を 1 問ずつ表示し、音声の再生と問題の移動を行う.
 */
export const QuestionScreen = (props: QuestionScreenProps) => {
  const {item, initialSession, onFinish} = props;

  // 出題の進行状態. 操作ごとに logic/session.ts の純粋関数で新しい状態に置き換える
  const [session, setSession] = useState<SessionState>(initialSession);
  const question = currentQuestion(session);
  const { index, questions } = session;

  // 問題の音声の URL (asset://)。探している間・見つからない間は null
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  // 音声ファイルが無い・読めない問題では false にして再生系ボタンを無効化する (spec 3.3)
  const [isAudioAvailable, setIsAudioAvailable] = useState(false);
  // この問題で自動再生を再生し終えた回数
  const playedCountRef = useRef(0);
  // 自動移動 (再生後に次の問題へ) の待ちタイマー
  const autoMoveTimerRef = useRef<number | null>(null);

  const clearAutoMoveTimer = () => {
    if (autoMoveTimerRef.current !== null) {
      window.clearTimeout(autoMoveTimerRef.current);
      autoMoveTimerRef.current = null;
    }
  };

  // 問題が変わったら音声ファイルを探す (4 桁ゼロ埋め → 3 桁ゼロ埋めの順。spec 3.3)
  useEffect(() => {
    // 探している間に別の問題へ移った場合、古い結果を捨てるためのフラグ
    let isCancelled = false;
    setAudioSrc(null);
    setIsAudioAvailable(false);
    const candidates = resolveAudioPathCandidates(item.filePath, item.audioDir, question.no);
    findAudioFile(candidates)
      .then((path) => {
        if (isCancelled || path === null) return;
        // asset:// の URL に変換して <audio> で読めるようにする
        setAudioSrc(convertFileSrc(path));
        setIsAudioAvailable(true);
      })
      .catch((error) => console.error("音声ファイルの確認に失敗しました:", error));
    return () => {
      isCancelled = true;
    };
  }, [item.filePath, item.audioDir, question.no]);

  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    play,
    pause,
    seek,
    seekToStart,
    setPlaybackRate,
  } = useAudioPlayer({
    src: audioSrc,
    onEnded: () => handleAudioEnded(),
    onError: () => setIsAudioAvailable(false),
  });

  // 再生速度は前回値 (トップ画面の設定) から始める
  useEffect(() => {
    setPlaybackRate(item.playbackSpeed ?? 1.0);
  }, [item.playbackSpeed, setPlaybackRate]);

  // 問題の音声が見つかったら、自動再生 ON なら再生する (spec 5.6)
  useEffect(() => {
    playedCountRef.current = 0;
    clearAutoMoveTimer();
    if (audioSrc !== null && item.autoPlay) {
      play();
    }
    return clearAutoMoveTimer;
  }, [audioSrc, item.autoPlay, play]);

  /**
   * 音声の再生が終わったときの処理.
   * 自動再生なら再生回数まで繰り返し、終わったら (autoMove ON なら) AUTO_MOVE_DELAY_MS 後に次の問題へ.
   */
  const handleAudioEnded = () => {
    if (!item.autoPlay) return;
    playedCountRef.current += 1;
    const action = decideAfterEnded(playedCountRef.current, item.repeatCount, item.autoMove);
    if (action === "replay") {
      seekToStart();
      play();
    } else if (action === "moveNext") {
      clearAutoMoveTimer();
      // 待っている間に非表示などを操作しても最新の状態で進むよう、ref 経由で呼ぶ
      autoMoveTimerRef.current = window.setTimeout(
        () => handleNextRef.current(),
        AUTO_MOVE_DELAY_MS,
      );
    }
  };

  /** 再生・一時停止ボタン */
  const handlePlayPauseClick = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  /** 先頭から再生ボタン */
  const handleRestartClick = () => {
    seekToStart();
    play();
  };

  /** セッションを終えて親へ通知する (音声は止める) */
  const finish = (finalSession: SessionState) => {
    clearAutoMoveTimer();
    pause();
    onFinish(finalSession);
  };

  /**
   * 次へボタンを押したときの処理 (自動移動も同じ).
   * 表示中の問題の出題回数を +1 し、最後の問題ならセッション終了、それ以外は次の問題へ進む.
   */
  const handleNextClick = () => {
    const result = goNext(session);
    if (result.isFinished) {
      finish(result.state);
    } else {
      setSession(result.state);
    }
  };
  // タイマーから呼ぶ用. 毎回のレンダリングで最新の handleNextClick に差し替える
  const handleNextRef = useRef(handleNextClick);
  handleNextRef.current = handleNextClick;

  /** 前へボタン (出題回数は加算しない) */
  const handlePrevClick = () => {
    setSession(goPrev(session));
  };

  /** 終了ボタン (中断。出題回数は加算しない) */
  const handleExitClick = () => {
    finish(interruptSession(session));
  };

  /** 「問題を非表示」チェック (次回以降の出題対象から外す) */
  const handleHiddenChange = (isHidden: boolean) => {
    setSession(setHidden(session, question.no, isHidden));
  };

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
            onClick={handleExitClick}
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
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              id="player-seekbar"
              value={currentTime}
              min={0}
              max={duration || 0}
              step={0.1}
              disabled={!isAudioAvailable}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span
              id="player-time-total"
              className="text-[10px] font-mono font-medium text-slate-400 w-8"
            >
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Hide Question Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="btn-hide-question"
                checked={isHiddenInSession(session, question.no)}
                onChange={(e) => handleHiddenChange(e.target.checked)}
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
                onClick={handleRestartClick}
                disabled={!isAudioAvailable}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-40 disabled:pointer-events-none"
              >
                <RotateCcw  className="w-4 h-4" />
              </button>

              <button
                id="btn-play"
                title={isPlaying ? "一時停止" : "再生"}
                onClick={handlePlayPauseClick}
                disabled={!isAudioAvailable}
                className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md shadow-indigo-200 transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {isPlaying ? (
                  <Pause id="icon-play" className="w-4 h-4 fill-white" />
                ) : (
                  <Play id="icon-play" className="w-4 h-4 fill-white translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-1">
              <Gauge  className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="player-speed"
                value={playbackRate.toFixed(1)}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
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
            onClick={handlePrevClick}
            disabled={index === 0}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
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