"use client"

import { type FC, useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
import "chartjs-adapter-date-fns"
Chart.register(...registerables)

type RangeKey = "7d" | "30d" | "3mo" | "6mo" | "1y"
interface HistoryData {
    date: string
    close: number
}
interface Props {
    initialSymbol: string
}

const ranges: { key: RangeKey; label: string }[] = [
    { key: "7d", label: "7일" },
    { key: "30d", label: "30일" },
    { key: "3mo", label: "3개월" },
    { key: "6mo", label: "6개월" },
    { key: "1y", label: "1년" },
]

const StockHistoryChart: FC<Props> = ({ initialSymbol }) => {
    const [symbol] = useState(initialSymbol)
    const [range, setRange] = useState<RangeKey>("30d")
    const [loading, setLoading] = useState(true)
    const [hasData, setHasData] = useState(true)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const chartRef = useRef<Chart | null>(null)
    const chartDataRef = useRef<HistoryData[]>([])

    // 차트 생성 또는 업데이트 함수
    const updateChart = (data: HistoryData[]) => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return

        const grad = ctx.createLinearGradient(0, 0, 0, 300)
        grad.addColorStop(0, "rgba(58,123,213,1)")
        grad.addColorStop(1, "rgba(0,210,255,0.3)")

        // 차트가 이미 존재하면 데이터만 업데이트
        if (chartRef.current) {
            chartRef.current.data.labels = data.map((d) => d.date)
            chartRef.current.data.datasets[0].data = data.map((d) => d.close)
            chartRef.current.update("none") // 애니메이션 없이 업데이트하여 깜빡임 방지
        } else {
            // 차트가 없으면 새로 생성
            chartRef.current = new Chart(ctx, {
                type: "line",
                data: {
                    labels: data.map((d) => d.date),
                    datasets: [
                        {
                            label: symbol,
                            data: data.map((d) => d.close),
                            borderColor: grad,
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.3,
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0, // 초기 렌더링 시 애니메이션 비활성화
                    },
                    scales: {
                        x: {
                            type: "time",
                            time: { parser: "yyyy-MM-dd", unit: "day", displayFormats: { day: "MM-dd" } },
                            grid: { display: false },
                        },
                        y: {
                            beginAtZero: false,
                            grid: {
                                drawBorder: false,
                            },
                        },
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: "index",
                            intersect: false,
                        },
                    },
                },
            })
        }
    }

    useEffect(() => {
        let isMounted = true

        const load = async () => {
            if (!canvasRef.current) return

            setLoading(true)

            try {
                const res = await fetch(`/api/stock/${symbol}?range=${range}`)
                if (!res.ok) {
                    console.error(`Error fetching data: ${res.status}`)
                    if (isMounted) {
                        setHasData(false)
                        setLoading(false)
                    }
                    return
                }

                const data: HistoryData[] = await res.json()

                if (!isMounted) return

                if (!data.length) {
                    console.info("No data available for the selected range")
                    setHasData(false)
                    setLoading(false)
                    return
                }

                chartDataRef.current = data
                setHasData(true)
                updateChart(data)
                setLoading(false)
            } catch (error) {
                console.error("Failed to load stock history data:", error)
                if (isMounted) {
                    setHasData(false)
                    setLoading(false)
                }
            }
        }

        load()

        return () => {
            isMounted = false
        }
    }, [symbol, range])

    // 컴포넌트 언마운트 시 차트 정리
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy()
                chartRef.current = null
            }
        }
    }, [])

    return (
        <Card className="w-full h-full">
            <CardContent className="p-4 h-full flex flex-col">
                <div className="grid grid-cols-5 gap-2 mb-4">
                    {ranges.map((r) => (
                        <button
                            key={r.key}
                            onClick={() => setRange(r.key)}
                            className={`
        w-full px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 
        ${
                                range === r.key
                                    ? "bg-blue-500 text-white shadow-md hover:bg-blue-600 transform hover:-translate-y-0.5"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
                            }
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
      `}
                            disabled={loading}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 w-full min-h-[300px] relative">
                    <div
                        className={`absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-30 backdrop-blur-sm z-10 transition-opacity duration-300 ${
                            loading ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <div className="px-4 py-2 rounded-md bg-white bg-opacity-50 shadow-sm text-gray-600 flex items-center gap-2">
                            <svg
                                className="animate-spin h-4 w-4 text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span>로딩 중...</span>
                        </div>
                    </div>

                    <div
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                            !loading && !hasData ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <div className="text-gray-500">데이터가 없습니다</div>
                    </div>

                    <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
                </div>
            </CardContent>
        </Card>
    )
}

export default StockHistoryChart
