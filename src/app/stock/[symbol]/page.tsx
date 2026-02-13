import db from '@/lib/db'
import { notFound } from 'next/navigation'
import { getStockNews } from '@/lib/news'
import { StockDetailClient } from '@/components/StockDetailClient'

export const dynamic = 'force-dynamic'

export default async function StockPage({
    params,
    searchParams
}: {
    params: Promise<{ symbol: string }>
    searchParams: Promise<{ tab?: string }>
}) {
    const { symbol: rawSymbol } = await params
    const { tab = 'overview' } = await searchParams
    const symbol = decodeURIComponent(rawSymbol)

    const stock = await (db as any).stock.findFirst({
        where: { symbol: symbol },
        include: {
            financials: true,
            returns: true,
            watchlists: {
                where: { userId: 1 }
            },
            groups: true
        }
    })

    if (!stock) notFound()

    const parsePeriod = (p: string) => {
        const [q, y] = p.split('/')
        const year = parseInt(y)
        let quarter = 0
        if (q.startsWith('Q')) quarter = parseInt(q.slice(1))
        else if (q === 'Y') quarter = 5
        return year * 10 + quarter
    }

    const sortedFinancials = [...stock.financials].sort((a, b) => parsePeriod(a.period) - parsePeriod(b.period))
    const news = await getStockNews(symbol, stock.id)

    return (
        <StockDetailClient
            stock={stock}
            news={news}
            tab={tab}
            rawSymbol={rawSymbol}
            sortedFinancials={sortedFinancials}
        />
    )
}
