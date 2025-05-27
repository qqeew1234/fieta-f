import ProfileClient from './profile-client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchUserProfile } from '@/src/lib/api/auth';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ loginId: string }>;
}) {
  // 라우트 파라미터에서 loginId 추출
  const { loginId } = await params;

  // 서버에서 쿠키 가져오기
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  if (!loginId || !accessToken) {
    redirect('/login');
  }

  // 서버에서 초기 프로필 데이터 가져오기
  let initialProfileData = null;
  if (accessToken) {
    const { data, error } = await fetchUserProfile(loginId, accessToken);

    if (error || !data) {
      console.error('프로필 데이터 불러오기 실패:', error);
    } else {
      initialProfileData = data;
    }
  }

  // 클라이언트 컴포넌트에 데이터 전달
  return (
    <ProfileClient initialProfileData={initialProfileData} loginId={loginId} />
  );
}
