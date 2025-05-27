import React, { useEffect, useRef, useState } from 'react';

type StockPriceData = {
    stockCode: string;
    currentPrice: number;
    dayOverDaySign: string;
    dayOverDayChange: number;
    dayOverDayRate: number;
    accumulatedVolume: number;
};

type Props = {
    stockCodes: string[]; // 현재 페이지 종목 10개
    socketSendSubscribe: (code: string) => void;
    socketSendUnsubscribe: (code: string) => void;
};

const StocksTable = ({ stockCodes, socketSendSubscribe, socketSendUnsubscribe }: Props) => {
    const [stockData, setStockData] = useState<Record<string, StockPriceData | null>>({});
    const stockCache = useRef<Map<string, StockPriceData>>(new Map());

    // 1. 웹소켓 메시지 수신 핸들러
    useEffect(() => {
        const handleSocketMessage = (data: StockPriceData) => {
            stockCache.current.set(data.stockCode, data); // 캐시에 저장
            setStockData(prev => ({ ...prev, [data.stockCode]: data })); // 상태 갱신
        };

        // 바인딩
        window.addEventListener('stock-price', (e: any) => handleSocketMessage(e.detail));
        return () => {
            window.removeEventListener('stock-price', (e: any) => handleSocketMessage(e.detail));
        };
    }, []);

    // 2. 페이지 변경 시 구독 + 캐시 확인
    useEffect(() => {
        stockCodes.forEach(code => {
            const cached = stockCache.current.get(code);
            if (cached) {
                setStockData(prev => ({ ...prev, [code]: cached }));
            } else {
                setStockData(prev => ({ ...prev, [code]: null })); // 로딩 표시
            }
            socketSendSubscribe(code); // 구독 요청
        });

        return () => {
            stockCodes.forEach(code => socketSendUnsubscribe(code)); // 페이지 바뀌면 구독 해제
        };
    }, [stockCodes]);

    return (
        <table>
            <thead>
            <tr>
                <th>종목코드</th>
                <th>현재가</th>
                <th>등락률</th>
            </tr>
            </thead>
            <tbody>
            {stockCodes.map(code => {
                const data = stockData[code];
                return (
                    <tr key={code}>
                        <td>{code}</td>
                        <td>{data ? data.currentPrice.toLocaleString() : '⏳'}</td>
                        <td>{data ? `${data.dayOverDayRate}%` : ''}</td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
};

export default StocksTable;
