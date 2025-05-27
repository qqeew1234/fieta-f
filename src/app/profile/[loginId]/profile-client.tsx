'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { updateProfile, updateProfileImage, changePassword } from './actions';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Switch } from '@/src/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Camera, Pencil, Star } from 'lucide-react';
import LogoutButton from '@/src/components/ui/LogoutButton';
import { getSubscribedEtfIds } from '@/src/app/etf/[id]/action';
import Link from 'next/link';
import { fetchEtfDetail } from '@/src/lib/api/etf';
import { UserDetailResponse } from '@/src/lib/api/auth';

export default function ProfileClient({
  initialProfileData,
  loginId,
}: {
  initialProfileData: UserDetailResponse | null;
  loginId: string;
}) {
  // 상태 관리
  const [createdAt] = useState(initialProfileData?.createdAt || '');
  const [nickname, setNickname] = useState(initialProfileData?.nickname || '');
  const [userId, setUserId] = useState(initialProfileData?.loginId || '');
  const [isPublicPortfolio, setIsPublicPortfolio] = useState(
    !initialProfileData?.isLikePrivate
  );
  const [avatarSrc, setAvatarSrc] = useState(
    initialProfileData?.imageUrl || '/placeholder.svg'
  );
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [subscribedEtfIds, setSubscribedEtfIds] = useState<number[]>([]); // 구독한 ETF ID 목록
  const [etfDetails, setEtfDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubscribedEtfs = async () => {
      const subscribedIds = await getSubscribedEtfIds(); // 구독한 ETF ID 목록을 가져옵니다.
      setSubscribedEtfIds(subscribedIds); // 구독한 ETF ID 목록 상태에 저장

      // 구독한 ETF의 상세 정보를 가져오는 로직 (예: ETF 이름, 티커 등)
      if (subscribedIds.length > 0) {
        const etfs = await Promise.all(
          subscribedIds.map(async (id) => {
            const { data, error } = await fetchEtfDetail(id);
            if (error || !data) {
              console.error(`ETF ID ${id} 불러오기 실패:`, error);
              return null;
            }
            return {
              id: data.etfId,
              name: data.etfName,
              ticker: data.etfCode,
            };
          })
        );
        setEtfDetails(etfs.filter((etf) => etf !== null)); // 유효한 ETF들만 필터링하여 세부 정보 저장
      }
    };

    fetchSubscribedEtfs(); // 데이터 로드
  }, []);

  // 프로필 사진 변경 처리
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('images', file);

    const result = await updateProfileImage(formData); // 서버 액션 호출
    if (result.success) {
      setAvatarSrc(result.imageUrl!);
      alert('프로필 사진이 성공적으로 업데이트되었습니다.');
    } else {
      alert('업로드 실패: ' + result.message);
    }
  };

  // 정보 수정 처리
  const handleProfileUpdate = async () => {
    if (
      nickname === initialProfileData?.nickname &&
      isPublicPortfolio === !initialProfileData?.isLikePrivate
    ) {
      setMessage('업데이트할 내용이 없습니다.');
      return;
    }
    try {
      setIsLoading(true);
      setMessage('');

      const result = await updateProfile(loginId, nickname, !isPublicPortfolio);

      if (result.success && result.data) {
        setMessage('프로필 정보가 업데이트되었습니다.');
        setNickname(result.data.nickname || '');
        setIsPublicPortfolio(!result.data.isLikePrivate);
      } else {
        setMessage(result.message || '업데이트 실패');
      }
    } catch (err) {
      console.error('업데이트 처리 오류:', err);
      setMessage('서버 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경 처리
  const handlePasswordChange = async () => {
    if (!currentPassword) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!newPassword) {
      alert('새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    const result = await changePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (result.success) {
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setIsPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert('비밀번호 변경 실패: ' + result.message);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">내 프로필</h1>
        <p className="text-slate-500">계정 정보 및 투자 내역을 관리하세요.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              {/* 프로필 사진 업로드 기능 */}
              <div className="relative group">
                <Avatar
                  className="h-24 w-24 cursor-pointer group-hover:opacity-80 transition-opacity"
                  onClick={handleAvatarClick}
                >
                  <AvatarImage
                    src={avatarSrc || '/placeholder.svg'}
                    alt="프로필 이미지"
                    className="h-full w-full object-cover object-center"
                  />
                  <AvatarFallback>사용자</AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleAvatarClick}
                >
                  <div className="bg-black bg-opacity-50 rounded-full p-2">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-bold">{nickname}</h2>
                  <button
                    className="text-slate-500 hover:text-slate-700"
                    onClick={() =>
                      document.getElementById('nickname-input')?.focus()
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-500">@{userId}</p>{' '}
                {/* 이메일 대신 아이디 표시 */}
              </div>
              <div className="w-full pt-4">
                <div className="flex justify-between py-2 border-b"></div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">가입 일시</span>
                  <span>
                    {createdAt
                      ? new Date(createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">투자 성향</span>
                  <span>성장형</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">관심 테마</span>
                  <span>기술, 에너지</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <Tabs defaultValue="account">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">계정 정보</TabsTrigger>
                <TabsTrigger value="comments">댓글 목록</TabsTrigger>
                <TabsTrigger value="subscribe">구독 내역</TabsTrigger>
              </TabsList>
              <TabsContent value="subscribe" className="space-y-4 mt-4">
                <div className="mt-4">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    {subscribedEtfIds.length === 0 ? (
                      <p className="text-gray-600">구독한 ETF가 없습니다.</p>
                    ) : (
                      <ul className="space-y-4">
                        {etfDetails.map((etf, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition duration-200"
                          >
                            <div>
                              <Link
                                href={`/etf/${etf.id}`}
                                className="text-xl font-semibold text-gray-800"
                              >
                                {etf.name}
                                <p className="text-gray-600">{etf.ticker}</p>
                              </Link>
                            </div>
                            <div className="text-yellow-500">
                              <Star className="h-6 w-6" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="account" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="nickname-input">닉네임</Label>
                  <Input
                    id="nickname-input"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-id">아이디</Label>{' '}
                  {/* 이메일 대신 아이디로 변경 */}
                  <Input
                    id="user-id"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-slate-500">
                    아이디는 변경할 수 없습니다.
                  </p>
                </div>

                {/* ETF 내역 공개 여부 설정 */}
                <div className="flex items-center justify-between space-x-2 pt-2">
                  <Label htmlFor="portfolio-public">ETF , 댓글 내역 공개</Label>
                  <Switch
                    id="portfolio-public"
                    checked={isPublicPortfolio}
                    onCheckedChange={setIsPublicPortfolio}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {isPublicPortfolio
                    ? '다른 사용자가 내 ETF , 댓글 내역을 볼 수 있습니다.'
                    : '내 ETF , 댓글 내역은 비공개로 설정되어 있습니다.'}
                </p>

                <Button onClick={handleProfileUpdate} disabled={isLoading}>
                  정보 수정
                </Button>

                {message && (
                  <p
                    className={`mt-2 text-sm ${
                      message.includes('실패')
                        ? 'text-red-500'
                        : 'text-green-500'
                    }`}
                  >
                    {message}
                  </p>
                )}

                {/* 비밀번호 변경 다이얼로그 */}
                <div className="pt-4 border-t mt-4">
                  <h3 className="text-lg font-medium mb-2">비밀번호 변경</h3>
                  <Dialog
                    open={isPasswordDialogOpen}
                    onOpenChange={setIsPasswordDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">비밀번호 변경</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>비밀번호 변경</DialogTitle>
                        <DialogDescription>
                          현재 비밀번호를 입력하고 새 비밀번호를 설정하세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="current-password">
                            현재 비밀번호
                          </Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-password">새 비밀번호</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirm-password">
                            비밀번호 확인
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsPasswordDialogOpen(false)}
                        >
                          취소
                        </Button>
                        <Button onClick={handlePasswordChange}>변경하기</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                {/* 로그아웃 버튼 */}
                <div className="pt-4 border-t mt-4">
                  <LogoutButton />
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
