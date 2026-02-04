import React from 'react';
import { Mic, MicOff, Video, VideoOff, Power, Settings } from 'lucide-react';

interface ControlTrayProps {
  connected: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const ControlTray: React.FC<ControlTrayProps> = ({
  connected,
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-gray-800 shadow-2xl z-50">
      
      <button 
        onClick={onToggleVideo}
        className={`p-4 rounded-full transition-all ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
      >
        {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
      </button>

      <button 
        onClick={onToggleAudio}
        className={`p-4 rounded-full transition-all ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
      >
        {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      <div className="w-[1px] h-8 bg-gray-700 mx-2"></div>

      {connected ? (
          <button 
            onClick={onDisconnect}
            className="flex items-center gap-2 px-6 py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
          >
            <Power size={24} />
            <span>End Session</span>
          </button>
      ) : (
          <button 
            onClick={onConnect}
            className="flex items-center gap-2 px-6 py-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            <Power size={24} />
            <span>Start Live</span>
          </button>
      )}
      
    </div>
  );
};
