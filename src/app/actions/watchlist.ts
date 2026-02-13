'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function toggleWatchlist(stockId: number) {
    // Use default user ID 1 for now
    const userId = 1

    const existing = await db.watchlist.findUnique({
        where: {
            userId_stockId: {
                userId,
                stockId,
            },
        },
    })

    if (existing) {
        await db.watchlist.delete({
            where: {
                id: existing.id,
            },
        })
    } else {
        await db.watchlist.create({
            data: {
                userId,
                stockId,
            },
        })
    }

    // Revalidate paths
    revalidatePath('/')

    // We need the symbol to revalidate the stock detail page
    const stock = await db.stock.findUnique({
        where: { id: stockId },
        select: { symbol: true }
    })

    if (stock) {
        revalidatePath(`/stock/${stock.symbol}`)
    }
}
