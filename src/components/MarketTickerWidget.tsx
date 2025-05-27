'use client';

import { useEffect, useState } from 'react';

export default function MarketTickerWidget() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        // 예시: 브라우저 다크모드 감지
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setTheme(darkModeMediaQuery.matches ? 'dark' : 'light');

        const handler = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? 'dark' : 'light');
        };
        darkModeMediaQuery.addEventListener('change', handler);
        return () => darkModeMediaQuery.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-tickers.js';
        script.async = true;
        script.type = 'text/javascript';
        script.text = JSON.stringify({
            symbols: [
                { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500 Index' },
                { proName: 'NASDAQ:NDX', title: 'NASDAQ 100' },
                { proName: 'KRX:KOSDAQ', title: 'KOSDAQ' },
                { proName: 'KRX:KOSPI', title: 'KOSPI' },
            ],
            isTransparent: false,
            showSymbolLogo: true,
            colorTheme: theme,  // 다크 또는 라이트로 동적 변경
            locale: 'kr',
        });

        const container = document.getElementById('tradingview-ticker-widget');
        if (container) {
            container.innerHTML = '';
            container.appendChild(script);
        }
    }, [theme]);

    return (
        <div
            className={`tradingview-widget-container w-full max-w-4xl mx-auto rounded-md shadow-md p-4 ${
                theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-black'
            }`}
        >
            <div id="tradingview-ticker-widget" className="tradingview-widget-container__widget" />
        </div>
    );
}
