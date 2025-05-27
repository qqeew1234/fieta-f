'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  updateUserProfile,
  uploadProfileImage,
  changeUserPassword,
} from '@/src/lib/api/profile';

// 프로필 업데이트 서버 액션
export async function updateProfile(
  loginId: string,
  nickname: string,
  isLikePrivate: boolean
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  try {
    const { data, error } = await updateUserProfile(
      {
        nickname: nickname,
        isLikePrivate: isLikePrivate,
      },
      accessToken
    );

    if (error || !data) {
      return {
        success: false,
        message: error || '프로필 업데이트에 실패했습니다',
      };
    }

    // 경로 재검증하여 데이터 새로고침
    revalidatePath(`/profile/${loginId}`);
    return {
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '프로필 업데이트 중 오류가 발생했습니다',
    };
  }
}

export async function updateProfileImage(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  imageUrl?: string;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return { success: false, message: '인증 토큰이 없습니다' };
  }

  const { data, error } = await uploadProfileImage(formData, accessToken);

  if (error || !data) {
    return {
      success: false,
      message: error || '이미지 업로드에 실패했습니다',
    };
  }

  return {
    success: true,
    imageUrl: data.imageUrl,
  };
}

export async function changePassword(
  existingPassword: string,
  newPassword: string,
  confirmNewPassword: string
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return { success: false, message: '인증 토큰이 없습니다.' };
  }

  try {
    const { error } = await changeUserPassword(
      {
        existingPassword,
        newPassword,
        confirmNewPassword,
      },
      accessToken
    );

    if (error) {
      return {
        success: false,
        message: error,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '비밀번호 변경 중 오류가 발생했습니다',
    };
  }
}
