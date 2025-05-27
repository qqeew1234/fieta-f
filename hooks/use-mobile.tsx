"use client"

import { useEffect, useState } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 초기 체크
    checkIfMobile()

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", checkIfMobile)

    // 클린업
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return isMobile
}
