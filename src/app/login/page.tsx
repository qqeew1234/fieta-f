"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { login } from "./actions"
import { Button } from "@/src/components/ui/button"
import { Input }  from "@/src/components/ui/input"
import { Label }  from "@/src/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card"

export default function LoginPage() {
  const [loginId, setLoginId]       = useState("")
  const [password, setPassword]     = useState("")
  const [isLoading, setIsLoading]   = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginId || !password) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.")
      return
    }

    setIsLoading(true)
    setErrorMessage("")
    try {
      await login(loginId, password)
      router.push("/")
    } catch (err: any) {
      // NEXT_REDIRECT 에러면 아무것도 안 하고 리턴 (Next.js가 실제로는 redirect 처리)
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        return
      }
      // 그 외 에러만 콘솔에 찍고 화면에 보여줌
      console.error(err)
      setErrorMessage(err.message || "로그인 처리 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="container mx-auto flex items-center justify-center min-h-screen py-8 px-4">
        <Card className="w-full max-w-md">
          <form onSubmit={handleLogin} className="space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl">로그인</CardTitle>
              <CardDescription>계정에 로그인하여 맞춤형 ETF 추천을 받아보세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginId">아이디</Label>
                <Input
                    id="loginId"
                    type="text"
                    placeholder="아이디를 입력하세요"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errorMessage && (
                  <div className="text-red-500 text-sm">{errorMessage}</div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
              <div className="text-center text-sm">
                계정이 없으신가요?{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                  회원가입
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}
