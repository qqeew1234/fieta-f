'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';

// UI Components (assuming these paths are correct in your project)
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/ui/select';

// Icons from lucide-react
import {
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
} from 'lucide-react';

// Custom Components
import MarketTickerWidget from '@/src/components/MarketTickerWidget';
import EnhancedSearchDropdown from '@/src/components/enhanced-search-dropdown';
import { EtfRankingTable } from '@/src/components/etf-ranking-table'; // Assuming this component exists

// API and Type Definitions
import { fetchAllEtfs } from '@/src/lib/api/etf';
import { type ETF } from '@/src/components/etf-table-body'; // Re-using ETF type for consistency
import { IMessage } from '@stomp/stompjs'; // For WebSocket messages

// Interface for real-time ETF price updates
interface EtfPriceUpdateMessage {
    etfCode: string;
    price: number;
    dayOverDayRate: number;
    volume: number;
}

// Mapping for ETF themes to display names
const themeNameMap: Record<string, string> = {
    AI_DATA: 'AI 데이터',
    USA: '미국',
    KOREA: '한국',
    REITS: '리츠',
    MULTI_ASSET: '멀티에셋',
    COMMODITIES: '원자재',
    HIGH_RISK: '고위험',
    SECTOR: '섹터',
    DIVIDEND: '배당',
    ESG: 'ESG',
    GOLD: '금',
    GOVERNMENT_BOND: '국채',
    CORPORATE_BOND: '회사채',
    DEFENSE: '방위산업',
    SEMICONDUCTOR: '반도체',
    BIO: '바이오',
    EMERGING_MARKETS: '신흥시장',
};

const ITEMS_PER_PAGE = 20; // Number of ETFs to display per page in the ranking table

