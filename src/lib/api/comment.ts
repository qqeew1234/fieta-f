import {
  FetchResult,
  httpPost,
  httpGet,
  httpDelete,
  httpPatch,
  httpPut,
} from '../http/client';

export interface CreateCommentRequest {
  etfId: number;
  content: string;
}

export interface CommentUpdateRequest {
  content: string;
}
export interface CommentResponse {
  id: number;
  userId: number;
  imageUrl: string;
  nickName: string;
  content: string;
  likesCount: number;
  createdAt: string;
}

export interface CommentsPageList {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  etfId: number;
  commentResponses: CommentResponse[];
}
/**
 * 댓글을 작성합니다.
 */
export async function createComment(
  commentData: CreateCommentRequest,
  accessToken: string
): Promise<FetchResult<CommentResponse>> {
  return httpPost('/api/v1/comments', commentData, {
    errorMessage: '댓글 작성에 실패했습니다',
    authToken: accessToken,
  });
}
/**
 * 특정 ETF에 대한 댓글을 가져옵니다.
 */
export async function getComments(
  etfId: number,
  options: {
    page?: number;
    size?: number;
  }
): Promise<FetchResult<CommentsPageList>> {
  const { page = 0, size = 20 } = options;

  return httpGet('/api/v1/comments', {
    params: {
      etf_id: etfId,
      page,
      size,
    },
    errorMessage: '댓글 불러오기 실패',
  });
}
/**
 * 댓글을 수정합니다.
 */
export async function updateComment(
  commentId: number,
  commentData: CommentUpdateRequest,
  accessToken: string
): Promise<FetchResult<CommentResponse>> {
  return httpPatch(`/api/v1/comments/${commentId}`, commentData, {
    errorMessage: '댓글 수정에 실패했습니다',
    authToken: accessToken,
  });
}

/**
 * 댓글을 삭제합니다.
 */
export async function deleteComment(
  commentId: number,
  accessToken: string
): Promise<FetchResult<void>> {
  return httpDelete(`/api/v1/comments/${commentId}`, {
    errorMessage:
      '댓글 삭제에 실패했습니다.한 번 작성 후 최소 5초 뒤에 다시 작성 가능합니다.',
    authToken: accessToken,
  });
}
