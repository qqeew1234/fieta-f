'use client'

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

interface ETFChartProps {
  data: {
    labels: string[]
    values: number[]
  }
  title: string
  color?: string
}

export function ETFChart({ data, title, color = "#22c55e" }: ETFChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // 다크모드 감지
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkQuery.matches)
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkQuery.addEventListener('change', handler)
    return () => darkQuery.removeEventListener('change', handler)
  }, [])

  const drawChart = () => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40

    // 배경
    ctx.fillStyle = isDarkMode ? "#0f172a" : "white" // 다크모드 배경색
    ctx.fillRect(0, 0, width, height)

    // min max 값 계산
    const maxValue = Math.max(...data.values) * 1.1
    const minValue = Math.min(...data.values) * 0.9

    // 그리드 색상
    ctx.strokeStyle = isDarkMode ? "#334155" : "#e2e8f0"
    ctx.lineWidth = 0.5

    // 세로 그리드
    const xStep = (width - 2 * padding) / (data.labels.length - 1)
    ctx.beginPath()
    for (let i = 0; i < data.labels.length; i++) {
      const x = padding + i * xStep
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
    }

    // 가로 그리드
    const yStep = (height - 2 * padding) / 4
    for (let i = 0; i <= 4; i++) {
      const y = height - padding - i * yStep
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
    }
    ctx.stroke()

    // 축 그리기
    ctx.beginPath()
    ctx.strokeStyle = isDarkMode ? "#64748b" : "#94a3b8"
    ctx.lineWidth = 1
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // 라벨 글씨
    ctx.fillStyle = isDarkMode ? "#94a3b8" : "#64748b"
    ctx.font = "12px sans-serif"

    // X축 라벨
    ctx.textAlign = "center"
    data.labels.forEach((label, i) => {
      const x = padding + i * xStep
      ctx.fillText(label, x, height - padding + 20)
    })

    // Y축 라벨
    ctx.textAlign = "right"
    for (let i = 0; i <= 4; i++) {
      const y = height - padding - i * yStep
      const value = minValue + (i / 4) * (maxValue - minValue)
      ctx.fillText(value.toFixed(0), padding - 10, y + 5)
    }

    // 줌 적용
    const zoomedWidth = (width - 2 * padding) * zoom
    const zoomedXStep = zoomedWidth / (data.values.length - 1)

    // 선 그리기
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 3

    data.values.forEach((value, i) => {
      const x = padding + i * zoomedXStep
      const normalizedValue = (value - minValue) / (maxValue - minValue)
      const y = height - padding - normalizedValue * (height - 2 * padding)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // 선 아래 영역
    ctx.lineTo(padding + (data.values.length - 1) * zoomedXStep, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fillStyle = `${color}20`
    ctx.fill()

    // 포인트 그리기
    data.values.forEach((value, i) => {
      const x = padding + i * zoomedXStep
      const normalizedValue = (value - minValue) / (maxValue - minValue)
      const y = height - padding - normalizedValue * (height - 2 * padding)

      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = isDarkMode ? "#0f172a" : "white"
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // 툴팁 (마우스 무브)
    canvasRef.current.onmousemove = (e) => {
      const rect = canvasRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 포인트 근처 체크
      for (let i = 0; i < data.values.length; i++) {
        const pointX = padding + i * zoomedXStep
        const normalizedValue = (data.values[i] - minValue) / (maxValue - minValue)
        const pointY = height - padding - normalizedValue * (height - 2 * padding)

        const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2))
        if (distance < 10) {
          ctx.clearRect(0, 0, width, height)
          drawChart()

          ctx.fillStyle = isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"
          ctx.beginPath()
          ctx.roundRect(pointX - 60, pointY - 40, 120, 30, 5)
          ctx.fill()

          ctx.fillStyle = isDarkMode ? "#0f172a" : "white"
          ctx.textAlign = "center"
          ctx.fillText(`${data.labels[i]}: ${data.values[i].toLocaleString()}원`, pointX, pointY - 20)
          break
        }
      }
    }
  }

  useEffect(() => {
    drawChart()
  }, [data, color, zoom, isDarkMode])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1))
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setZoom(1)
      drawChart()
      setIsLoading(false)
    }, 500)
  }

  return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 1}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto" />
        </CardContent>
      </Card>
  )
}
