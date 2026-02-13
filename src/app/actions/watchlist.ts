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

    revalidatePath('/')
    revalidatePath(`/stock/${stockId}`) // Revalidate by ID or find symbol
}
