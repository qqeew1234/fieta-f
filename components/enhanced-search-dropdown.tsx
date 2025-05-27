"use client"

import type React from "react"
import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { Search, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ETF } from "@/components/etf-table-body"
import { useRouter } from "next/navigation"

const RECENT_SEARCHES_KEY = "recent-etf-searches"
const MAX_RECENT_SEARCHES = 5

interface SearchDropdownProps {
    items: ETF[]
    onSelect: (item: ETF) => void
    placeholder?: string
    showRecent?: boolean
    redirectToDetail?: boolean
}

export default function EnhancedSearchDropdown({
                                                   items,
                                                   onSelect,
                                                   placeholder = "검색어를 입력하세요",
                                                   showRecent = false,
                                                   redirectToDetail = true,
                                               }: SearchDropdownProps) {
    const [query, setQuery] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [recentSearches, setRecentSearches] = useState<ETF[]>([])
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (showRecent) {
            try {
                const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
                if (saved) {
                    setRecentSearches(JSON.parse(saved))
                }
            } catch {
                // 무시
            }
        }
    }, [showRecent])

    const saveToRecentSearches = (item: ETF) => {
        if (!showRecent) return

        const updatedRecent = [item, ...recentSearches.filter((i) => i.id !== item.id)].slice(0, MAX_RECENT_SEARCHES)
        setRecentSearches(updatedRecent)
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedRecent))
    }

    const filteredItems = query.trim()
        ? items.filter(
            (item) =>
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.ticker.toLowerCase().includes(query.toLowerCase()),
        )
        : []

    const highlightMatch = (text: string) => {
        if (!query.trim()) return text

        const regex = new RegExp(`(${query})`, "gi")
        const parts = text.split(regex)

        return parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-amber-700 text-white font-medium">
          {part}
        </span>
                ) : (
                    part
                ),
        )
    }

    const handleSelectItem = (item: ETF) => {
        onSelect(item)
        saveToRecentSearches(item)
        setQuery("")
        setIsOpen(false)
        setSelectedIndex(-1)
        if (redirectToDetail) router.push(`/etf/${item.id}`)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const items = query.trim() ? filteredItems : recentSearches

        if (!isOpen || items.length === 0) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            e.preventDefault()
            handleSelectItem(items[selectedIndex])
        } else if (e.key === "Escape") {
            e.preventDefault()
            setIsOpen(false)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const removeRecentSearch = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation()
        const updatedRecent = recentSearches.filter((item) => item.id !== itemId)
        setRecentSearches(updatedRecent)
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedRecent))
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    className="pl-10 pr-10
            bg-white text-gray-900 border border-gray-300 placeholder:text-gray-400 focus-visible:ring-indigo-500
            dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-600"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                        setSelectedIndex(-1)
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6
              text-gray-400 hover:text-gray-700 hover:bg-gray-100
              dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                        onClick={() => {
                            setQuery("")
                            inputRef.current?.focus()
                        }}
                    >
                        <span className="sr-only">지우기</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </Button>
                )}
            </div>

            {isOpen && (
                <div
                    className="
            absolute z-50 mt-1 w-full rounded-md shadow-lg max-h-[350px] overflow-y-auto
            bg-white text-gray-900 border border-gray-300
            dark:bg-gray-800 dark:text-white dark:border-gray-700"
                >
                    {/* 검색 결과 */}
                    {query.trim() ? (
                        filteredItems.length > 0 ? (
                            <div className="py-2">
                                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">검색 결과</div>
                                {filteredItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`px-3 py-2 cursor-pointer flex justify-between items-center
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      ${index === selectedIndex ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                                        onClick={() => handleSelectItem(item)}
                                    >
                                        <div>
                                            <div className="font-medium">{highlightMatch(item.name)}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                <span>{highlightMatch(item.ticker)}</span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                                                >
                                                    {item.theme}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {/*
                                            <div
                                                className={`font-medium ${
                                                    item.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                }`}
                                            >
                                                {item.change >= 0 ? "+" : ""}
                                                {item.change}%
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{item.price.toLocaleString()}원</div>
                                            */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">검색 결과가 없습니다</div>
                        )
                    ) : showRecent && recentSearches.length > 0 ? (
                        <div className="py-2">
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                최근 검색
                            </div>
                            {recentSearches.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`px-3 py-2 cursor-pointer flex justify-between items-center
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${index === selectedIndex ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                                    onClick={() => handleSelectItem(item)}
                                >
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <span>{item.ticker}</span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                                            >
                                                {item.theme}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {/*
                                        <div className="text-right mr-2">
                                            <div
                                                className={`font-medium ${
                                                    item.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                }`}
                                            >
                                                {item.change >= 0 ? "+" : ""}
                                                {item.change}%
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{item.price.toLocaleString()}원</div>
                                        </div>
                                        */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-50 hover:opacity-100 text-gray-600 dark:text-gray-400 hover:text-white hover:bg-gray-700"
                                            onClick={(e) => removeRecentSearch(e, item.id)}
                                        >
                                            <span className="sr-only">최근 검색어 삭제</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
