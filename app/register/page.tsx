'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { register } from '@/lib/api/auth';

export default function RegisterPage() {
  const [loginId, setLoginId] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLikePrivate, setIsLikePrivate] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const { data, error } = await register({
        loginId,
        password,
        nickname,
        isLikePrivate,
      });

      if (error || !data) {
        alert('회원가입 실패: ' + (error || '알 수 없는 오류'));
        return;
      }

      alert('회원가입 성공!');
      router.push('/login');
    } catch (err) {
      console.error('Error:', err);
      alert('서버와 연결 실패');
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            계정을 만들고 맞춤형 ETF 추천을 받아보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">아이디</Label>
            <Input
              id="id"
              type="text"
              placeholder="아이디를 입력하세요"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isLikePrivate"
              name="isLikePrivate"
              className="h-4 w-4"
              checked={isLikePrivate}
              onChange={(e) => setIsLikePrivate(e.target.checked)}
            />
            <label htmlFor="isLikePrivate" className="text-sm">
              내 ETF 목록을 비공개로 설정합니다
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm">
              이용약관 및 개인정보 처리방침에 동의합니다
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" onClick={handleRegister}>
            회원가입
          </Button>
          <div className="text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
