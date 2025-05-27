'use client';

import React, {useEffect, useState} from 'react';
import {Button} from '@/src/components/ui/button'; // Button 컴포넌트 임포트
import {Card, CardHeader, CardContent} from '@/src/components/ui/card';
import {Progress} from '@/src/components/ui/progress';
import Link from 'next/link';
import {aiRecommend} from '@/src/lib/api/ai'; // Card 컴포넌트 임포트
import type {ApiResponse} from '@/src/lib/api/ai'; // ApiResponse 타입 임포트

const EtfSurvey = () => {
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [recommendationResult, setRecommendationResult] =
        useState<ApiResponse | null>(null);
    const [isAutoMove, setIsAutoMove] = useState(false);

    const questions = {
        1: {
            question: '왜 투자하려고 하나요?',
            options: {
                가: '노후 대비를 위해 투자하고 싶다',
                나: '짧게 사고팔아 이익을 얻고 싶다',
                다: '매달 나오는 배당을 받고 싶다',
                라: '자녀 교육비를 마련하고 싶다',
                마: '비상금처럼 보유하고 싶다',
            },
        },
        2: {
            question: '얼마나 오래 넣어둘 계획인가요?',
            options: {
                가: '6개월 이하로 투자할 계획이다',
                나: '6개월에서 1년 정도 투자할 계획이다',
                다: '1년에서 3년 정도 투자할 계획이다',
                라: '3년에서 5년 정도 투자할 계획이다',
                마: '5년 이상 장기 투자할 계획이다',
            },
        },
        3: {
            question: '얼마를 투자할 수 있나요?',
            options: {
                가: '투자 금액은 1천만 원 미만이다',
                나: '투자 금액은 1천만 ~ 3천만 원이다',
                다: '투자 금액은 3천만 ~ 5천만 원이다',
                라: '투자 금액은 5천만 ~ 1억 원이다',
                마: '투자 금액은 1억 원 이상이다',
            },
        },
        4: {
            question: '가격이 오르내릴 때 기분이 어떤가요?',
            options: {
                가: '가격 변동에 거의 신경 쓰지 않는다',
                나: '가격 변동이 조금 걱정된다',
                다: '가격 변동에 대해 보통이다',
                라: '가격 변동에 좀 불안해한다',
                마: '가격 변동에 많이 불안해한다',
            },
        },
        5: {
            question: '투자해 본 경험이 있나요?',
            options: {
                가: '투자 경험이 전혀 없다',
                나: '투자 경험이 1년 미만이다',
                다: '투자 경험이 1~3년이다',
                라: '투자 경험이 3~5년이다',
                마: '투자 경험이 5년 이상이다',
            },
        },
        6: {
            question: '연 수익을 어느 정도 기대하나요?',
            options: {
                가: '연 수익 기대는 0~3%이다',
                나: '연 수익 기대는 3~5%이다',
                다: '연 수익 기대는 5~8%이다',
                라: '연 수익 기대는 8~12%이다',
                마: '연 수익 기대는 12% 이상이다',
            },
        },
        7: {
            question: '어떤 종류 ETF를 원하나요?',
            options: {
                가: '주식 위주 ETF를 선호한다',
                나: '채권 위주 ETF를 선호한다',
                다: '주식과 채권이 섞인 ETF를 선호한다',
                라: '금, 은 같은 원자재 ETF를 선호한다',
                마: '부동산 리츠 ETF를 선호한다',
            },
        },
        8: {
            question: '어느 나라나 분야에 관심 있나요?',
            options: {
                가: '국내 ETF에 관심이 있다',
                나: '미국 및 선진국 ETF에 관심이 있다',
                다: '신흥국 ETF에 관심이 있다',
                라: 'IT, 헬스케어 산업 ETF에 관심이 있다',
                마: '친환경, 테마형 ETF에 관심이 있다',
            },
        },
        9: {
            question: '착한 투자(환경·사회)에 관심이 어느 정도인가요?',
            options: {
                가: '착한 투자에는 전혀 관심이 없다',
                나: '착한 투자에 조금 관심이 있다',
                다: '착한 투자에 보통 관심이 있다',
                라: '착한 투자에 꽤 관심이 있다',
                마: '착한 투자를 꼭 하고 싶다',
            },
        },
        10: {
            question: '언제든 사고팔고 싶은가요, 오래 두고 싶은가요?',
            options: {
                가: '자주 사고팔고 싶다',
                나: '한 달에 한 번 정도 사고팔고 싶다',
                다: '세 달에 한 번 정도 사고팔고 싶다',
                라: '여섯 달에 한 번 정도 사고팔고 싶다',
                마: '일 년에 한 번 이하로 사고팔고 싶다',
            },
        },
    };

    const totalQuestions = Object.keys(questions).length;
    const progressValue = (currentQuestion / totalQuestions) * 100;

    const toUserAnswerDTOList = () => {
        return Object.entries(answers).map(([question, answer]) => ({
            question,
            answer,
        }));
    };

    const handleNextQuestion = () => {
        if (!answers[currentQuestion]) {
            alert('답변을 선택해주세요!');
            return;
        }
        setCurrentQuestion(currentQuestion + 1);
    };

    const handleAnswerChange = (questionNumber: number, answer: string) => {
        setAnswers({...answers, [questionNumber]: answer});
        setIsAutoMove(true);
    };

    const handlePreviousQuestion = () => {
        setCurrentQuestion(currentQuestion - 1);
    };

    const handleSubmit = async () => {
        if (!answers[currentQuestion]) {
            alert('답변을 선택해주세요!');
            return;
        }
        console.log('설문 결과:', answers);
        alert('설문이 완료되었습니다!');

        const userAnswers = toUserAnswerDTOList();
        const {data, error} = await aiRecommend(userAnswers);
        setRecommendationResult(data);
        if (error || !data) {
            alert('추천 실패: ' + (error || '알 수 없는 오류'));
            return;
        }
    };

    useEffect(() => {
        // 이전 질문에서 답변을 바꾼 경우(뒤로 갔다가 답변 수정)
        if (
            isAutoMove &&
            answers[currentQuestion] &&
            currentQuestion < Object.keys(questions).length
        ) {
            setTimeout(() => {
                setCurrentQuestion(currentQuestion + 1);
                setIsAutoMove(false);
            }, 150);
            return;
        }
    }, [answers[currentQuestion]]);

    const currentQuestionData =
        questions[currentQuestion as keyof typeof questions];

    if (recommendationResult) {
        const {recommendation, etfs} = recommendationResult;

        return (
            <div
                className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="w-full max-w-screen-md py-12 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-6">ETF 추천 결과</h1>

                    <div className="mb-6 p-4 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <div className="text-lg font-semibold mb-2">
                            주 추천 테마:{' '}
                            <span className="text-blue-600 dark:text-blue-400">
              {recommendation.mainRecommendation}
            </span>
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold">추천 사유:</span>{' '}
                            {recommendation.reason}
                        </div>
                        {recommendation.subRecommendations.length > 0 && (
                            <div>
                                <span className="font-semibold">서브 추천 테마:</span>{' '}
                                {recommendation.subRecommendations.join(', ')}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center items-start gap-6">
                        {/* 서브 추천 ETF (왼쪽) */}
                        {etfs[1] && (
                            <div
                                className="border p-3 rounded w-64 bg-white dark:bg-gray-800 dark:border-gray-700 shadow text-center">
                                <Link href={`/etf/${etfs[1].etfId}`}>
                                    <div
                                        className="font-medium">{etfs[1].etfName} ({recommendation.subRecommendations[0]})
                                    </div>
                                </Link>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">
                                    수익률: {etfs[1].weeklyReturn}%
                                </div>
                                <div className="mt-2 text-xs text-blue-400 dark:text-blue-300">서브 추천</div>
                            </div>
                        )}

                        {/* 메인 추천 ETF (가운데) */}
                        <div
                            className="border-2 border-blue-500 p-4 rounded w-72 bg-blue-50 dark:bg-blue-900 shadow-lg text-center scale-110">
                            <Link href={`/etf/${etfs[0].etfId}`}>
                                <div className="font-bold text-lg text-blue-600 dark:text-blue-300">
                                    {etfs[0].etfName} ({recommendation.mainRecommendation})
                                </div>
                            </Link>
                            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                                수익률: {etfs[0].weeklyReturn}%
                            </div>
                            <div className="mt-3 text-sm font-semibold text-blue-700 dark:text-blue-400">
                                메인 추천
                            </div>
                        </div>

                        {/* 서브 추천 ETF (오른쪽) */}
                        {etfs[2] && (
                            <div
                                className="border p-3 rounded w-64 bg-white dark:bg-gray-800 dark:border-gray-700 shadow text-center">
                                <Link href={`/etf/${etfs[2].etfId}`}>
                                    <div
                                        className="font-medium">{etfs[2].etfName} ({recommendation.subRecommendations[1]})
                                    </div>
                                </Link>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">
                                    수익률: {etfs[2].weeklyReturn}%
                                </div>
                                <div className="mt-2 text-xs text-blue-400 dark:text-blue-300">서브 추천</div>
                            </div>
                        )}
                    </div>

                    <Button
                        className="mt-6 dark:bg-gray-700 dark:text-gray-100"
                        onClick={() => window.location.reload()}
                    >
                        다시 설문하기
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-full max-w-screen-md py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    AI ETF 추천 설문조사
                </h1>

                <Card className="mb-8 shadow-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            {currentQuestionData.question}
                        </h2>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-6">
                            {Object.entries(currentQuestionData.options).map(([key, value]) => (
                                <label
                                    key={key}
                                    className="flex items-center space-x-3 cursor-pointer select-none"
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion}`}
                                        value={key}
                                        checked={answers[currentQuestion] === key}
                                        onChange={() => handleAnswerChange(currentQuestion, key)}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-lg font-medium leading-none text-gray-900 dark:text-gray-100">
            {value}
          </span>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>


                <div className="flex justify-between">
                    {currentQuestion > 1 && (
                        <Button variant="secondary" onClick={handlePreviousQuestion}>
                            이전
                        </Button>
                    )}
                    {currentQuestion < Object.keys(questions).length ? (
                        <Button
                            onClick={handleNextQuestion}
                            disabled={!answers[currentQuestion]}
                        >
                            다음
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={!answers[currentQuestion]}>
                            제출
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EtfSurvey;
