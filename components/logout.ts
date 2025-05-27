'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete('accessToken');
  cookieStore.delete('login_id');
  cookieStore.delete('refreshToken');

  redirect('/'); // 메인 페이지로 이동
}
