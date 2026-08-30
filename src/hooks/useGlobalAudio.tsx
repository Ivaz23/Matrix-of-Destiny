
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { getSpeech, decodeAudioData } from '../../services/geminiService';

interface AudioContextType {
  playingId: string | number | null;
  loadingId: string | number | null;
  setLoadingId: (id: string | number | null) => void;
  playAudio: (text: string, id: string | number, voice?: string) => Promise<void>;
  stopAudio: () => void;
  playSolfeggioTone: (freq?: number, durationMs?: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isLoaded: boolean;
  error: string | null;
}

const GlobalAudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const getOrCreateAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      if (!prev) {
        stopAudio();
      }
      return !prev;
    });
  };

  const playSolfeggioTone = (freq: number = 528, durationMs: number = 1500) => {
    if (isMuted) return;
    try {
      const ctx = getOrCreateAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000 + 0.1);
    } catch (e) {
      console.warn("Could not play solfeggio tone:", e);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) { /* ignore */ }
      sourceRef.current = null;
    }
    setPlayingId(null);
  };

  const playAudio = async (text: string, id: string | number, voice?: string) => {
    if (isMuted) return;
    if (playingId === id) {
      stopAudio();
      return;
    }

    stopAudio();
    setLoadingId(id);
    setError(null);

    try {
      const ctx = getOrCreateAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const base64Audio = await getSpeech(text, voice);
      const buffer = await decodeAudioData(base64Audio, ctx);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setPlayingId(prev => prev === id ? null : prev);
      };
      source.start();
      
      sourceRef.current = source;
      setPlayingId(id);
    } catch (e: any) {
      console.error("Global Audio Error:", e);
      setError("Связь с эгрегором прервана.");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  return (
    <GlobalAudioContext.Provider value={{ 
      playingId, 
      loadingId, 
      setLoadingId, 
      playAudio, 
      stopAudio, 
      playSolfeggioTone,
      isMuted,
      toggleMute,
      isLoaded,
      error 
    }}>
      {children}
    </GlobalAudioContext.Provider>
  );
};

export const useGlobalAudio = () => {
  const context = useContext(GlobalAudioContext);
  if (!context) throw new Error("useGlobalAudio must be used within AudioProvider");
  return context;
};
