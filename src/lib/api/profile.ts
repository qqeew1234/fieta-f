import { FetchResult, httpPost, httpGet, httpPatch } from '../http/client';

export interface ProfileUpdateRequest {
  nickname: string;
  isLikePrivate: boolean;
}

export interface ProfileResponse {
  id: number;
  nickname: string;
  isLikePrivate: boolean;
  profileImageUrl?: string;
  loginId: string;
}

export interface PasswordChangeRequest {
  existingPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ImageUploadResponse {
  imageUrl: string;
}

/**
 * 프로필을 업데이트합니다.
 */
export async function updateUserProfile(
  userData: ProfileUpdateRequest,
  accessToken: string
): Promise<FetchResult<ProfileResponse>> {
  return httpPatch('/api/v1/users', userData, {
    errorMessage: '프로필 업데이트에 실패했습니다',
    authToken: accessToken,
  });
}

/**
 * 프로필 이미지를 업로드합니다.
 * @param formData 업로드할 이미지 데이터
 * @param accessToken 사용자 인증 토큰
 */
export async function uploadProfileImage(
  formData: FormData,
  accessToken: string
): Promise<FetchResult<ImageUploadResponse>> {
  return httpPatch('/api/v1/users/image', formData, {
    errorMessage: '이미지 업로드에 실패했습니다',
    authToken: accessToken,
  });
}

/**
 * 비밀번호를 변경합니다.
 * @param passwordData 비밀번호 변경 데이터
 * @param accessToken 사용자 인증 토큰
 */
export async function changeUserPassword(
  passwordData: PasswordChangeRequest,
  accessToken: string
): Promise<FetchResult<void>> {
  return httpPatch('/api/v1/users/me/password', passwordData, {
    errorMessage: '비밀번호 변경에 실패했습니다',
    authToken: accessToken,
  });
}
