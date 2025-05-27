// app/api/history/[symbol]/route.ts
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { subDays, subMonths, format } from 'date-fns';

type RangeKey = '7d' | '30d' | '3mo' | '6mo' | '1y';

function calcOpts(rng: RangeKey) {
    const end = new Date();
    let start: Date;
    switch (rng) {
        case '7d':  start = subDays(end, 7);   break;
        case '30d': start = subDays(end, 30);  break;
        case '3mo': start = subMonths(end, 3);break;
        case '6mo': start = subMonths(end, 6);break;
        case '1y':  start = subMonths(end, 12);break;
        default:    start = subDays(end, 30);
    }
    return {
        period1: format(start, 'yyyy-MM-dd'),
        period2: format(end,   'yyyy-MM-dd'),
        interval: '1d' as const,
    };
}

export async function GET(request: Request, { params }: { params: { symbol: string } }) {
    const { symbol } = params;  // ex: "069500.KS"
    const rng = (new URL(request.url)).searchParams.get('range') as RangeKey || '30d';

    try {
        const opts = calcOpts(rng);
        const raw  = await yahooFinance.historical(symbol, opts);
        const data = raw.map(e => ({
            date:  format((e.date as Date), 'yyyy-MM-dd'),
            close: e.close as number,
        }));
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
