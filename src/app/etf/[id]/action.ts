'use server';
import { cookies } from 'next/headers';
import {
  subscribeToEtf as apiSubscribeToEtf,
  unsubscribeFromEtf as apiUnsubscribeFromEtf,
  fetchSubscribedEtfs,
} from '@/src/lib/api/subscription';
import {
  createComment,
  CreateCommentRequest,
  deleteComment,
  updateComment,
} from '@/src/lib/api/comment';

export async function subscribeToEtf(etfId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  if (!accessToken) {
    throw new Error('로그인이 필요합니다');
  }

  const { data, error } = await apiSubscribeToEtf(etfId, accessToken);

  if (error) {
    throw new Error(error || '구독 실패');
  }

  return data;
}

export async function unsubscribeFromEtf(etfId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  // 토큰이 없을 경우 에러 처리
  if (!accessToken) {
    throw new Error('로그인이 필요합니다');
  }

  const { data, error } = await apiUnsubscribeFromEtf(etfId, accessToken);

  if (error) {
    throw new Error(error || '구독 취소 실패');
  }

  return data;
}

export async function getSubscribedEtfIds(): Promise<number[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  if (!accessToken) return [];

  const { data, error } = await fetchSubscribedEtfs(accessToken);

  if (error || !data) {
    console.error('구독 정보 불러오기 실패', error);
    return [];
  }

  if (data && Array.isArray(data.subscribeResponseList)) {
    return data.subscribeResponseList.map((s: any) => s.etfId);
  } else {
    console.error('Invalid response format or empty subscribes', data);
    return [];
  }
}

export async function createCommentAction(etfId: number, content: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    throw new Error('로그인이 필요합니다.');
  }

  const commentData: CreateCommentRequest = {
    etfId,
    content,
  };

  return createComment(commentData, accessToken);
}
export async function updateCommentAction(commentId: number, content: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  // 토큰이 없을 경우 에러 처리
  if (!accessToken) {
    throw new Error('로그인이 필요합니다');
  }

  return await updateComment(commentId, { content: content }, accessToken);
}

export async function deleteCommentAction(commentId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  // 토큰이 없을 경우 에러 처리
  if (!accessToken) {
    throw new Error('로그인이 필요합니다');
  }

  return await deleteComment(commentId, accessToken);
}
