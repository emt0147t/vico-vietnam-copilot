export type LiveConfig = {
  model: string;
  systemInstruction?: string;
};

export interface MultimodalLiveClient {
  connect: (config: LiveConfig) => Promise<void>;
  disconnect: () => void;
  sendRealtimeInput: (chunks: ContentChunk[]) => void;
  isConnected: boolean;
}

export interface ContentChunk {
  mimeType: string;
  data: string; // Base64
}

export interface AudioStreamConfig {
  sampleRate: number;
}
