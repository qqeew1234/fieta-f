import { FetchResult, httpPost } from '@/lib/http/client';

interface userAnswer {
  question: string;
  answer: string;
}

interface EtfDetail {
  etfId: number;
  etfName: string | null;
  weeklyReturn: number | null;
}

interface Recommendation {
  mainRecommendation: string;
  subRecommendations: string[];
  reason: string;
}

export interface ApiResponse {
  status: string;
  recommendation: Recommendation;
  etfs: EtfDetail[];
}

export async function aiChat(prompt: string): Promise<FetchResult<string>> {
  const res = await httpPost('/api/v1/chat', prompt, {
    errorMessage: '채팅 전송에 실패했습니다.',
  });

  let answer = '';

  if (res.data && typeof res.data === 'object') {
    answer = Object.values(res.data)[0] as string;
  } else if (typeof res.data === 'string') {
    answer = res.data;
  }

  return { ...res, data: answer };
}

export async function aiRecommend(
  userAnswerList: userAnswer[]
): Promise<FetchResult<ApiResponse>> {
  return httpPost('/api/v1/recommendation', userAnswerList, {
    errorMessage: '추천 전송에 실패했습니다.',
  });
}
