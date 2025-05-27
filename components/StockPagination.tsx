//components/StockPagination.tsx
"use client";

import { useEffect, useState } from "react";

interface PaginationProps {
    size: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ size, onPageChange }: PaginationProps) {
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetch("http://localhost:8080/api/v1/stocks/count")
            .then(res => res.text())
            .then(text => setTotalCount(Number(text)));
    }, []);

    const totalPages = Math.ceil(totalCount / size);

    const handlePrev = () => {
        if (page > 0) {
            setPage(page - 1);
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (page + 1 < totalPages) {
            setPage(page + 1);
            onPageChange(page + 1);
        }
    };

    return (
        <div>
            <button onClick={handlePrev} disabled={page === 0}>이전</button>
            <span>{page + 1} / {totalPages}</span>
            <button onClick={handleNext} disabled={page + 1 >= totalPages}>다음</button>
        </div>
    );
}
