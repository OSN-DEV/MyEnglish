import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioPlayer } from '../logic/AudioPlayer';

interface UseAudioPlayerOptions {
  /** 音声の URL. null の間はプレーヤーを作らない (play などは何もしない) */
  src: string | null;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

export function useAudioPlayer({ src, onEnded, onError }: UseAudioPlayerOptions) {
  const playerRef = useRef<AudioPlayer | null>(null);

  // 画面に連動させたいUI用の状態
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isLoop, setIsLoopState] = useState(false);

  // コールバックは ref に入れて常に最新を呼ぶ.
  // (下の effect は src が変わったときだけ動くので、直接使うと古いクロージャのままになる)
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);
  onEndedRef.current = onEnded;
  onErrorRef.current = onError;
  // 新しい AudioPlayer にも引き継ぐため、設定値は ref でも持つ
  const settingsRef = useRef({ volume: 1, playbackRate: 1, isLoop: false });

  // 初期化とクリーンアップ
  useEffect(() => {
    // src が変わったら表示用の状態をリセットする
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (src === null) return;

    const player = new AudioPlayer({
      src,
      onTimeUpdate: (current, dur) => {
        setCurrentTime(current);
        setDuration(dur);
      },
      onEnded: () => {
        setIsPlaying(false);
        onEndedRef.current?.();
      },
      onError: (err) => {
        setIsPlaying(false);
        onErrorRef.current?.(err);
      }
    });
    player.setVolume(settingsRef.current.volume);
    player.setPlaybackRate(settingsRef.current.playbackRate);
    player.setLoop(settingsRef.current.isLoop);
    playerRef.current = player;

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [src]);

  // 各種操作用メソッド（再レンダリング最適化のため useCallback を使用）
  const play = useCallback(async () => {
    try {
      await playerRef.current?.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("再生に失敗しました:", err);
    }
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seek(seconds);
    setCurrentTime(seconds);
  }, []);

  const seekToStart = useCallback(() => {
    playerRef.current?.seekToStart();
    setCurrentTime(0);
  }, []);

  const setVolume = useCallback((vol: number) => {
    playerRef.current?.setVolume(vol);
    settingsRef.current.volume = vol;
    setVolumeState(vol);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
    settingsRef.current.playbackRate = rate;
    setPlaybackRateState(rate);
  }, []);

  const setLoop = useCallback((loop: boolean) => {
    playerRef.current?.setLoop(loop);
    settingsRef.current.isLoop = loop;
    setIsLoopState(loop);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isLoop,
    play,
    pause,
    seek,
    seekToStart,
    setVolume,
    setPlaybackRate,
    setLoop,
  };
}






/*



import { useAudioPlayer } from './useAudioPlayer';
import { convertFileSrc } from '@tauri-apps/api/core'; // Tauriでローカルファイルを扱う場合

function MediaPlayer() {
  // Tauriのローカルファイルパスを扱う場合の例（通常パスなら直接文字列でもOK）
  const audioSrc = convertFileSrc('/Users/username/Music/sample.mp3');

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isLoop,
    play,
    pause,
    seek,
    seekToStart,
    setVolume,
    setPlaybackRate,
    setLoop,
  } = useAudioPlayer({
    src: audioSrc,
    onEnded: () => {
      console.log('音声の再生が完了しました！');
    },
    onError: (err) => {
      alert('再生エラーが発生しました');
    }
  });

  // 秒数を「分:秒」形式に変換するヘルパー
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Tauri MP3 Player</h3>

      タイムディスプレイ
      <div>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      シークバー
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        step={0.1}
        onChange={(e) => seek(parseFloat(e.target.value))}
        style={{ width: '100%', margin: '10px 0' }}
      />

      コントロールボタン
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {isPlaying ? (
          <button onClick={pause}>一時停止</button>
        ) : (
          <button onClick={play}>再生</button>
        )}
        <button onClick={seekToStart}>先頭へ移動</button>
        <button onClick={() => setLoop(!isLoop)}>
          ループ: {isLoop ? 'ON' : 'OFF'}
        </button>
      </div>

       再生速度・ボリューム調整 
      <div style={{ marginTop: '15px' }}>
        <label>再生速度: {playbackRate}x</label>
        <div>
          {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button 
              key={rate} 
              onClick={() => setPlaybackRate(rate)}
              style={{ fontWeight: playbackRate === rate ? 'bold' : 'normal' }}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <label>音量: {Math.round(volume * 100)}%</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

export default MediaPlayer;

*/