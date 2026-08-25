// Web Audio API procedural synthesis engine & offline Service Worker soundscape pre-caching

export interface SoundscapePreset {
  id: string;
  name: string;
  description: string;
  fire: number;
  rain: number;
  tibetan432: number;
  solfeggio528: number;
  thetaWaves: number;
  wind: number;
  icon: string;
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'campfire_rain',
    name: 'Убежище у Костра',
    description: 'Треск живого огня, уютный вечерний дождь и шелест сосен',
    fire: 85,
    rain: 65,
    tibetan432: 0,
    solfeggio528: 0,
    thetaWaves: 0,
    wind: 25,
    icon: 'flame'
  },
  {
    id: 'tibetan_432',
    name: 'Тибетские Чаши (432 Гц)',
    description: 'Сакральная частота гармонизации вселенной и очищения чакр',
    fire: 10,
    rain: 0,
    tibetan432: 90,
    solfeggio528: 0,
    thetaWaves: 30,
    wind: 35,
    icon: 'sparkles'
  },
  {
    id: 'solfeggio_528',
    name: 'Трансформация (528 Гц)',
    description: 'Частота чудес, восстановления биополя и раскрытия сердца',
    fire: 0,
    rain: 30,
    tibetan432: 0,
    solfeggio528: 90,
    thetaWaves: 25,
    wind: 20,
    icon: 'heart'
  },
  {
    id: 'deep_theta',
    name: 'Глубокая Тета-Медитация',
    description: '6 Гц ритмы для глубокого погружения, работы с подсознанием и сна',
    fire: 20,
    rain: 40,
    tibetan432: 50,
    solfeggio528: 0,
    thetaWaves: 85,
    wind: 15,
    icon: 'moon'
  },
  {
    id: 'forest_stream',
    name: 'Лесной Дождь и Ветер',
    description: 'Мягкий дождь по листве, горный ветер и свежесть природы',
    fire: 0,
    rain: 85,
    tibetan432: 20,
    solfeggio528: 0,
    thetaWaves: 0,
    wind: 70,
    icon: 'cloud-rain'
  }
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  
  // Gains
  private masterGain: GainNode | null = null;
  private fireGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private tibetanGain: GainNode | null = null;
  private solfeggioGain: GainNode | null = null;
  private thetaGain: GainNode | null = null;
  private windGain: GainNode | null = null;

  // Nodes & intervals
  private fireCrackleInterval: number | null = null;
  private fireNoiseSource: AudioBufferSourceNode | null = null;
  private rainNoiseSource: AudioBufferSourceNode | null = null;
  private windNoiseSource: AudioBufferSourceNode | null = null;
  
  // Oscillators for Tonal Layers
  private tibetanOsc1: OscillatorNode | null = null;
  private tibetanOsc2: OscillatorNode | null = null;
  private solfeggioOsc1: OscillatorNode | null = null;
  private solfeggioOsc2: OscillatorNode | null = null;
  private thetaOscLeft: OscillatorNode | null = null;
  private thetaOscRight: OscillatorNode | null = null;
  private thetaLfo: OscillatorNode | null = null;
  private thetaLfoGain: GainNode | null = null;

  // Volumes (0 to 1)
  private fireVol: number = 0.85;
  private rainVol: number = 0.65;
  private tibetanVol: number = 0.0;
  private solfeggioVol: number = 0.0;
  private thetaVol: number = 0.0;
  private windVol: number = 0.25;
  private masterVol: number = 0.8;

  // Timer
  private timerTimeout: number | null = null;
  private timerEndsAt: number | null = null;

  // Offline pre-caching status
  private isPrecached: boolean = false;
  private isPrecaching: boolean = false;
  private statusListeners: Array<(status: { isPrecached: boolean; count: number }) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initServiceWorkerListener();
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Pink noise generator for soothing natural textures
  private createPinkNoiseBuffer(durationSeconds: number = 6): AudioBuffer {
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
      filter.frequency.setValueAtTime(900 + Math.random() * 2200, now);

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
    this.masterGain.gain.linearRampToValueAtTime(this.masterVol, now + 1.0);
    this.masterGain.connect(this.ctx.destination);

    // ============= 1. FIRE SYNTHESIS =============
    this.fireGain = this.ctx.createGain();
    this.fireGain.gain.setValueAtTime(this.fireVol, now);
    this.fireGain.connect(this.masterGain);

    const fireBuffer = this.createPinkNoiseBuffer(6);
    this.fireNoiseSource = this.ctx.createBufferSource();
    this.fireNoiseSource.buffer = fireBuffer;
    this.fireNoiseSource.loop = true;

    const fireLowpass = this.ctx.createBiquadFilter();
    fireLowpass.type = 'lowpass';
    fireLowpass.frequency.setValueAtTime(320, now);
    fireLowpass.Q.setValueAtTime(2.0, now);

    this.fireNoiseSource.connect(fireLowpass);
    fireLowpass.connect(this.fireGain);
    this.fireNoiseSource.start(now);

    const scheduleNextCrackle = () => {
      if (!this.isPlaying) return;
      this.triggerFireCrackle();
      if (Math.random() > 0.6) {
        setTimeout(() => this.triggerFireCrackle(), 40 + Math.random() * 60);
      }
      const nextDelay = 80 + Math.random() * 260;
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
    rainFilter.frequency.setValueAtTime(1150, now);
    rainFilter.Q.setValueAtTime(0.8, now);

    this.rainNoiseSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainNoiseSource.start(now);

    // ============= 3. WIND & SACRED CHIMES SYNTHESIS =============
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(this.windVol * 0.5, now);
    this.windGain.connect(this.masterGain);

    const windBuffer = this.createPinkNoiseBuffer(10);
    this.windNoiseSource = this.ctx.createBufferSource();
    this.windNoiseSource.buffer = windBuffer;
    this.windNoiseSource.loop = true;

    const windLowpass = this.ctx.createBiquadFilter();
    windLowpass.type = 'lowpass';
    windLowpass.frequency.setValueAtTime(240, now);

    this.windNoiseSource.connect(windLowpass);
    windLowpass.connect(this.windGain);
    this.windNoiseSource.start(now);

    // ============= 4. TIBETAN BOWL 432 HZ SYNTHESIS =============
    this.tibetanGain = this.ctx.createGain();
    this.tibetanGain.gain.setValueAtTime(this.tibetanVol * 0.4, now);
    this.tibetanGain.connect(this.masterGain);

    // Fundamental 432 Hz
    this.tibetanOsc1 = this.ctx.createOscillator();
    this.tibetanOsc1.type = 'sine';
    this.tibetanOsc1.frequency.setValueAtTime(432, now);

    // Subtle 2nd harmonic 864 Hz with 1.5 Hz slow tremolo
    this.tibetanOsc2 = this.ctx.createOscillator();
    this.tibetanOsc2.type = 'sine';
    this.tibetanOsc2.frequency.setValueAtTime(432 * 2 + 1.2, now);

    const tibetanSubGain = this.ctx.createGain();
    tibetanSubGain.gain.setValueAtTime(0.35, now);

    this.tibetanOsc1.connect(this.tibetanGain);
    this.tibetanOsc2.connect(tibetanSubGain);
    tibetanSubGain.connect(this.tibetanGain);

    this.tibetanOsc1.start(now);
    this.tibetanOsc2.start(now);

    // ============= 5. SOLFEGGIO 528 HZ SYNTHESIS =============
    this.solfeggioGain = this.ctx.createGain();
    this.solfeggioGain.gain.setValueAtTime(this.solfeggioVol * 0.4, now);
    this.solfeggioGain.connect(this.masterGain);

    this.solfeggioOsc1 = this.ctx.createOscillator();
    this.solfeggioOsc1.type = 'sine';
    this.solfeggioOsc1.frequency.setValueAtTime(528, now);

    this.solfeggioOsc2 = this.ctx.createOscillator();
    this.solfeggioOsc2.type = 'triangle';
    this.solfeggioOsc2.frequency.setValueAtTime(528 * 0.5, now); // Warm octave below

    const solfeggioSubGain = this.ctx.createGain();
    solfeggioSubGain.gain.setValueAtTime(0.2, now);

    this.solfeggioOsc1.connect(this.solfeggioGain);
    this.solfeggioOsc2.connect(solfeggioSubGain);
    solfeggioSubGain.connect(this.solfeggioGain);

    this.solfeggioOsc1.start(now);
    this.solfeggioOsc2.start(now);

    // ============= 6. THETA MEDITATION WAVES (6 HZ BINAURAL) =============
    this.thetaGain = this.ctx.createGain();
    this.thetaGain.gain.setValueAtTime(this.thetaVol * 0.45, now);
    this.thetaGain.connect(this.masterGain);

    // Base carrier 108 Hz + 6 Hz Theta modulation
    this.thetaOscLeft = this.ctx.createOscillator();
    this.thetaOscLeft.type = 'sine';
    this.thetaOscLeft.frequency.setValueAtTime(108, now);

    this.thetaOscRight = this.ctx.createOscillator();
    this.thetaOscRight.type = 'sine';
    this.thetaOscRight.frequency.setValueAtTime(114, now); // 108 + 6 = 6 Hz theta beat

    // Isochronic LFO for pulsing trance sensation
    this.thetaLfo = this.ctx.createOscillator();
    this.thetaLfo.frequency.setValueAtTime(6.0, now);
    this.thetaLfoGain = this.ctx.createGain();
    this.thetaLfoGain.gain.setValueAtTime(0.25, now);

    this.thetaLfo.connect(this.thetaLfoGain.gain);
    this.thetaOscLeft.connect(this.thetaGain);
    this.thetaOscRight.connect(this.thetaGain);

    this.thetaOscLeft.start(now);
    this.thetaOscRight.start(now);
    this.thetaLfo.start(now);
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
    this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.6);

    setTimeout(() => {
      try {
        this.fireNoiseSource?.stop();
        this.rainNoiseSource?.stop();
        this.windNoiseSource?.stop();
        this.tibetanOsc1?.stop();
        this.tibetanOsc2?.stop();
        this.solfeggioOsc1?.stop();
        this.solfeggioOsc2?.stop();
        this.thetaOscLeft?.stop();
        this.thetaOscRight?.stop();
        this.thetaLfo?.stop();

        this.fireNoiseSource?.disconnect();
        this.rainNoiseSource?.disconnect();
        this.windNoiseSource?.disconnect();
        this.tibetanOsc1?.disconnect();
        this.tibetanOsc2?.disconnect();
        this.solfeggioOsc1?.disconnect();
        this.solfeggioOsc2?.disconnect();
        this.thetaOscLeft?.disconnect();
        this.thetaOscRight?.disconnect();
        this.thetaLfo?.disconnect();
      } catch (e) {
        // ignore
      }
      this.isPlaying = false;
    }, 650);
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

  public setTibetanVolume(val: number) {
    this.tibetanVol = Math.max(0, Math.min(1, val));
    if (this.tibetanGain && this.ctx) {
      this.tibetanGain.gain.setValueAtTime(this.tibetanVol * 0.4, this.ctx.currentTime);
    }
  }

  public setSolfeggioVolume(val: number) {
    this.solfeggioVol = Math.max(0, Math.min(1, val));
    if (this.solfeggioGain && this.ctx) {
      this.solfeggioGain.gain.setValueAtTime(this.solfeggioVol * 0.4, this.ctx.currentTime);
    }
  }

  public setThetaVolume(val: number) {
    this.thetaVol = Math.max(0, Math.min(1, val));
    if (this.thetaGain && this.ctx) {
      this.thetaGain.gain.setValueAtTime(this.thetaVol * 0.45, this.ctx.currentTime);
    }
  }

  public setWindVolume(val: number) {
    this.windVol = Math.max(0, Math.min(1, val));
    if (this.windGain && this.ctx) {
      this.windGain.gain.setValueAtTime(this.windVol * 0.5, this.ctx.currentTime);
    }
  }

  public setMasterVolume(val: number) {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }
  }

  public applyPreset(preset: SoundscapePreset) {
    this.setFireVolume(preset.fire / 100);
    this.setRainVolume(preset.rain / 100);
    this.setTibetanVolume(preset.tibetan432 / 100);
    this.setSolfeggioVolume(preset.solfeggio528 / 100);
    this.setThetaVolume(preset.thetaWaves / 100);
    this.setWindVolume(preset.wind / 100);
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

  // ================= OFFLINE SERVICE WORKER PRE-CACHING =================
  private initServiceWorkerListener() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'AUDIO_PRECACHED_SUCCESS') {
          this.isPrecached = true;
          this.isPrecaching = false;
          this.notifyStatusListeners(true, event.data.cachedCount || 5);
        } else if (event.data?.type === 'AUDIO_OFFLINE_STATUS_REPORT') {
          const hasCached = (event.data.cachedCount || 0) > 0;
          this.isPrecached = hasCached;
          this.notifyStatusListeners(hasCached, event.data.cachedCount);
        }
      });

      // Request status check once ready
      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({ type: 'CHECK_AUDIO_OFFLINE_STATUS' });
      }).catch(() => {});
    }
  }

  // Synthesize an offline WAV loop for pre-caching
  private renderOfflineTrackWav(type: string, durationSeconds: number = 4): string {
    const sampleRate = 22050;
    const numSamples = sampleRate * durationSeconds;
    const pcmData = new Int16Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      if (type === 'fire') {
        const noise = (Math.random() * 2 - 1) * 0.3;
        const crackle = Math.random() > 0.994 ? (Math.random() * 2 - 1) * 0.9 : 0;
        sample = noise + crackle;
      } else if (type === 'rain') {
        const rainNoise = (Math.random() * 2 - 1) * 0.45;
        const drop = Math.sin(2 * Math.PI * 850 * t) * (Math.random() > 0.99 ? 0.4 : 0);
        sample = rainNoise + drop;
      } else if (type === 'tibetan432') {
        const f1 = Math.sin(2 * Math.PI * 432 * t) * 0.6;
        const f2 = Math.sin(2 * Math.PI * 864 * t) * 0.25;
        const beat = 0.5 + 0.5 * Math.sin(2 * Math.PI * 1.5 * t);
        sample = (f1 + f2) * beat;
      } else if (type === 'solfeggio528') {
        const f1 = Math.sin(2 * Math.PI * 528 * t) * 0.65;
        const f2 = Math.sin(2 * Math.PI * 264 * t) * 0.3;
        sample = f1 + f2;
      } else if (type === 'theta') {
        const carrier = Math.sin(2 * Math.PI * 108 * t);
        const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 6.0 * t);
        sample = carrier * lfo * 0.7;
      } else {
        sample = (Math.random() * 2 - 1) * 0.25;
      }

      sample = Math.max(-1, Math.min(1, sample));
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    // Convert to WAV Container
    const buffer = new ArrayBuffer(44 + pcmData.byteLength);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.byteLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.byteLength, true);

    const pcmUint8 = new Uint8Array(pcmData.buffer);
    const resultUint8 = new Uint8Array(buffer);
    resultUint8.set(pcmUint8, 44);

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public async precacheSoundscapesToServiceWorker(): Promise<{ success: boolean; count: number }> {
    if (typeof window === 'undefined') return { success: false, count: 0 };
    this.isPrecaching = true;

    try {
      const soundscapeTypes = ['fire', 'rain', 'tibetan432', 'solfeggio528', 'theta', 'wind'];
      const items = soundscapeTypes.map((type) => ({
        id: `soundscape_${type}`,
        url: `/soundscapes/${type}.wav`,
        mimeType: 'audio/wav',
        base64: this.renderOfflineTrackWav(type, 5)
      }));

      // 1. Send to Service Worker Cache Storage
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PRECACHE_AUDIO_SOUNDSCAPES',
          items
        });
      }

      // 2. Also directly put into Cache Storage if available in window context
      if ('caches' in window) {
        const audioCache = await caches.open('catharsis-audio-v2.2.0');
        for (const item of items) {
          const binaryString = atob(item.base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const response = new Response(bytes.buffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/wav',
              'Content-Length': bytes.length.toString(),
              'Accept-Ranges': 'bytes'
            }
          });
          await audioCache.put(item.url, response);
        }
      }

      this.isPrecached = true;
      this.isPrecaching = false;
      this.notifyStatusListeners(true, items.length);
      return { success: true, count: items.length };
    } catch (err) {
      console.error('Failed to precache soundscapes to Service Worker:', err);
      this.isPrecaching = false;
      return { success: false, count: 0 };
    }
  }

  public onOfflineStatusChange(cb: (status: { isPrecached: boolean; count: number }) => void) {
    this.statusListeners.push(cb);
    cb({ isPrecached: this.isPrecached, count: this.isPrecached ? 5 : 0 });
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== cb);
    };
  }

  private notifyStatusListeners(isPrecached: boolean, count: number) {
    for (const listener of this.statusListeners) {
      listener({ isPrecached, count });
    }
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      fireVol: this.fireVol,
      rainVol: this.rainVol,
      tibetanVol: this.tibetanVol,
      solfeggioVol: this.solfeggioVol,
      thetaVol: this.thetaVol,
      windVol: this.windVol,
      masterVol: this.masterVol,
      timerEndsAt: this.timerEndsAt,
      isPrecached: this.isPrecached,
      isPrecaching: this.isPrecaching
    };
  }
}

export const ambientSound = new AmbientSoundEngine();
