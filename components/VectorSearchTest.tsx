
import React from 'react';

export const VectorSearchTest: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-[#0B101B] flex flex-col items-center justify-center p-8 animate-fade-in font-sans">
        <div className="w-full max-w-lg bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Vector Engine Disabled</h2>
            <p className="text-gray-400 mb-6">
                The local embedding engine has been removed to optimize performance and remove dependencies. 
                Competitor matching now uses a simplified keyword algorithm.
            </p>
            <button onClick={onClose} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">Close</button>
        </div>
    </div>
  );
};
