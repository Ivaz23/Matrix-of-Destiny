import { useState, useEffect, useRef, useCallback } from 'react';
import { connectToChubukLive } from '../../services/geminiService';
import { MatrixNumbers, UserInput, AstrologyData } from '../../types';

export const useLiveChat = (context: { userInput: UserInput | null, matrix: MatrixNumbers | null, astrology: AstrologyData | null }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const isActiveRef = useRef(false);

  const stop = useCallback(() => {
    setIsActive(false);
    isActiveRef.current = false;
    setIsConnecting(false);
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    audioQueue.current = [];
    isPlayingRef.current = false;
  }, []);

  const playNextInQueue = useCallback(() => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const ctx = audioContextRef.current;
    const pcmData = audioQueue.current.shift()!;
    
    const buffer = ctx.createBuffer(1, pcmData.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => playNextInQueue();
    source.start();
  }, []);

  const start = useCallback(async () => {
    if (isActive) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Ваш браузер не поддерживает доступ к микрофону.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      // Use 24kHz for output as Gemini Live output is 24kHz
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      // Capture at 24kHz, we'll send it as 24kHz or resample. 
      // Gemini Live supports 16kHz, 24kHz, 48kHz. Let's use 24kHz for consistency.
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      const sessionPromise = connectToChubukLive({
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          isActiveRef.current = true;
          console.log("Live Session Opened");
        },
        onmessage: (message) => {
          if (message.serverContent?.modelTurn?.parts) {
            const audioPart = message.serverContent.modelTurn.parts.find(p => p.inlineData);
            if (audioPart?.inlineData) {
              const base64 = audioPart.inlineData.data;
              const binary = atob(base64);
              const pcm = new Int16Array(binary.length / 2);
              const view = new DataView(new Uint8Array(Array.from(binary, c => c.charCodeAt(0))).buffer);
              for (let i = 0; i < pcm.length; i++) {
                pcm[i] = view.getInt16(i * 2, true);
              }
              audioQueue.current.push(pcm);
              if (!isPlayingRef.current) {
                playNextInQueue();
              }
            }

            const textPart = message.serverContent.modelTurn.parts.find(p => p.text);
            if (textPart?.text) {
              setTranscript(prev => (prev + " " + textPart.text).trim());
            }
          }
          
          if (message.serverContent?.interrupted) {
            audioQueue.current = [];
            isPlayingRef.current = false;
          }
        },
        onerror: (err) => {
          console.error("Live Error:", err);
          setError("Ошибка связи с эгрегором.");
          stop();
        },
        onclose: () => {
          console.log("Live Session Closed");
          stop();
        }
      }, context);

      const session = await sessionPromise;
      sessionRef.current = session;

      processor.onaudioprocess = (e) => {
        if (!sessionRef.current || !isActiveRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        session.sendRealtimeInput({
          media: { data: base64, mimeType: 'audio/pcm;rate=24000' }
        });
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

    } catch (err: any) {
      console.error("Failed to start live chat:", err);
      let errorMessage = "Не удалось получить доступ к микрофону.";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Доступ к микрофону отклонен. Пожалуйста, разрешите доступ в настройках браузера.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "Микрофон не найден. Пожалуйста, подключите устройство.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsConnecting(false);
      stop();
    }
  }, [isActive, context, stop, playNextInQueue]);

  return {
    isActive,
    isConnecting,
    error,
    transcript,
    start,
    stop
  };
};