export default function Home() {
    // State variables for search, filters, sorting, and data management
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('all');
    const [sortKey, setSortKey] = useState('returnRate');
    const [allEtfData, setAllEtfData] = useState<ETF[]>([]);
    const [displayedEtfs, setDisplayedEtfs] = useState<ETF[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Effect to fetch initial ETF data on component mount
    useEffect(() => {
        const fetchInitialEtfsData = async () => {
            setLoading(true);
            try {
                // Fetch a large number of ETFs to simulate having all data locally
                const { data, error } = await fetchAllEtfs({
                    size: 10000,
                    period: 'weekly', // Assuming 'weekly' is a valid period for returnRate
                });

                if (error || !data) {
                    console.error('전체 ETF 로딩 실패', error);
                    setLoading(false);
                    return;
                }

                // Map raw API response to the ETF type for consistency
                const allEtfs: ETF[] = data.etfReadResponseList.map((etf: any, index: number) => ({
                    id: etf.etfId,
                    name: etf.etfName,
                    ticker: etf.etfCode,
                    theme: etf.theme,
                    // Dummy data for price, change, volume as they are often real-time
                    price: 10000 + index * 100,
                    change: Number.parseFloat((Math.random() * 5).toFixed(2)) * (Math.random() > 0.5 ? 1 : -1),
                    volume: Math.floor(Math.random() * 100000),
                    returnRate: etf.returnRate, // Use actual returnRate from API
                }));

                setAllEtfData(allEtfs);
                setLoading(false);
            } catch (error) {
                console.error('전체 ETF 로딩 실패', error);
                setLoading(false);
            }
        };

        fetchInitialEtfsData();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Memoized computation for filtered and sorted ETFs
    const filteredAndSortedEtfs = useMemo(() => {
        let result = [...allEtfData]; // Start with a copy of all data

        // Apply theme filter
        if (selectedTheme !== 'all') {
            result = result.filter((e) => e.theme === selectedTheme);
        }

        // Apply search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (e) =>
                    e.name.toLowerCase().includes(query) ||
                    e.ticker.toLowerCase().includes(query)
            );
        }

        // Apply sorting based on selected key
        result.sort((a, b) => {
            const valueA = a[sortKey as keyof ETF];
            const valueB = b[sortKey as keyof ETF];

            // Handle numeric comparison for numbers
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return valueB - valueA; // Descending for numbers
            }

            // Fallback to string comparison for other types
            return String(valueB).localeCompare(String(valueA)); // Descending for strings
        });

        return result;
    }, [allEtfData, selectedTheme, searchQuery, sortKey]);

    // Effect to update displayed ETFs based on filtered/sorted data and current page
    useEffect(() => {
        const startIndex = 0; // Always start from the beginning for filtering/sorting
        const endIndex = currentPage * ITEMS_PER_PAGE;
        const newDisplayedEtfs = filteredAndSortedEtfs.slice(startIndex, endIndex);

        setDisplayedEtfs(newDisplayedEtfs);
        setHasMore(endIndex < filteredAndSortedEtfs.length); // Check if more items are available
    }, [filteredAndSortedEtfs, currentPage]);

    // Effect to reset page when filters or sort criteria change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTheme, searchQuery, sortKey]);

    // Handler to load more ETFs (for infinite scroll/pagination)
    const handleLoadMore = useCallback(() => {
        if (hasMore && !loading) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [hasMore, loading]);

    // Memoized computation for top gainers and losers
    const sortedByChange = useMemo(() => {
        return allEtfData
            .filter((etf) => typeof etf.change === 'number' && !isNaN(etf.change))
            .slice(); // Create a shallow copy before sorting
    }, [allEtfData]);

    const topGainers = useMemo(() => {
        return sortedByChange.sort((a, b) => b.change - a.change).slice(0, 5);
    }, [sortedByChange]);

    const topLosers = useMemo(() => {
        return sortedByChange.sort((a, b) => a.change - b.change).slice(0, 5);
    }, [sortedByChange]);

    // Memoized computation for top themes based on average return rate
    const topThemes = useMemo(() => {
        const map: Record<string, { total: number; count: number }> = {};

        allEtfData.forEach((etf) => {
            if (!map[etf.theme]) map[etf.theme] = { total: 0, count: 0 };
            if (typeof etf.returnRate === 'number' && !isNaN(etf.returnRate)) {
                map[etf.theme].total += etf.returnRate;
                map[etf.theme].count += 1;
            }
        });

        return Object.entries(map)
            .map(([theme, { total, count }]) => ({
                id: theme,
                name: theme,
                returnRate: count > 0 ? total / count : 0,
                etfCount: count,
            }))
            .sort((a, b) => b.returnRate - a.returnRate)
            .slice(0, 4); // Display top 4 themes
    }, [allEtfData]);

    // Handler for selecting an ETF from the search dropdown
    const handleEtfSelect = useCallback((item: ETF) => {
        setSearchQuery(item.name); // Populate search input with selected ETF's name
    }, []);

    // Callback for real-time price updates (from WebSocket)
    const onPriceUpdate = useCallback((message: IMessage) => {
        try {
            const parsedBody: EtfPriceUpdateMessage = JSON.parse(message.body);
            setAllEtfData((prev) =>
                prev.map((etf) =>
                    etf.ticker === parsedBody.etfCode
                        ? {
                            ...etf,
                            price: parsedBody.price,
                            change: parsedBody.dayOverDayRate,
                            volume: parsedBody.volume,
                        }
                        : etf
                )
            );
        } catch (error) {
            console.error('Failed to parse message body:', error);
        }
    }, []);

    return (
        <div className="container mx-auto py-6 px-4">
            {/* Hero Section */}
            <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">FIETA</h1>
                        <p className="text-xl mb-6">최고의 AI ETF 추천 서비스로 투자 수익을 극대화하세요</p>
                        <div className="flex gap-4">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                <Link href="/recommendations">맞춤 ETF 추천받기</Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white text-slate-900 border-white hover:bg-slate-100"
                            >
                                <Link href="/register">무료 회원가입</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Weekly Top Gainer Card */}
                        <Card className="bg-white/10 border-0">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    주간 최고 수익률 ETF
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {allEtfData.length > 0 ? (() => {
                                    const sortedEtfs = [...allEtfData].sort((a, b) => {
                                        const valA = typeof a.returnRate === 'number' && !isNaN(a.returnRate) ? a.returnRate : -Infinity;
                                        const valB = typeof b.returnRate === 'number' && !isNaN(b.returnRate) ? b.returnRate : -Infinity;
                                        return valB - valA;
                                    });

                                    const topEtf = sortedEtfs[0];
                                    const displayReturnRate = topEtf && typeof topEtf.returnRate === 'number' && !isNaN(topEtf.returnRate)
                                        ? topEtf.returnRate.toFixed(2)
                                        : "0.00";

                                    return (
                                        <>
                                            <div className="text-3xl font-bold text-green-400">
                                                +{displayReturnRate}%
                                            </div>
                                            <p className="text-sm text-white/70">
                                                {topEtf?.name || "데이터 없음"}
                                            </p>
                                        </>
                                    );
                                })() : (
                                    <>
                                        <div className="text-3xl font-bold text-green-400">...</div>
                                        <p className="text-sm text-white/70">데이터 로딩 중</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Weekly Average Return Card */}
                        <Card className="bg-white/10 border-0">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    주간 평균 수익률
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-400">
                                    {allEtfData.length > 0
                                        ? (() => {
                                            const validEtfs = allEtfData.filter(etf => typeof etf.returnRate === 'number' && !isNaN(etf.returnRate));
                                            const sumReturnRate = validEtfs.reduce((sum, etf) => sum + etf.returnRate, 0);
                                            const averageReturnRate = validEtfs.length > 0 ? sumReturnRate / validEtfs.length : 0;
                                            const displayAvgReturn = averageReturnRate.toFixed(2);

                                            if (parseFloat(displayAvgReturn) === 0) {
                                                return `0.00%`;
                                            }

                                            return `${averageReturnRate >= 0 ? '+' : ''}${displayAvgReturn}%`;
                                        })()
                                        : '...'}
                                </div>
                                <p className="text-sm text-white/70">전체 ETF 기준</p>
                            </CardContent>
                        </Card>

                        {/* Market Summary Card */}
                        <Card className="bg-white/10 border-0 col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">시장 요약</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <MarketTickerWidget />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <EnhancedSearchDropdown
                        items={allEtfData}
                        onSelect={handleEtfSelect}
                        placeholder="ETF 이름 또는 종목코드 검색"
                        showRecent={true}
                        className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md"
                    />
                </div>
                <div className="flex gap-2">
                    {/* Theme Filter */}
                    <Select
                        value={selectedTheme}
                        onValueChange={setSelectedTheme}
                    >
                        <SelectTrigger className="w-[180px] bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
                            <SelectValue placeholder="테마 선택" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <SelectItem value="all">전체</SelectItem>
                            {/* Dynamically generate theme options */}
                            {Array.from(new Set(allEtfData.map((etf) => etf.theme))).map((theme) => (
                                <SelectItem key={theme} value={theme}>
                                    {themeNameMap[theme] ?? theme} {/* Use mapped name or raw theme */}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Sort By Selector */}
                    <Select
                        value={sortKey}
                        onValueChange={setSortKey}
                    >
                        <SelectTrigger className="w-[180px] bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
                            <SelectValue placeholder="정렬 기준" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <SelectItem value="returnRate">수익률 순</SelectItem>
                            <SelectItem value="price">가격 순</SelectItem>
                            <SelectItem value="change">등락률 순</SelectItem>
                            <SelectItem value="volume">거래량 순</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filter Button (Currently just an icon, could open a filter dialog) */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Popular Themes Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">인기 테마</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {topThemes.map((theme) => (
                        <Link href={`/themes/${theme.id}`} key={theme.id}>
                            <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {themeNameMap[theme.id] ?? theme.id}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">주간 평균 수익률</p>
                                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                        +{theme.returnRate.toFixed(1)}%
                                    </div>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                        {theme.etfCount}개 ETF
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Top Gainers/Losers Section */}
            <div className="mb-8 grid md:grid-cols-2 gap-6">
                {/* Top Gainers Card */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                            실시간 상승률 상위 ETF
                        </CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">
                            오늘 가장 많이 상승한 ETF
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topGainers.map((etf) => (
                                <Link href={`/etf/${etf.id}`} key={etf.id}>
                                    <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{etf.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-gray-400">
                                                {etf.ticker} | {themeNameMap[etf.theme] ?? etf.theme}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-green-600 font-bold">+{etf.change?.toFixed(2)}%</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {etf.price?.toLocaleString()}원
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Losers Card */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <ArrowDownRight className="h-5 w-5 text-red-600" />
                            실시간 하락률 상위 ETF
                        </CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">
                            오늘 가장 많이 하락한 ETF
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topLosers.map((etf) => (
                                <Link href={`/etf/${etf.id}`} key={etf.id}>
                                    <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{etf.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-gray-400">
                                                {etf.ticker} | {themeNameMap[etf.theme] ?? etf.theme}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-red-600 font-bold">{etf.change?.toFixed(2)}%</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {etf.price?.toLocaleString()}원
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ETF Ranking Table Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ETF 수익 랭킹</h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        전체 {filteredAndSortedEtfs.length}개 중 {displayedEtfs.length}개 표시
                    </div>
                </div>
                <EtfRankingTable
                    filteredEtfs={displayedEtfs}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    onPriceUpdate={onPriceUpdate}
                    loading={loading} // Pass loading state to table
                />
            </div>
        </div>
    );
}