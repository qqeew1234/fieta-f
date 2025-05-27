import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Slider } from "@/src/components/ui/slider"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">맞춤형 ETF 추천</h1>
        <p className="text-slate-500">투자 성향과 목표에 맞는 ETF를 추천해 드립니다.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>투자 성향 분석</CardTitle>
            <CardDescription>나에게 맞는 ETF를 추천받기 위한 정보를 입력해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>투자 목표</Label>
              <RadioGroup defaultValue="growth">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">안정적인 수익 (배당 중심)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="growth" id="growth" />
                  <Label htmlFor="growth">자산 성장 (성장주 중심)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced">균형 잡힌 포트폴리오</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>투자 기간</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="투자 기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">단기 (1년 미만)</SelectItem>
                  <SelectItem value="medium">중기 (1-3년)</SelectItem>
                  <SelectItem value="long">장기 (3년 이상)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>위험 감수 정도</Label>
                <span className="text-sm text-slate-500">중간</span>
              </div>
              <Slider defaultValue={[50]} max={100} step={1} />
              <div className="flex justify-between text-xs text-slate-500">
                <span>안전 추구</span>
                <span>위험 감수</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>관심 테마</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="관심 테마 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">기술</SelectItem>
                  <SelectItem value="finance">금융</SelectItem>
                  <SelectItem value="healthcare">헬스케어</SelectItem>
                  <SelectItem value="consumer">소비재</SelectItem>
                  <SelectItem value="energy">에너지</SelectItem>
                  <SelectItem value="global">글로벌</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">맞춤 ETF 추천받기</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>인기 추천 ETF</CardTitle>
            <CardDescription>많은 사용자들이 선택한 인기 ETF입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">KODEX 삼성전자</h3>
                  <span className="text-green-600 font-bold">+28.5%</span>
                </div>
                <p className="text-sm text-slate-500 mb-2">기술 섹터 대표 ETF</p>
                <div className="flex justify-between text-sm">
                  <span>현재가: 82,500원</span>
                  <span className="text-green-600">+2.1%</span>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">TIGER 2차전지</h3>
                  <span className="text-green-600 font-bold">+25.7%</span>
                </div>
                <p className="text-sm text-slate-500 mb-2">배터리 및 에너지 저장 테마</p>
                <div className="flex justify-between text-sm">
                  <span>현재가: 42,300원</span>
                  <span className="text-green-600">+1.8%</span>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">TIGER 미국나스닥100</h3>
                  <span className="text-green-600 font-bold">+20.8%</span>
                </div>
                <p className="text-sm text-slate-500 mb-2">글로벌 기술주 중심 ETF</p>
                <div className="flex justify-between text-sm">
                  <span>현재가: 21,500원</span>
                  <span className="text-green-600">+0.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
