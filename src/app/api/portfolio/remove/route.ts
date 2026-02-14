
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export const dynamic = 'force-dynamic'

const USER_ID = 1

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { stockId } = body

        if (!stockId) {
            return NextResponse.json({ error: 'Missing stockId' }, { status: 400 })
        }

        const portfolio = await db.portfolio.findUnique({ where: { userId: USER_ID } })
        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
        }

        await db.holding.delete({
            where: {
                portfolioId_stockId: {
                    portfolioId: portfolio.id,
                    stockId: Number(stockId)
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error removing holding:', error)
        return NextResponse.json({ error: 'Failed to remove holding' }, { status: 500 })
    }
}
