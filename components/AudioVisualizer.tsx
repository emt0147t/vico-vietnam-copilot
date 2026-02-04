import React from 'react';

interface AudioVisualizerProps {
  volume: number; // 0 to 1
  active: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ volume, active }) => {
  // Create a visual effect like the Astra demo (pulsing circle or waveform)
  // We'll do a center pulsing aura effect.
  
  if (!active) return null;

  return (
    <div className="flex items-center justify-center w-full h-full pointer-events-none">
       {/* Central glowing orb */}
       <div className="relative flex items-center justify-center">
          {/* Outer glow rings based on volume */}
          <div 
            className="absolute rounded-full bg-blue-500 opacity-20 blur-xl transition-all duration-75"
            style={{
                width: `${100 + volume * 400}px`,
                height: `${100 + volume * 400}px`,
            }}
          />
          <div 
            className="absolute rounded-full bg-cyan-400 opacity-30 blur-lg transition-all duration-75"
            style={{
                width: `${80 + volume * 300}px`,
                height: `${80 + volume * 300}px`,
            }}
          />
           <div 
            className="absolute rounded-full bg-white opacity-40 blur-md transition-all duration-75"
            style={{
                width: `${60 + volume * 100}px`,
                height: `${60 + volume * 100}px`,
            }}
          />
          
          {/* Core Logo/Icon placeholder or just a solid core */}
          <div className="z-10 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.6)] animate-pulse border-2 border-white/50" />
       </div>
    </div>
  );
};
