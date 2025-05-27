import { useEffect, useRef } from "react";

export default function TradingViewWidget() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 기존 차트 제거
        if (container.current) {
            container.current.innerHTML = ""; // 차트 및 script 태그 정리
        }

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
      {
        "autosize": true,
        "symbol": "NASDAQ:AAPL",
        "interval": "1",
        "timezone": "Asia/Seoul",
        "theme": "light",
        "style": "1",
        "locale": "kr",
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com"
      }`;

        if (container.current) {
            container.current.appendChild(script);
        }

        // cleanup 함수로 차트 제거
        return () => {
            if (container.current) {
                container.current.innerHTML = "";
            }
        };
    }, []);

    return (
        <div
            className="tradingview-widget-container"
            ref={container}
            style={{ height: "100%", width: "100%" }}
        >
            <div
                className="tradingview-widget-container__widget"
                style={{ height: "calc(100% - 32px)", width: "100%" }}
            ></div>
            <div className="tradingview-widget-copyright">
                <a
                    href="https://kr.tradingview.com/"
                    rel="noopener nofollow"
                    target="_blank"
                >
                    <span className="blue-text">트레이딩뷰에서 모든 시장 추적</span>
                </a>
            </div>
        </div>
    );
}
