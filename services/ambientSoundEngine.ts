// Web Audio API procedural synthesis engine for Campfire & Rain ambient therapy
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  
  // Gains
  private masterGain: GainNode | null = null;
  private fireGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private nightGain: GainNode | null = null;

  // Nodes & intervals
  private fireCrackleInterval: number | null = null;
  private fireNoiseSource: AudioBufferSourceNode | null = null;
  private rainNoiseSource: AudioBufferSourceNode | null = null;
  private nightNoiseSource: AudioBufferSourceNode | null = null;

  // Volumes (0 to 1)
  private fireVol: number = 0.7;
  private rainVol: number = 0.7;
  private nightVol: number = 0.3;
  private masterVol: number = 0.8;

  // Timer
  private timerTimeout: number | null = null;
  private timerEndsAt: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create Pink Noise Buffer (Softer and more natural than white noise)
  private createPinkNoiseBuffer(durationSeconds: number = 5): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not ready");
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Fire crackle burst generator
  private triggerFireCrackle() {
    if (!this.ctx || !this.isPlaying || !this.fireGain) return;
    try {
      const now = this.ctx.currentTime;
      // High frequency click / pop
      const bufferSize = this.ctx.sampleRate * 0.04; // 40ms burst
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const burst = this.ctx.createBufferSource();
      burst.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800 + Math.random() * 2000, now);

      const burstGain = this.ctx.createGain();
      const intensity = (0.2 + Math.random() * 0.8) * this.fireVol;
      burstGain.gain.setValueAtTime(intensity, now);
      burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      burst.connect(filter);
      filter.connect(burstGain);
      burstGain.connect(this.fireGain);

      burst.start(now);
    } catch (e) {
      // ignore
    }
  }

  public start() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isPlaying) return;

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(this.masterVol, now + 1.2);
    this.masterGain.connect(this.ctx.destination);

    // ============= 1. FIRE SYNTHESIS =============
    this.fireGain = this.ctx.createGain();
    this.fireGain.gain.setValueAtTime(this.fireVol, now);
    this.fireGain.connect(this.masterGain);

    // Continuous fire low rumble (burning wood glow)
    const fireBuffer = this.createPinkNoiseBuffer(6);
    this.fireNoiseSource = this.ctx.createBufferSource();
    this.fireNoiseSource.buffer = fireBuffer;
    this.fireNoiseSource.loop = true;

    const fireLowpass = this.ctx.createBiquadFilter();
    fireLowpass.type = 'lowpass';
    fireLowpass.frequency.setValueAtTime(320, now); // Warm low frequency roar
    fireLowpass.Q.setValueAtTime(2.0, now);

    this.fireNoiseSource.connect(fireLowpass);
    fireLowpass.connect(this.fireGain);
    this.fireNoiseSource.start(now);

    // Random crackle pulses loop
    const scheduleNextCrackle = () => {
      if (!this.isPlaying) return;
      this.triggerFireCrackle();
      if (Math.random() > 0.6) {
        // Double pop
        setTimeout(() => this.triggerFireCrackle(), 40 + Math.random() * 60);
      }
      const nextDelay = 80 + Math.random() * 260; // frequent crackles
      this.fireCrackleInterval = window.setTimeout(scheduleNextCrackle, nextDelay);
    };
    scheduleNextCrackle();

    // ============= 2. RAIN SYNTHESIS =============
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.rainVol, now);
    this.rainGain.connect(this.masterGain);

    const rainBuffer = this.createPinkNoiseBuffer(8);
    this.rainNoiseSource = this.ctx.createBufferSource();
    this.rainNoiseSource.buffer = rainBuffer;
    this.rainNoiseSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1100, now);
    rainFilter.Q.setValueAtTime(0.8, now);

    this.rainNoiseSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainNoiseSource.start(now);

    // ============= 3. NIGHT BREEZE LAYER =============
    this.nightGain = this.ctx.createGain();
    this.nightGain.gain.setValueAtTime(this.nightVol * 0.4, now);
    this.nightGain.connect(this.masterGain);

    const nightBuffer = this.createPinkNoiseBuffer(10);
    this.nightNoiseSource = this.ctx.createBufferSource();
    this.nightNoiseSource.buffer = nightBuffer;
    this.nightNoiseSource.loop = true;

    const nightLowpass = this.ctx.createBiquadFilter();
    nightLowpass.type = 'lowpass';
    nightLowpass.frequency.setValueAtTime(200, now);

    this.nightNoiseSource.connect(nightLowpass);
    nightLowpass.connect(this.nightGain);
    this.nightNoiseSource.start(now);
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      this.isPlaying = false;
      return;
    }

    if (this.fireCrackleInterval) {
      clearTimeout(this.fireCrackleInterval);
      this.fireCrackleInterval = null;
    }

    if (this.timerTimeout) {
      clearTimeout(this.timerTimeout);
      this.timerTimeout = null;
      this.timerEndsAt = null;
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.8);

    setTimeout(() => {
      try {
        this.fireNoiseSource?.stop();
        this.rainNoiseSource?.stop();
        this.nightNoiseSource?.stop();
        this.fireNoiseSource?.disconnect();
        this.rainNoiseSource?.disconnect();
        this.nightNoiseSource?.disconnect();
      } catch (e) {
        // ignore
      }
      this.isPlaying = false;
    }, 850);
  }

  public setFireVolume(val: number) {
    this.fireVol = Math.max(0, Math.min(1, val));
    if (this.fireGain && this.ctx) {
      this.fireGain.gain.setValueAtTime(this.fireVol, this.ctx.currentTime);
    }
  }

  public setRainVolume(val: number) {
    this.rainVol = Math.max(0, Math.min(1, val));
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setValueAtTime(this.rainVol, this.ctx.currentTime);
    }
  }

  public setMasterVolume(val: number) {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }
  }

  public setTimer(minutes: number | null) {
    if (this.timerTimeout) {
      clearTimeout(this.timerTimeout);
      this.timerTimeout = null;
      this.timerEndsAt = null;
    }

    if (minutes && minutes > 0) {
      this.timerEndsAt = Date.now() + minutes * 60 * 1000;
      this.timerTimeout = window.setTimeout(() => {
        this.stop();
      }, minutes * 60 * 1000);
    }
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      fireVol: this.fireVol,
      rainVol: this.rainVol,
      masterVol: this.masterVol,
      timerEndsAt: this.timerEndsAt
    };
  }
}

export const ambientSound = new AmbientSoundEngine();
