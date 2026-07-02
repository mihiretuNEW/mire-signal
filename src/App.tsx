import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { LeftToolbar } from './components/LeftToolbar';
import { MainChart } from './components/MainChart';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [currentPair, setCurrentPair] = useState('Volatility 75 Index');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [chartSettings, setChartSettings] = useState({
    upColor: '#089981', // TradingView Green
    downColor: '#f23645', // TradingView Red
    showGrid: true,
  });

  // Sample data & your strict indicator payload
  const mockData = [
    { time: '2026-07-01', open: 100, high: 105, low: 98, close: 103 },
    { time: '2026-07-02', open: 103, high: 108, low: 102, close: 107 },
  ];

  const mockIndicators = {
    arrows: [
      { time: '2026-07-02', position: 'belowBar', color: '#089981', shape: 'arrowUp', text: 'BUY' }
    ]
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#131722] font-sans text-[#d1d4dc] overflow-hidden">
      <TopBar 
        currentPair={currentPair} 
        onPairChange={setCurrentPair} 
        settings={chartSettings} 
        setSettings={setChartSettings} 
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Responsive Drawer/Toolbar Setup */}
        <LeftToolbar 
          activeTool={activeTool} 
          setActiveTool={setActiveTool} 
          clearDrawings={() => setActiveTool(null)} 
        />

        <main className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-2 gap-2">
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <MainChart 
              data={mockData} 
              indicators={mockIndicators} 
              settings={chartSettings} 
              activeTool={activeTool}
            />
          </div>
          {/* Right Desktop Sidebar - Auto wraps under on Mobile */}
          <div className="w-full md:w-80 h-auto md:h-full">
            <Sidebar />
          </div>
        </main>
      </div>
    </div>
  );
}
