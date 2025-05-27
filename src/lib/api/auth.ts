import { FetchResult, httpPost, httpGet } from '../http/client';

export interface LoginRequest {
  loginId: string;
  password: string;
  role: string;
}

export interface RegisterRequest {
  loginId: string;
  password: string;
  nickname: string;
  isLikePrivate: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: number;
  loginId: string;
  nickname: string;
  imageUrl: string;
  isLikePrivate: boolean;
}

export interface UserDetailResponse {
  id: number;
  loginId: string;
  nickname: string;
  imageUrl: string;
  isLikePrivate: boolean;
  createdAt: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * 로그인 처리를 합니다.
 */
export async function login(
  credentials: LoginRequest
): Promise<FetchResult<LoginResponse>> {
  return httpPost('/api/v1/login', credentials, {
    errorMessage: '로그인에 실패했습니다',
  });
}

/**
 * 회원가입 처리를 합니다.
 */
export async function register(
  userData: RegisterRequest
): Promise<FetchResult<UserResponse>> {
  return httpPost('/api/v1/join', userData, {
    errorMessage: '회원가입에 실패했습니다',
  });
}

/**
 * 사용자 정보를 가져옵니다.
 */
export async function fetchUserProfile(
  loginId: string,
  accessToken?: string
): Promise<FetchResult<UserDetailResponse>> {
  return httpGet(`/api/v1/users/${loginId}`, {
    errorMessage: '사용자 정보를 불러오는 데 실패했습니다',
    authToken: accessToken,
  });
}

/**
 * 토큰을 갱신합니다.
 */
export async function refreshToken(): Promise<
  FetchResult<RefreshTokenResponse>
> {
  return httpPost(
    '/api/v1/refresh',
    {},
    {
      errorMessage: '토큰 갱신에 실패했습니다',
    }
  );
}
