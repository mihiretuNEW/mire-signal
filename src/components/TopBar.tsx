import React, { useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';

interface TopBarProps {
  currentPair: string;
  onPairChange: (pair: string) => void;
  settings: { upColor: string; downColor: string; showGrid: boolean };
  setSettings: React.Dispatch<React.SetStateAction<any>>;
}

export const TopBar: React.FC<TopBarProps> = ({ currentPair, onPairChange, settings, setSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const pairs = ['Volatility 10 Index', 'Volatility 75 Index', 'Volatility 100 Index', 'Gold (XAU/USD)', 'EUR/USD'];

  return (
    <div className="h-14 bg-[#1c2030] border-b border-[#2a2e39] flex items-center justify-between px-4 z-50 relative select-none">
      <div className="flex items-center gap-4">
        {/* TradingView Style Droplist */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-[#2a2e39] text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-[#363c4e] transition-all"
          >
            {currentPair} <ChevronDown size={14} />
          </button>

          {isOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-[#1c2030] border border-[#2a2e39] rounded shadow-xl z-50">
              {pairs.map((pair) => (
                <div
                  key={pair}
                  onClick={() => {
                    onPairChange(pair);
                    setIsOpen(false); // Automatically closes when clicked
                  }}
                  className="px-4 py-2 text-sm text-[#d1d4dc] hover:bg-[#2962ff] hover:text-white cursor-pointer transition-all"
                >
                  {pair}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Candlestick & View Setting Menu */}
      <div className="relative">
        <button onClick={() => setShowSettings(!showSettings)} className="text-[#848e9c] hover:text-white p-2">
          <Settings size={18} />
        </button>

        {showSettings && (
          <div className="absolute right-0 mt-2 w-64 bg-[#1c2030] border border-[#2a2e39] p-4 rounded shadow-2xl z-50 text-sm">
            <h4 className="text-white font-semibold mb-3 border-b border-[#2a2e39] pb-1">Chart Settings</h4>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[#848e9c]">Bullish Candle</span>
                <input 
                  type="color" 
                  value={settings.upColor} 
                  onChange={(e) => setSettings({ ...settings, upColor: e.target.value })}
                  className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#848e9c]">Bearish Candle</span>
                <input 
                  type="color" 
                  value={settings.downColor} 
                  onChange={(e) => setSettings({ ...settings, downColor: e.target.value })}
                  className="w-8 h-6 bg-transparent border-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
