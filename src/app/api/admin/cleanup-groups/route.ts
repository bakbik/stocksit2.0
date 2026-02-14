
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    const report = {
        moved: 0,
        deleted: [] as string[],
        errors: [] as string[]
    }

    const corrections: Record<string, string> = {
        'TA35': 'TA-35',
        'TA90': 'TA-90',
        'TA125': 'TA-125'
    }

    try {
        for (const [badName, correctName] of Object.entries(corrections)) {
            // Find bad group
            const badGroup = await db.stockGroup.findUnique({
                where: { name: badName },
                include: { stocks: true }
            })

            if (!badGroup) continue

            // Find or create correct group
            const correctGroup = await db.stockGroup.upsert({
                where: { name: correctName },
                update: {},
                create: { name: correctName }
            })

            // Move stocks
            for (const stock of badGroup.stocks) {
                // Check if already in correct group
                const isConnected = await db.stock.findFirst({
                    where: {
                        id: stock.id,
                        groups: { some: { id: correctGroup.id } }
                    }
                })

                if (!isConnected) {
                    await db.stock.update({
                        where: { id: stock.id },
                        data: {
                            groups: {
                                connect: { id: correctGroup.id }
                            }
                        }
                    })
                    report.moved++
                }
            }

            // Disconnect all stocks from bad group to allow deletion (if explicit many-to-many table exists, but Prisma handles this usually)
            // actually we can just delete the group and prisma handles the relation table cleanup
            await db.stockGroup.delete({
                where: { id: badGroup.id }
            })
            report.deleted.push(badName)
        }

        return NextResponse.json({
            success: true,
            message: 'Cleanup complete',
            report
        })

    } catch (error) {
        console.error('Cleanup error:', error)
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 })
    }
}
