/**
 * Real Web Audio API synthesizer for KDE Connect effects
 * Does not rely on external MP3 assets, guaranteeing offline/in-iframe reliability.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private ringOscillator: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private isRinging: boolean = false;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isRinging) {
      this.stopRing();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Pleasant notification chime (two-tone bell)
   */
  public playNotification() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);

      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch {
      // Audio context might be restricted
    }
  }

  /**
   * Device pairing success chime (ascending arpeggio)
   */
  public playPairSuccess() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.07);

        gain.gain.setValueAtTime(0.01, now + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.07);
        osc.stop(now + index * 0.07 + 0.25);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Soft trackpad click or key strike
   */
  public playClick(type: 'soft' | 'key' = 'soft') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type === 'key' ? 'square' : 'sine';
      osc.frequency.setValueAtTime(type === 'key' ? 440 : 800, now);
      osc.frequency.exponentialRampToValueAtTime(type === 'key' ? 120 : 200, now + 0.03);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignored
    }
  }

  /**
   * File transfer complete
   */
  public playFileSent() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignored
    }
  }

  /**
   * Find My Phone Siren / Alarm (pulsating siren until stopped)
   */
  public startRing() {
    if (this.isRinging) return;
    this.isRinging = true;

    if (this.isMuted) return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.ringOscillator = this.ctx.createOscillator();
      this.ringGain = this.ctx.createGain();

      this.ringOscillator.type = 'sawtooth';
      this.ringOscillator.frequency.setValueAtTime(850, now);

      // Create siren effect using LFO
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(4, now); // 4 cycles per sec
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(250, now);

      lfo.connect(lfoGain);
      lfoGain.connect(this.ringOscillator.frequency);
      lfo.start(now);

      this.ringGain.gain.setValueAtTime(0.2, now);

      this.ringOscillator.connect(this.ringGain);
      this.ringGain.connect(this.ctx.destination);

      this.ringOscillator.start(now);
    } catch {
      // Ignored
    }
  }

  public stopRing() {
    this.isRinging = false;
    try {
      if (this.ringOscillator) {
        this.ringOscillator.stop();
        this.ringOscillator.disconnect();
        this.ringOscillator = null;
      }
      if (this.ringGain) {
        this.ringGain.disconnect();
        this.ringGain = null;
      }
    } catch {
      // Ignored
    }
  }
}

export const soundEffects = new SoundManager();
