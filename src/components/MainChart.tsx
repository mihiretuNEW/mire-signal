import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts';
import { useChartSync } from '../contexts/ChartSyncContext';

interface MainChartProps {
  data: any[];
  indicators: any;
  settings: {
    upColor: string;
    downColor: string;
    showGrid: boolean;
  };
  activeTool: string | null;
}

export const MainChart: React.FC<MainChartProps> = ({ data, indicators, settings, activeTool }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const drawingLinesRef = useRef<any[]>([]);
  const [drawings, setDrawings] = useState<any[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // TradingView Premium Dark Theme Layout
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#131722' }, // TradingView Dark Bg
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: settings.showGrid ? '#1f222e' : 'transparent' },
        horzLines: { color: settings.showGrid ? '#1f222e' : 'transparent' },
      },
      crosshair: {
        mode: 0, // Normal crosshair mode
        vertLine: { width: 1, color: '#758696', style: LineStyle.LargeDashed },
        horzLine: { width: 1, color: '#758696', style: LineStyle.LargeDashed },
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
        visible: true,
        alignLabels: true, // Shows all price labels cleanly near current price
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: settings.upColor,
      downColor: settings.downColor,
      borderUpColor: settings.upColor,
      borderDownColor: settings.downColor,
      wickUpColor: settings.upColor,
      wickDownColor: settings.downColor,
    });

    candlestickSeriesRef.current = candlestickSeries;
    chartRef.current = chart;

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    // Drawing Logic (Click to Draw on Chart)
    chart.subscribeClick((param) => {
      if (!param.point || !param.time || !activeTool) return;

      const price = candlestickSeries.coordinateToPrice(param.point.y);
      if (!price) return;

      if (activeTool === 'horizontal') {
        const hLine = chart.addLineSeries({
          color: '#2962ff',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
        });
        hLine.setData([{ time: data[0].time, value: price }, { time: data[data.length - 1].time, value: price }]);
        drawingLinesRef.current.push(hLine);
      } else if (activeTool === 'risk-reward') {
        // Render TradingView Style Color Block for Risk/Reward
        const stopDistance = price * 0.002; 
        const targetDistance = price * 0.004;

        const targetLine = chart.addLineSeries({ color: '#26a69a', lineWidth: 1 }); // Green Target
        const stopLine = chart.addLineSeries({ color: '#ef5350', lineWidth: 1 }); // Red Stop

        targetLine.setData([{ time: data[0].time, value: price + targetDistance }, { time: data[data.length - 1].time, value: price + targetDistance }]);
        stopLine.setData([{ time: data[0].time, value: price - stopDistance }, { time: data[data.length - 1].time, value: price - stopDistance }]);
        
        drawingLinesRef.current.push(targetLine, stopLine);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [settings, activeTool]);

  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
      
      // Indicators logic injection point (Strictly applying original math-driven arrows)
      if (indicators && indicators.arrows) {
        candlestickSeriesRef.current.setMarkers(indicators.arrows);
      }
    }
  }, [data, indicators]);

  return (
    <div className="relative w-full h-[500px] border border-[#2a2e39] bg-[#131722] rounded-md overflow-hidden">
      <div ref={chartContainerRef} className="w-full h-full" />
      {/* Zoom / Move Controls UI Overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-1 bg-[#1c2030] p-1 rounded border border-[#2a2e39]">
        <button onClick={() => chartRef.current?.timeScale().zoomOut(1)} className="px-2 py-1 text-white hover:bg-[#2a2e39] rounded text-xs">-</button>
        <button onClick={() => chartRef.current?.timeScale().zoomIn(1)} className="px-2 py-1 text-white hover:bg-[#2a2e39] rounded text-xs">+</button>
        <button onClick={() => chartRef.current?.timeScale().resetTimeScale()} className="px-2 py-1 text-white hover:bg-[#2a2e39] rounded text-xs">Reset</button>
      </div>
    </div>
  );
};
