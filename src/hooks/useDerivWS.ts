import { useEffect, useRef, useState } from 'react';
import { DERIV_WS_URL } from '../lib/derivConfig';
import type { CandleData } from '../lib/calculators';

export function useDerivWS(symbol: string, granularity: number, initialCount: number = 1000, subscribe: boolean = true) {
  const wsRef = useRef<WebSocket | null>(null);
  const candlesRef = useRef<CandleData[]>([]);
  const pingIntervalRef = useRef<number | null>(null);
  const updateThrottleRef = useRef<number | undefined>(undefined);
  const isFetchingHistoryRef = useRef<boolean>(false);

  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fetchMoreHistory = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (candlesRef.current.length === 0) return;
    if (isFetchingHistoryRef.current) return;
    
    isFetchingHistoryRef.current = true;
    const oldestCandle = candlesRef.current[0];

    wsRef.current.send(JSON.stringify({
      ticks_history: symbol,
      adjust_start_time: 1,
      count: 2000, // Fetch up to 2000 more candles
      end: oldestCandle.epoch,
      style: 'candles',
      granularity: granularity
    }));
  };

  useEffect(() => {
    const ws = new WebSocket(DERIV_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setErrorMsg(null);

      // Ping to keep connection alive
      pingIntervalRef.current = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ ping: 1 }));
        }
      }, 15000);

      // Fetch history and subscribe
      const req: any = {
        ticks_history: symbol,
        adjust_start_time: 1,
        count: initialCount,
        end: 'latest',
        style: 'candles',
        granularity: granularity
      };
      if (subscribe) req.subscribe = 1;

      ws.send(JSON.stringify(req));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      
      if (data.error) {
        if (data.error.code === 'MarketIsClosed' && data.echo_req?.subscribe === 1) {
          console.warn("Market is closed. Fetching historical data without subscription.");
          // Fetch again without subscribe
          ws.send(JSON.stringify({
            ticks_history: symbol,
            adjust_start_time: 1,
            count: initialCount,
            end: 'latest',
            style: 'candles',
            granularity: granularity
          }));
          return;
        }

        console.error("Deriv WS Error:", data.error.message);
        setErrorMsg(`Deriv API Error: ${data.error.message}`);
        isFetchingHistoryRef.current = false;
        return;
      }

      if (data.msg_type === 'candles') {
        const history: CandleData[] = data.candles.map((c: any) => ({
          epoch: c.epoch,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.tick_volume || c.volume || (c.high - c.low)
        }));

        if (isFetchingHistoryRef.current && candlesRef.current.length > 0) {
           // We fetched more history prepending the array
           // The API returns history ending at `end` epoch, which includes our current oldest candle.
           const newHistory = history.filter(c => c.epoch < candlesRef.current[0].epoch);
           candlesRef.current = [...newHistory, ...candlesRef.current];
           isFetchingHistoryRef.current = false;
        } else {
           // Initial load
           candlesRef.current = history;
        }
        if (updateThrottleRef.current === undefined) {
          updateThrottleRef.current = window.setTimeout(() => {
            setCandles([...candlesRef.current]);
            updateThrottleRef.current = undefined;
          }, 250); // Max 4 FPS
        }
      } else if (data.msg_type === 'ohlc') {
        const tick = data.ohlc;
        const newCandle: CandleData = {
          epoch: tick.open_time || tick.epoch,
          open: parseFloat(tick.open),
          high: parseFloat(tick.high),
          low: parseFloat(tick.low),
          close: parseFloat(tick.close),
          volume: tick.tick_volume || tick.volume || (parseFloat(tick.high) - parseFloat(tick.low))
        };
        
        const prev = candlesRef.current;
        if (prev.length === 0) {
          prev.push(newCandle);
        } else {
          const lastCandle = prev[prev.length - 1];
          if (lastCandle.epoch === newCandle.epoch) {
            prev[prev.length - 1] = newCandle;
          } else {
            prev.push(newCandle);
            if (prev.length > 5000) prev.shift(); // Increased max array size
          }
        }

        if (updateThrottleRef.current === undefined) {
          updateThrottleRef.current = window.setTimeout(() => {
            setCandles([...candlesRef.current]);
            updateThrottleRef.current = undefined;
          }, 250); // Max 4 FPS
        }
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error', err);
      setErrorMsg('WebSocket connection failed. Verify App ID and browser extensions.');
      isFetchingHistoryRef.current = false;
    };

    ws.onclose = () => {
      setIsConnected(false);
      isFetchingHistoryRef.current = false;
      if (pingIntervalRef.current) window.clearInterval(pingIntervalRef.current);
    };

    return () => {
      if (pingIntervalRef.current) window.clearInterval(pingIntervalRef.current);
      ws.close();
    };
  }, [symbol, granularity]);

  return { candles, isConnected, fetchMoreHistory, errorMsg };
}
