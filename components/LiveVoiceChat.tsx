
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { connectToChubukLive } from '../services/geminiService';
import { UserInput, MatrixNumbers, AstrologyData } from '../types';

interface LiveVoiceChatProps {
  userInput: UserInput | null;
  matrix: MatrixNumbers | null;
  astrology?: AstrologyData | null;
}

const LiveVoiceChat: React.FC<LiveVoiceChatProps> = ({ userInput, matrix, astrology }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const heartbeatRef = useRef<any>(null);

  const stopSession = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    sessionRef.current?.close();
    sessionRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    processorRef.current?.disconnect();
    processorRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    setTranscript(["[Система]: Открываем портал..."]);
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current || !isConnected) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      sessionRef.current = await connectToChubukLive({
        onopen: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setTranscript(prev => [...prev, "[Система]: Связь установлена. Chubuk слушает."]);
          
          // Heartbeat to keep connection alive
          heartbeatRef.current = setInterval(() => {
            if (sessionRef.current && isConnected) {
              // Send 100ms of silence (1600 samples * 2 bytes = 3200 bytes)
              const silence = new Int16Array(1600).fill(0);
              const base64Silence = btoa(String.fromCharCode(...new Uint8Array(silence.buffer)));
              sessionRef.current.sendRealtimeInput({
                media: { data: base64Silence, mimeType: 'audio/pcm;rate=16000' }
              });
            }
          }, 10000);
        },
        onmessage: async (message) => {
          if (message.serverContent?.modelTurn?.parts) {
            const audioPart = message.serverContent.modelTurn.parts.find(p => p.inlineData);
            if (audioPart?.inlineData) {
              const base64Audio = audioPart.inlineData.data;
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcmData = new Int16Array(bytes.buffer);
              audioQueueRef.current.push(pcmData);
              if (!isPlayingRef.current) playNextInQueue();
            }

            const textPart = message.serverContent.modelTurn.parts.find(p => p.text);
            if (textPart?.text) {
              setTranscript(prev => [...prev, `Chubuk: ${textPart.text}`]);
            }
          }
          if (message.serverContent?.interrupted) {
            audioQueueRef.current = [];
            setIsSpeaking(false);
            setTranscript(prev => [...prev, "[Система]: Перебито."]);
          }
        },
        onerror: (err) => {
          console.error("Live API Error:", err);
          setError("Связь с духами прервана...");
          setTranscript(prev => [...prev, "[Ошибка]: Связь прервана."]);
          stopSession();
        },
        onclose: () => {
          setIsConnected(false);
          setTranscript(prev => [...prev, "[Система]: Портал закрыт."]);
          stopSession();
        }
      }, { userInput, matrix, astrology });

    } catch (err) {
      console.error("Failed to start Live session:", err);
      setError("Не удалось открыть портал голоса. Проверьте микрофон.");
      setIsConnecting(false);
    }
  };

  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const pcmData = audioQueueRef.current.shift()!;
    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768.0;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = playNextInQueue;
    source.start();
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform group"
      >
        <Mic className="text-white group-hover:animate-pulse" size={24} />
        <div className="absolute -top-12 left-0 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-purple-500/30">
          Голос Чубука
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-md bg-[#0a0f1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
              <button 
                onClick={() => { setIsOpen(false); stopSession(); }}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-600/20 flex items-center justify-center border border-purple-500/30 ${isSpeaking ? 'animate-pulse' : ''}`}>
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-inner ${isConnected ? 'animate-glow' : ''}`}>
                      {isMuted ? <MicOff className="text-white/50" size={24} /> : <Mic className="text-white" size={24} />}
                    </div>
                  </div>
                  {isConnected && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 rounded-full bg-purple-500/20 -z-10"
                    />
                  )}
                </div>

                <h3 className="text-xl font-serif text-amber-500 mb-1">Голос Чубука</h3>
                
                {/* Transcript Area */}
                <div className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl mb-6 overflow-y-auto p-4 text-left custom-scrollbar">
                  {transcript.length === 0 ? (
                    <p className="text-slate-600 text-[10px] uppercase tracking-widest text-center mt-12 italic">Ожидание связи...</p>
                  ) : (
                    transcript.map((line, i) => (
                      <p key={i} className={`text-xs mb-2 leading-relaxed ${line.startsWith('Chubuk:') ? 'text-amber-200' : 'text-slate-500 italic'}`}>
                        {line}
                      </p>
                    ))
                  )}
                  <div ref={transcriptEndRef} />
                </div>

                {error && <p className="text-red-400 text-[10px] mb-4 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">{error}</p>}

                <div className="flex gap-4">
                  {!isConnected ? (
                    <button
                      onClick={startSession}
                      disabled={isConnecting}
                      className="px-8 py-3 rounded-full bg-amber-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-amber-400 transition-colors disabled:opacity-50"
                    >
                      {isConnecting ? "Загрузка..." : "Начать сеанс"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3 rounded-full border transition-all ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                      <button
                        onClick={stopSession}
                        className="px-6 py-3 rounded-full bg-red-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-400 transition-colors"
                      >
                        Завершить
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveVoiceChat;
