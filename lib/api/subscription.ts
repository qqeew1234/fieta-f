import { FetchResult, httpGet, httpPost, httpDelete } from '../http/client';

export interface SubscriptionResponse {
  id: number;
  dtfId: string;
  createdAt: string;
  expiredAt: string;
}

export interface UnsubscribeResponse {
  etfId: number;
}

export interface SubscriptionsListResponse {
  totalPage: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  subscribeResponseList: SubscriptionResponse[];
}

/**
 * 특정 ETF를 구독합니다.
 */
export async function subscribeToEtf(
  etfId: number,
  accessToken: string
): Promise<FetchResult<SubscriptionResponse>> {
  return httpPost(
    `/api/v1/etfs/${etfId}/subscription`,
    {},
    {
      authToken: accessToken,
      errorMessage: 'ETF 구독에 실패했습니다',
    }
  );
}

/**
 * 특정 ETF 구독을 취소합니다.
 */
export async function unsubscribeFromEtf(
  etfId: number,
  accessToken: string
): Promise<FetchResult<UnsubscribeResponse>> {
  return httpDelete(`/api/v1/etfs/${etfId}/subscription`, {
    authToken: accessToken,
    errorMessage: 'ETF 구독 취소에 실패했습니다',
  });
}

/**
 * 사용자가 구독한 모든 ETF ID 목록을 가져옵니다.
 */
export async function fetchSubscribedEtfs(
  accessToken: string
): Promise<FetchResult<SubscriptionsListResponse>> {
  return httpGet('/api/v1/etfs/subscribes', {
    authToken: accessToken,
    errorMessage: '구독 정보를 불러오는 데 실패했습니다',
  });
}
