export interface AudioPlayerOptions {
  src: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;           // ← ここで再生完了を検知・通知
  onError?: (error: any) => void;
}

export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private options: AudioPlayerOptions;

  constructor(options: AudioPlayerOptions) {
    this.options = options;
    this.init();
  }

  public init(): void {
    if (this.audio) {
      this.destroy();
    }

    this.audio = new Audio(this.options.src);

    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('ended', this.handleEnded);
    this.audio.addEventListener('error', this.handleError);
  }

  public destroy(): void {
    if (!this.audio) return;

    this.audio.pause();
    this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.removeEventListener('ended', this.handleEnded);
    this.audio.removeEventListener('error', this.handleError);
    this.audio = null;
  }

  private handleTimeUpdate = () => {
    if (!this.audio) return;
    this.options.onTimeUpdate?.(this.audio.currentTime, this.audio.duration || 0);
  };

  private handleEnded = () => {
    // 再生完了時に通知コールバックを実行
    this.options.onEnded?.();
  };

  private handleError = (e: Event) => {
    this.options.onError?.(e);
  };

  // --- 再生制御メソッド ---
  public play(): Promise<void> | undefined {
    return this.audio?.play();
  }

  public pause(): void {
    this.audio?.pause();
  }

  public seekToStart(): void {
    if (!this.audio) return;
    this.audio.currentTime = 0;
  }

  public seek(seconds: number): void {
    if (!this.audio) return;
    this.audio.currentTime = seconds;
  }

  public setLoop(isLoop: boolean): void {
    if (!this.audio) return;
    this.audio.loop = isLoop;
  }

  public setPlaybackRate(rate: number): void {
    if (!this.audio) return;
    this.audio.playbackRate = rate;
  }

  public setVolume(volume: number): void {
    if (!this.audio) return;
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  public getDuration(): number {
    return this.audio?.duration || 0;
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }
}
