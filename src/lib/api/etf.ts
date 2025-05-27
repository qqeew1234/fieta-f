import { IMessage } from '@stomp/stompjs';
import { FetchResult, httpDelete, httpGet, httpPost } from '../http/client';

export interface EtfResponse {
  totalPage: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  etfReadResponseList: EtfReturnDto[];
}

export interface EtfReturnDto {
  etfId: number;
  etfName: string;
  etfCode: string;
  theme: string;
  returnRate: number;
}

export interface EtfAllResponse {
  totalCount: number;
  etfReadResponseList: EtfReturnDto[];
}

export interface EtfDetailResponse {
  etfId: number;
  etfName: string;
  etfCode: string;
  companyName: string;
  listingDate: string;
}

export interface WatchPriceRequest {
  etfCodes: string[];
}

export interface WatchResponse {
  watchId: string;
}

/**
 * 모든 ETF 데이터를 가져옵니다.
 */
export async function fetchEtfs(options?: {
  page?: number;
  size?: number;
  period?: string;
  theme?: string;
  keyword?: string;
}): Promise<FetchResult<EtfResponse>> {
  const {
    page = 1,
    size = 20,
    period = 'weekly',
    theme,
    keyword,
  } = options || {};

  return httpGet('/api/v1/etfs', {
    params: {
      page,
      size,
      period,
      theme,
      keyword: keyword && encodeURIComponent(keyword),
    },
    errorMessage: 'ETF 데이터를 불러오는 데 실패했습니다',
  });
}

//페이징없는 etf 검색
export async function fetchAllEtfs(options?: {
  theme?: string;
  keyword?: string;
}): Promise<FetchResult<EtfAllResponse>> {
  const { theme, keyword } = options || {};

  return httpGet('/api/v1/etfs/search', {
    params: {
      theme,
      keyword: keyword && encodeURIComponent(keyword),
    },
    errorMessage: 'ETF 검색에 실패했습니다.',
  });
}

/**
 * 단일 ETF 상세 정보를 가져옵니다.
 */
export async function fetchEtfDetail(
  etfId: number
): Promise<FetchResult<EtfDetailResponse>> {
  return httpGet(`/api/v1/etfs/${etfId}`, {
    errorMessage: 'ETF 상세 정보를 불러오는 데 실패했습니다',
  });
}

async function watchRealtimePrices(
  body: WatchPriceRequest
): Promise<FetchResult<WatchResponse>> {
  return httpPost('/api/v1/etfs/realtime-prices', body);
}

export async function setupEtfPriceMonitoring(
  etfCodes: string[],
  subscribe: (topic: string, callback: (message: any) => void) => void,
  onPriceUpdate: (message: IMessage) => void
) {
  const { data, error } = await watchRealtimePrices({ etfCodes });
  if (data === null || error) {
    throw new Error('watchId를 받아오는 데 실패했습니다');
  }

  // 각 ETF 코드에 대해 웹소켓 구독 설정
  etfCodes.forEach((etfCode) => {
    subscribe(`/topic/etf/${etfCode}/price`, (message) => {
      if (onPriceUpdate) {
        onPriceUpdate(message);
      }
    });
  });

  return data.watchId;
}

async function unwatchRealtimePrices(watchId: string) {
  return httpDelete(`/api/v1/etfs/realtime-prices/${watchId}`);
}

export async function cleanupEtfPriceMonitoring(
  watchId: string,
  etfCodes: string[],
  unsubscribe: (topic: string) => void
) {
  // 백엔드에 실시간 가격 모니터링 중단 요청
  await unwatchRealtimePrices(watchId);

  // 각 ETF 코드에 대한 웹소켓 구독 해제
  etfCodes.forEach((etfCode) => {
    unsubscribe(`/etf/${etfCode}/price`);
  });
}
