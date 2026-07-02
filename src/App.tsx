import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { LeftToolbar } from './components/LeftToolbar';
import { MainChart } from './components/MainChart';
import { Sidebar } from './components/Sidebar';
import { BottomChartLw } from './components/BottomChartLw';
import { OscillatorChartLw } from './components/OscillatorChartLw';
import { StochChart } from './components/StochChart';
import { DisciplineTracker } from './components/DisciplineTracker';
import { useDerivWS } from './hooks/useDerivWS';
import { useIndicatorWorker } from './hooks/useIndicatorWorker';

export default function App() {
  const [currentPair, setCurrentPair] = useState('Volatility 75 Index');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [chartSettings, setChartSettings] = useState({
    upColor: '#089981',   // TradingView Bullish Green
    downColor: '#f23645', // TradingView Bearish Red
    showGrid: true,
  });

  // 1. Maintain your exact live production WebSockets data pipeline
  const { ticks, candles, connectionStatus } = useDerivWS(currentPair);

  // 2. Keep your exact mathematical indicators logic completely untouched
  const { indicators, processing } = useIndicatorWorker(candles || ticks);

  // 3. Fallback tracking to prevent canvas crashes if data streams lag
  const activeCandles = candles && candles.length > 0 ? candles : [];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#131722] font-sans text-[#d1d4dc] overflow-hidden">
      {/* Dynamic Upper Panel */}
      <TopBar 
        currentPair={currentPair} 
        onPairChange={setCurrentPair} 
        settings={chartSettings} 
        setSettings={setChartSettings} 
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left TradingView Style Utilities Bar */}
        <LeftToolbar 
          activeTool={activeTool} 
          setActiveTool={setActiveTool} 
          clearDrawings={() => setActiveTool(null)} 
        />

        {/* Master Responsive Workspace */}
        <main className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-2 gap-2">
          
          {/* Main Visualizer Area */}
          <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-y-auto md:overflow-y-scroll no-scrollbar">
            
            {/* Main Primary Candlestick Area */}
            <MainChart 
              data={activeCandles} 
              indicators={indicators} 
              settings={chartSettings} 
              activeTool={activeTool}
            />

            {/* Sub-window Charts: Keeping their strict native mathematical indicator rules intact */}
            <div className="grid grid-cols-1 gap-2">
              <BottomChartLw data={activeCandles} indicators={indicators} />
              <OscillatorChartLw data={activeCandles} indicators={indicators} />
              <StochChart data={activeCandles} indicators={indicators} />
            </div>
          </div>

          {/* Right Action panel for controls and disciplines tracking */}
          <div className="w-full md:w-80 flex flex-col gap-2 shrink-0">
            <Sidebar status={connectionStatus} loading={processing} />
            <DisciplineTracker />
          </div>

        </main>
      </div>
    </div>
  );
}
