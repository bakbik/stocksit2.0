
import { NextResponse } from 'next/server'
import db from '@/lib/db'
import seedData from '../../../../prisma/seed_data.json'
import stockGroups from '../../../../prisma/stock_groups.json'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const stocks = seedData as any[]
        console.log(`Start seeding ${stocks.length} stocks via API...`)

        // 1. Seed Groups
        const groups = Object.keys(stockGroups)
        for (const groupName of groups) {
            await db.stockGroup.upsert({
                where: { name: groupName },
                update: {},
                create: { name: groupName }
            })
        }
        await db.stockGroup.upsert({ where: { name: 'Yeter' }, update: {}, create: { name: 'Yeter' } })


        // 2. Seed Stocks
        for (const stock of stocks) {
            // Upsert Stock
            const createdStock = await db.stock.upsert({
                where: { id: stock.id },
                update: {
                    symbol: stock.symbol,
                    name: stock.name,
                    currentPrice: stock.currentPrice,
                    marketCap: stock.marketCap,
                    peRatio: stock.peRatio,
                    roe: stock.roe,
                },
                create: {
                    id: stock.id,
                    symbol: stock.symbol,
                    name: stock.name,
                    currentPrice: stock.currentPrice,
                    marketCap: stock.marketCap,
                    peRatio: stock.peRatio,
                    roe: stock.roe,
                },
            })

            // 3. Link to Groups
            let assignedGroup = 'Yeter'
            for (const [groupName, symbols] of Object.entries(stockGroups)) {
                if ((symbols as string[]).includes(stock.symbol)) {
                    assignedGroup = groupName
                    break
                }
            }

            // Connect to group
            const groupRecord = await db.stockGroup.findUnique({ where: { name: assignedGroup } })
            if (groupRecord) {
                await db.stock.update({
                    where: { id: createdStock.id },
                    data: { groupId: groupRecord.id }
                })
            }

            // Financials
            for (const fin of stock.financials) {
                const exists = await db.financialRecord.findUnique({
                    where: {
                        stockId_period: {
                            stockId: createdStock.id,
                            period: fin.period
                        }
                    }
                })

                if (!exists) {
                    await db.financialRecord.create({
                        data: {
                            stockId: createdStock.id,
                            period: fin.period,
                            totalBalance: fin.totalBalance,
                            equity: fin.equity,
                            revenue: fin.revenue,
                            netProfit: fin.netProfit
                        }
                    })
                }
            }

            // Returns
            for (const ret of stock.returns) {
                const exists = await db.stockReturn.findUnique({
                    where: {
                        stockId_period: {
                            stockId: createdStock.id,
                            period: ret.period
                        }
                    }
                })

                if (!exists) {
                    await db.stockReturn.create({
                        data: {
                            stockId: createdStock.id,
                            period: ret.period,
                            value: ret.value
                        }
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${stocks.length} stocks and their history on ${process.env.NODE_ENV} database.`
        })
    } catch (error) {
        console.error('Seeding error:', error)
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 })
    }
}
