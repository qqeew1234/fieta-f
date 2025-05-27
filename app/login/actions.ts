'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { login as apiLogin } from '@/lib/api/auth';

export async function login(loginId: string, password: string) {
  const { data, error } = await apiLogin({
    loginId,
    password,
    role: 'USER',
  });

  if (error || !data) {
    throw new Error(error || '로그인 실패');
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: 'accessToken',
    value: data.accessToken,
    httpOnly: true,
    path: '/',
  });
  if (data.refreshToken) {
    cookieStore.set({
      name: 'refreshToken',
      value: data.refreshToken,
      httpOnly: true,
      path: '/',
    });
  }
  cookieStore.set('login_id', loginId, { path: '/' });

  redirect('/'); // 성공 시 리다이렉트
}
