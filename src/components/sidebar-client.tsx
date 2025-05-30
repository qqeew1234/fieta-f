"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Home, TrendingUp, User, LogIn, UserPlus, Star, Menu, X, Newspaper } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"
import { useMobile } from "@/src/hooks/use-mobile"

interface SidebarClientProps {
  loginId: string
}

const themeCategories = [
  { id: "AI_DATA", name: "AI 데이터" },
  { id: "USA", name: "미국" },
  { id: "KOREA", name: "한국" },
  { id: "REITS", name: "리츠" },
  { id: "MULTI_ASSET", name: "멀티에셋" },
  { id: "COMMODITIES", name: "원자재" },
  { id: "HIGH_RISK", name: "고위험" },
  { id: "SECTOR", name: "섹터" },
  { id: "DIVIDEND", name: "배당" },
  { id: "ESG", name: "ESG" },
  { id: "GOLD", name: "금" },
  { id: "GOVERNMENT_BOND", name: "국채" },
  { id: "CORPORATE_BOND", name: "회사채" },
  { id: "DEFENSE", name: "방위산업" },
  { id: "SEMICONDUCTOR", name: "반도체" },
  { id: "BIO", name: "바이오" },
  { id: "EMERGING_MARKETS", name: "신흥시장" },
]

export default function SidebarClient({ loginId }: SidebarClientProps) {
  const [showThemes, setShowThemes] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
      <>
        {isMobile && (
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 text-slate-900 dark:text-white" onClick={toggleSidebar}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
        )}

        <div
            className={cn(
                "w-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out",
                "bg-gray-50 text-slate-900",            // 여기서 bg-white -> bg-gray-50 으로 변경
                "dark:bg-slate-900 dark:text-white",
                isMobile && (isOpen ? "fixed left-0 top-0 z-40" : "fixed -left-64 top-0 z-40"),
            )}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-bold">FIETA</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">AI ETF 추천 서비스</p>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link
                    href="/public"
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800",
                        "text-slate-900 dark:text-white"
                    )}
                >
                  <Home className="h-5 w-5" />
                  <span>홈</span>
                </Link>
              </li>

              <li>
                <div
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={() => setShowThemes(!showThemes)}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>테마별 ETF</span>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 transition-transform", showThemes && "rotate-90")} />
                </div>

                {showThemes && (
                    <ul className="ml-6 mt-2 space-y-1 border-l-2 border-slate-300 dark:border-slate-700 pl-2">
                      {themeCategories.map((theme) => (
                          <li key={theme.id}>
                            <Link
                                href={`/themes/${theme.id}`}
                                className="block p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              {theme.name}
                            </Link>
                          </li>
                      ))}
                    </ul>
                )}
              </li>



              <li>
                <Link
                    href="/news"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <Newspaper className="h-5 w-5" />
                  <span>경제 뉴스</span>
                </Link>
              </li>

              <li>
                <Link
                    href={loginId ? `/profile/${loginId}` : "/login"}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <User className="h-5 w-5" />
                  <span>내 프로필</span>
                </Link>
              </li>

              <li>
                <Link
                    href="/my-etf"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <Star className="h-5 w-5" />
                  <span>AI ETF 추천</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <Button
                  variant="outline"
                  className="flex-1 bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  asChild
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  로그인
                </Link>
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                <Link href="/register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  가입
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
  )
}
