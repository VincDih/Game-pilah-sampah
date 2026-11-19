class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    startTimeOffset = 0,
    volume = 0.16,
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + startTimeOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playTap() {
    this.playTone(480, 0.07, 'sine', 0, 0.1);
  }

  public playCorrect(streak: number) {
    // Pitch gently scales upward with streak for excitement
    const semitoneBoost = Math.min(streak - 1, 6);
    const multiplier = Math.pow(2, semitoneBoost / 12);
    this.playTone(523.25 * multiplier, 0.14, 'triangle', 0, 0.16);
    this.playTone(659.25 * multiplier, 0.16, 'triangle', 0.08, 0.16);
    this.playTone(783.99 * multiplier, 0.24, 'triangle', 0.16, 0.18);
  }

  public playComboMilestone() {
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.2, 'sine', idx * 0.065, 0.14);
    });
  }

  public playWrong() {
    this.playTone(280, 0.16, 'sine', 0, 0.14);
    this.playTone(220, 0.24, 'sine', 0.12, 0.14);
  }

  public playTick() {
    this.playTone(880, 0.05, 'sine', 0, 0.07);
  }

  public playVictory() {
    const fanfare = [
      { f: 523.25, t: 0, d: 0.14 },
      { f: 659.25, t: 0.11, d: 0.14 },
      { f: 783.99, t: 0.22, d: 0.14 },
      { f: 1046.5, t: 0.34, d: 0.42 },
    ];
    fanfare.forEach((n) => {
      this.playTone(n.f, n.d, 'triangle', n.t, 0.17);
    });
  }
}

export const soundManager = new SoundManager();
