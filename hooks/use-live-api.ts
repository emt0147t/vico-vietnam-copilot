
import { useState, useRef, useCallback, useEffect } from 'react';
import { base64Encode, base64Decode, pcmToAudioBuffer } from '../utils/audio';
import { ContentChunk } from '../types';

// Using Google's SDK types
declare const google: any;
type GoogleGenAI = typeof google.generativeAI;
type LiveServerMessage = any;

// Modality enum values
const Modality = {
  AUDIO: 'AUDIO',
  TEXT: 'TEXT',
} as const;

export interface UseLiveAPI {
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendRealtimeInput: (chunks: ContentChunk[]) => void;
  volume: number; // For visualization (0-1)
  // Send a text prompt via the server-side AI proxy (`/api/ai/generate`)
  generateText: (prompt: string, opts?: { model?: string; temperature?: number; maxOutputTokens?: number }) => Promise<any>;
}

// Updated to the latest recommended model for native audio conversation as per guidelines
const MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

export function useLiveAPI(): UseLiveAPI {
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  
  // API and Session Refs
  const clientRef = useRef<GoogleGenAI | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Audio Playback State
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialization
  useEffect(() => {
    // IMPORTANT: Do NOT use client-side API keys. The API key must be kept on the server.
    // The previous implementation passed `process.env.API_KEY` into the client which
    // caused the secret to be embedded into the JS bundle (exposed to users).
    // Instead, the frontend should call a server-side proxy endpoint (e.g. `/api/ai/...`)
    // that performs requests to the Gemini/Gen AI service using a server-only API key.
    if (!clientRef.current && typeof google !== 'undefined' && google.generativeAI) {
      // Initialize without an API key client-side — if an unauthenticated SDK is supported
      // it may attempt to use browser-managed credentials, otherwise prefer server proxy.
      try {
        clientRef.current = google.generativeAI();
      } catch (e) {
        console.warn('Live AI client not initialized client-side. Use server-side proxy `/api/ai/*` instead.');
        clientRef.current = null;
      }
    }
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation Frame for Volume Visualization
  useEffect(() => {
    let animationFrameId: number;
    const updateVolume = () => {
      const a = analyserRef.current;
      if (a) {
        const dataArray = new Uint8Array(a.frequencyBinCount);
        a.getByteFrequencyData(dataArray);
        let sum = 0;
        for (const v of dataArray) {
          sum += v;
        }
        const avg = dataArray.length ? sum / dataArray.length : 0;
        setVolume(Math.min(1, avg / 128));
      } else {
        setVolume(0);
      }
      animationFrameId = requestAnimationFrame(updateVolume);
    };

    if (connected) {
      updateVolume();
    } else {
      setVolume(0);
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [connected]);

  const disconnect = useCallback(() => {
    setConnected(false);
    sessionPromiseRef.current = null;

    scheduledSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    scheduledSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    if (!clientRef.current) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = audioCtx;
    
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    analyserRef.current = analyser;
    analyser.connect(audioCtx.destination);

    const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    inputAudioContextRef.current = inputAudioCtx;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputAudioCtx.createMediaStreamSource(stream);
      inputSourceRef.current = source;
      
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      const live = clientRef.current.live;
      sessionPromiseRef.current = live.connect({
        model: MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are VICO, a professional Vietnam Market Strategy Copilot.
          
          Role:
          - You are an expert in Vietnam's business landscape, technology trends, and startup ecosystem.
          - You act as a strategic consultant for investors and business leaders.
          - You speak Vietnamese (primary) and English (if asked).
          
          Tone:
          - Professional, insightful, concise, and data-driven.
          - Use business terminology appropriate for executive briefings.
          
          Capabilities:
          - Discuss market trends (EV, Fintech, AI).
          - Analyze competitors (VinFast, FPT, MoMo, etc.).
          - Provide strategic recommendations.`
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Opened');
            setConnected(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && audioCtx) {
              const audioData = base64Decode(base64Audio);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);

              try {
                const audioBuffer = await pcmToAudioBuffer(audioData, audioCtx, 24000);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                
                if (analyserRef.current) {
                  source.connect(analyserRef.current);
                } else {
                  source.connect(audioCtx.destination);
                }

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;

                source.onended = () => {
                  scheduledSourcesRef.current.delete(source);
                };
                scheduledSourcesRef.current.add(source);
              } catch (e) {
                console.error("Error decoding/playing audio", e);
              }
            }
          },
          onclose: () => {
            console.log('Gemini Live Session Closed');
            disconnect();
          },
          onerror: (err: any) => {
            console.error('Gemini Live Session Error', err);
            disconnect();
          }
        }
      });

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!e.inputBuffer) return;
        const inputData = e.inputBuffer.getChannelData(0) ?? new Float32Array(0);

        // Manual implementation of encoding as per guidelines
        const l = inputData.length;
        const int16 = new Int16Array(l);
        let idx = 0;
        for (const s of inputData) {
          int16[idx++] = s * 32768;
        }
        const base64Data = base64Encode(new Uint8Array(int16.buffer));
        
        // Ensure data is sent only after the session promise resolves
        sessionPromiseRef.current?.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data
                }
            });
        });
      };

    } catch (err) {
      console.error("Failed to initialize audio input or connection", err);
      disconnect();
    }
  }, [disconnect]);

  const sendRealtimeInput = useCallback((chunks: ContentChunk[]) => {
    if (!sessionPromiseRef.current) return;
    sessionPromiseRef.current.then(session => {
        chunks.forEach(chunk => {
             session.sendRealtimeInput({ media: chunk });
        });
    });
  }, []);

  const generateText = useCallback(async (prompt: string, opts: { model?: string; temperature?: number; maxOutputTokens?: number } = {}) => {
    if (!prompt || typeof prompt !== 'string') throw new Error('prompt required');
    try {
      const body = {
        prompt,
        model: opts.model || 'gemini-2.1',
        temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.2,
        maxOutputTokens: typeof opts.maxOutputTokens === 'number' ? opts.maxOutputTokens : 1024
      };
      const r = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err?.error || `AI proxy error ${r.status}`);
      }
      const json = await r.json();
      return json;
    } catch (e) {
      console.error('generateText proxy error', e);
      throw e;
    }
  }, []);

  return {
    connected,
    connect,
    disconnect,
    sendRealtimeInput,
    volume,
    generateText
  };
}
