// src/components/StocksTable.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type StockPriceData = {
  stockCode: string;
  currentPrice: number;
  dayOverDaySign: string;
  dayOverDayChange: number;
  dayOverDayRate: number;
  accumulatedVolume: number;
};

interface StocksTableProps {
  page: number;
  size: number;
}

export default function StocksTable({ page, size }: StocksTableProps) {
  const [codes, setCodes] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, StockPriceData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subsRef = useRef<StompSubscription[]>([]);

  // 1) STOMP 클라이언트 초기화 (한 번만)
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws/stocks');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP DEBUG]', msg),
    });

    client.onConnect = () => {
      console.log('🟢 STOMP 연결됨');
      setIsConnected(true);
    };
    client.onStompError = (frame) => {
      console.error('❌ STOMP 에러:', frame.headers['message']);
    };
    client.onWebSocketClose = () => {
      console.log('🔴 STOMP 연결 끊김');
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      console.log('🛑 STOMP 비활성화');
    };
  }, []);

  // 2) page/size 변경 시 종목코드 fetch
  useEffect(() => {
    // 1) 종목코드 fetch
    fetch(`http://localhost:8080/api/v1/stocks?page=${page}&size=${size}`)
      .then((res) => res.json())
      .then((codes: string[]) => {
        setCodes(codes);
        // 2) 백엔드에도 구독 변경 요청
        fetch('http://localhost:8080/api/v1/stocks/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(codes),
        });
      });
  }, [page, size]);

  // 3) isConnected 또는 codes 변경 시: 기존 구독 해제 → 새 구독
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !isConnected) {
      console.warn('⚠️ STOMP 연결되지 않아 구독 생략');
      return;
    }

    // 메시지 콜백
    const onMessage = (msg: IMessage) => {
      const data: StockPriceData = JSON.parse(msg.body);
      setPrices((prev) => ({ ...prev, [data.stockCode]: data }));
    };

    // 3-1) 기존 구독 해제
    subsRef.current.forEach((sub) => sub.unsubscribe());
    subsRef.current = [];

    // 3-2) 새로운 코드 구독
    codes.forEach((code) => {
      const sub = client.subscribe(`/topic/stocks/${code}`, onMessage);
      subsRef.current.push(sub);
      console.log(`✅ SUBSCRIBE /topic/stocks/${code}`);
    });

    // cleanup (컴포넌트 언마운트 or 종목 바뀔 때)
    return () => {
      subsRef.current.forEach((sub) => sub.unsubscribe());
      subsRef.current = [];
    };
  }, [isConnected, codes]);

  return (
    <section style={{ marginTop: 20 }}>
      <h2>실시간 ETF 시세 (페이지 {page + 1})</h2>
      <div style={{ marginBottom: 10 }}>
        상태: {isConnected ? '🟢 연결됨' : '🟡 연결 중/끊김'}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>종목코드</th>
            <th>등락률</th>
            <th>전일대비</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => {
            const d = prices[code];
            return (
              <tr key={code}>
                <td>{code}</td>
                <td>{d?.dayOverDayRate?.toFixed(2) ?? '-'}%</td>
                <td>{d?.dayOverDayChange ?? '-'}</td>
              </tr>
            );
          })}
          {codes.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                데이터 로딩 중...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
