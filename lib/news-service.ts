"use server"

// 뉴스 데이터 타입 정의
type NewsItem = {
  id: number
  title: string
  summary: string
  content: string
  url: string
  source: string
  date: string
  category: string
  imageUrl: string
}

// 실제 환경에서는 외부 API나 웹 크롤링을 통해 뉴스 데이터를 가져옵니다.
// 여기서는 예시 데이터를 사용합니다.
export async function fetchEconomicNews(): Promise<NewsItem[]> {
  // 실제 구현에서는 여기에 외부 API 호출 또는 웹 크롤링 코드가 들어갑니다.
  // 예: const response = await fetch('https://some-news-api.com/economic-news')

  // 예시 데이터
  const mockNews: NewsItem[] = [
    {
      id: 1,
      title: "미 연준, 기준금리 동결 결정...파월 '인플레이션 우려 여전'",
      summary:
        "미국 연방준비제도(Fed)가 기준금리를 현 수준에서 동결하기로 결정했습니다. 제롬 파월 의장은 인플레이션 우려가 여전하다고 밝혔습니다.",
      content:
        "미국 연방준비제도(Fed)가 기준금리를 현 수준에서 동결하기로 결정했습니다. 제롬 파월 의장은 인플레이션 우려가 여전하다고 밝혔습니다. 이번 결정으로 미국 기준금리는 5.25~5.50% 수준을 유지하게 됐습니다.",
      url: "https://www.example.com/news/1",
      source: "경제신문",
      date: "2023-05-15",
      category: "시장동향",
      imageUrl: "/placeholder.svg?height=160&width=320&text=연준",
    },
    {
      id: 2,
      title: "삼성전자, 1분기 영업이익 6조원...전년 대비 95% 증가",
      summary: "삼성전자가 올해 1분기 영업이익 6조원을 기록했습니다. 이는 전년 동기 대비 95% 증가한 수치입니다.",
      content:
        "삼성전자가 올해 1분기 영업이익 6조원을 기록했습니다. 이는 전년 동기 대비 95% 증가한 수치입니다. 반도체 부문의 실적 개선이 주요 원인으로 분석됩니다.",
      url: "https://www.example.com/news/2",
      source: "IT경제",
      date: "2023-05-14",
      category: "시장동향",
      imageUrl: "/placeholder.svg?height=160&width=320&text=삼성전자",
    },
    {
      id: 3,
      title: "KODEX 2차전지 ETF, 연초 대비 수익률 30% 돌파",
      summary:
        "KODEX 2차전지 ETF가 연초 대비 수익률 30%를 돌파했습니다. 2차전지 관련 기업들의 실적 호조가 주요 원인입니다.",
      content:
        "KODEX 2차전지 ETF가 연초 대비 수익률 30%를 돌파했습니다. 2차전지 관련 기업들의 실적 호조가 주요 원인입니다. 전기차 시장의 성장과 함께 2차전지 산업에 대한 투자자들의 관심이 높아지고 있습니다.",
      url: "https://www.example.com/news/3",
      source: "ETF투자",
      date: "2023-05-13",
      category: "ETF",
      imageUrl: "/placeholder.svg?height=160&width=320&text=2차전지",
    },
    {
      id: 4,
      title: "미국 나스닥 ETF, 기술주 강세에 수혜...연초 대비 20% 상승",
      summary:
        "미국 나스닥 ETF가 기술주 강세에 힘입어 연초 대비 20% 상승했습니다. AI 관련 기업들의 주가 상승이 주요 원인입니다.",
      content:
        "미국 나스닥 ETF가 기술주 강세에 힘입어 연초 대비 20% 상승했습니다. AI 관련 기업들의 주가 상승이 주요 원인입니다. 특히 엔비디아, 마이크로소프트 등 AI 관련 기업들의 실적 호조가 나스닥 지수 상승을 이끌었습니다.",
      url: "https://www.example.com/news/4",
      source: "글로벌마켓",
      date: "2023-05-12",
      category: "ETF",
      imageUrl: "/placeholder.svg?height=160&width=320&text=나스닥",
    },
    {
      id: 5,
      title: "한국은행, 기준금리 동결...경기 회복세 지켜본다",
      summary:
        "한국은행이 기준금리를 현 수준에서 동결하기로 결정했습니다. 경기 회복세를 지켜보며 추가 조치를 검토할 예정입니다.",
      content:
        "한국은행이 기준금리를 현 수준에서 동결하기로 결정했습니다. 경기 회복세를 지켜보며 추가 조치를 검토할 예정입니다. 한국은행 총재는 인플레이션 압력이 완화되고 있으나 여전히 주의가 필요하다고 밝혔습니다.",
      url: "https://www.example.com/news/5",
      source: "경제신문",
      date: "2023-05-11",
      category: "경제일반",
      imageUrl: "/placeholder.svg?height=160&width=320&text=한국은행",
    },
    {
      id: 6,
      title: "중국 경제 성장률 5.2% 기록...예상치 상회",
      summary: "중국의 1분기 경제 성장률이 5.2%를 기록했습니다. 이는 시장 예상치인 4.8%를 상회하는 수치입니다.",
      content:
        "중국의 1분기 경제 성장률이 5.2%를 기록했습니다. 이는 시장 예상치인 4.8%를 상회하는 수치입니다. 소비 회복과 수출 증가가 경제 성장을 이끈 것으로 분석됩니다.",
      url: "https://www.example.com/news/6",
      source: "글로벌경제",
      date: "2023-05-10",
      category: "글로벌",
      imageUrl: "/placeholder.svg?height=160&width=320&text=중국경제",
    },
    {
      id: 7,
      title: "TIGER 헬스케어 ETF, 제약주 강세에 수혜...월간 5% 상승",
      summary:
        "TIGER 헬스케어 ETF가 제약주 강세에 힘입어 월간 5% 상승했습니다. 바이오 기업들의 신약 개발 소식이 주가 상승을 이끌었습니다.",
      content:
        "TIGER 헬스케어 ETF가 제약주 강세에 힘입어 월간 5% 상승했습니다. 바이오 기업들의 신약 개발 소식이 주가 상승을 이끌었습니다. 특히 삼성바이오로직스, 셀트리온 등 대형 바이오 기업들의 실적 개선이 ETF 수익률에 긍정적인 영향을 미쳤습니다.",
      url: "https://www.example.com/news/7",
      source: "ETF투자",
      date: "2023-05-09",
      category: "ETF",
      imageUrl: "/placeholder.svg?height=160&width=320&text=헬스케어",
    },
    {
      id: 8,
      title: "원/달러 환율 1,320원 돌파...수출 기업 수혜 전망",
      summary: "원/달러 환율이 1,320원을 돌파했습니다. 이에 따라 수출 기업들의 실적 개선이 기대됩니다.",
      content:
        "원/달러 환율이 1,320원을 돌파했습니다. 이에 따라 수출 기업들의 실적 개선이 기대됩니다. 특히 IT, 자동차 등 주요 수출 산업의 기업들이 환율 상승의 수혜를 받을 것으로 전망됩니다.",
      url: "https://www.example.com/news/8",
      source: "경제신문",
      date: "2023-05-08",
      category: "시장동향",
      imageUrl: "/placeholder.svg?height=160&width=320&text=환율",
    },
    {
      id: 9,
      title: "유럽중앙은행, 기준금리 인상...인플레이션 대응",
      summary: "유럽중앙은행(ECB)이 기준금리를 0.25%p 인상했습니다. 인플레이션에 대응하기 위한 조치입니다.",
      content:
        "유럽중앙은행(ECB)이 기준금리를 0.25%p 인상했습니다. 인플레이션에 대응하기 위한 조치입니다. ECB 총재는 물가 안정을 위해 필요한 모든 조치를 취할 것이라고 밝혔습니다.",
      url: "https://www.example.com/news/9",
      source: "글로벌경제",
      date: "2023-05-07",
      category: "글로벌",
      imageUrl: "/placeholder.svg?height=160&width=320&text=ECB",
    },
    {
      id: 10,
      title: "KODEX 배당성장 ETF, 배당주 선호 현상에 수혜...연초 대비 15% 상승",
      summary:
        "KODEX 배당성장 ETF가 배당주 선호 현상에 힘입어 연초 대비 15% 상승했습니다. 금리 인상 환경에서 안정적인 배당을 제공하는 기업들에 대한 관심이 높아지고 있습니다.",
      content:
        "KODEX 배당성장 ETF가 배당주 선호 현상에 힘입어 연초 대비 15% 상승했습니다. 금리 인상 환경에서 안정적인 배당을 제공하는 기업들에 대한 관심이 높아지고 있습니다. 특히 금융, 유틸리티 등 전통적인 배당주들의 실적이 ETF 수익률에 긍정적인 영향을 미쳤습니다.",
      url: "https://www.example.com/news/10",
      source: "ETF투자",
      date: "2023-05-06",
      category: "ETF",
      imageUrl: "/placeholder.svg?height=160&width=320&text=배당ETF",
    },
    {
      id: 11,
      title: "국내 소비자물가지수 3.3% 상승...전월 대비 완화",
      summary: "4월 국내 소비자물가지수가 전년 동월 대비 3.3% 상승했습니다. 이는 전월의 3.5%보다 완화된 수치입니다.",
      content:
        "4월 국내 소비자물가지수가 전년 동월 대비 3.3% 상승했습니다. 이는 전월의 3.5%보다 완화된 수치입니다. 에너지 가격 안정과 식료품 가격 상승세 둔화가 물가 상승률 완화에 기여했습니다.",
      url: "https://www.example.com/news/11",
      source: "경제신문",
      date: "2023-05-05",
      category: "경제일반",
      imageUrl: "/placeholder.svg?height=160&width=320&text=물가지수",
    },
    {
      id: 12,
      title: "미국 실업률 3.4% 기록...50년 만에 최저치",
      summary: "미국의 4월 실업률이 3.4%를 기록했습니다. 이는 50년 만에 최저치로, 노동시장의 견조함을 보여줍니다.",
      content:
        "미국의 4월 실업률이 3.4%를 기록했습니다. 이는 50년 만에 최저치로, 노동시장의 견조함을 보여줍니다. 비농업 부문 일자리는 25만 개 증가했으며, 시간당 평균 임금은 전년 대비 4.4% 상승했습니다.",
      url: "https://www.example.com/news/12",
      source: "글로벌경제",
      date: "2023-05-04",
      category: "글로벌",
      imageUrl: "/placeholder.svg?height=160&width=320&text=미국실업률",
    },
    {
      id: 13,
      title: "TIGER 차이나 ETF, 중국 경기 회복에 베팅...투자자 관심 증가",
      summary:
        "TIGER 차이나 ETF가 중국 경기 회복에 베팅하는 투자자들의 관심을 받고 있습니다. 중국의 경제 성장률 상향 조정이 투자 심리에 긍정적인 영향을 미쳤습니다.",
      content:
        "TIGER 차이나 ETF가 중국 경기 회복에 베팅하는 투자자들의 관심을 받고 있습니다. 중국의 경제 성장률 상향 조정이 투자 심리에 긍정적인 영향을 미쳤습니다. 특히 중국 정부의 경기 부양 정책과 소비 회복이 중국 주식시장에 호재로 작용하고 있습니다.",
      url: "https://www.example.com/news/13",
      source: "ETF투자",
      date: "2023-05-03",
      category: "ETF",
      imageUrl: "/placeholder.svg?height=160&width=320&text=차이나ETF",
    },
    {
      id: 14,
      title: "국내 수출 3개월 연속 감소...반도체 부진 영향",
      summary: "4월 국내 수출이 전년 동월 대비 2.5% 감소했습니다. 이로써 수출은 3개월 연속 감소세를 보였습니다.",
      content:
        "4월 국내 수출이 전년 동월 대비 2.5% 감소했습니다. 이로써 수출은 3개월 연속 감소세를 보였습니다. 반도체 수출 부진이 주요 원인으로, 반도체 수출은 전년 동월 대비 15% 감소했습니다.",
      url: "https://www.example.com/news/14",
      source: "경제신문",
      date: "2023-05-02",
      category: "경제일반",
      imageUrl: "/placeholder.svg?height=160&width=320&text=수출감소",
    },
    {
      id: 15,
      title: "일본 중앙은행, 초완화 통화정책 유지...엔화 약세 지속",
      summary: "일본 중앙은행이 초완화 통화정책을 유지하기로 결정했습니다. 이에 따라 엔화 약세가 지속될 전망입니다.",
      content:
        "일본 중앙은행이 초완화 통화정책을 유지하기로 결정했습니다. 이에 따라 엔화 약세가 지속될 전망입니다. 일본 중앙은행 총재는 인플레이션 목표 2%를 달성하기 위해 현재의 통화정책을 유지할 필요가 있다고 밝혔습니다.",
      url: "https://www.example.com/news/15",
      source: "글로벌경제",
      date: "2023-05-01",
      category: "글로벌",
      imageUrl: "/placeholder.svg?height=160&width=320&text=일본은행",
    },
  ]

  return mockNews
}
