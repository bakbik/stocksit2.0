import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
        return NextResponse.json([])
    }

    try {
        const stocks = await (db as any).stock.findMany({
            where: {
                OR: [
                    { symbol: { contains: query } },
                    { name: { contains: query } }
                ]
            },
            take: 10,
            select: {
                symbol: true,
                name: true
            }
        })

        return NextResponse.json(stocks)
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}
