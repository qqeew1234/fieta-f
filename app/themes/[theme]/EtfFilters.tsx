'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface EtfFiltersProps {
    theme: string
    initialKeyword?: string
}

export default function EtfFilters({
                                       theme,
                                       initialKeyword = '',
                                   }: EtfFiltersProps) {
    const [keyword, setKeyword] = useState(initialKeyword)
    const router = useRouter()

    // 검색 처리
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/themes/${theme}?page=1&keyword=${encodeURIComponent(keyword)}`)
    }

    return (
        <div>
            {/* 검색 폼 */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="ETF 이름으로 검색"
                    className="px-4 py-2 border rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit">검색</Button>
            </form>
        </div>
    )
}