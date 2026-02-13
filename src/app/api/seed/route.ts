
import { NextResponse } from 'next/server'
import db from '@/lib/db'
import seedData from '../../../../prisma/seed_data.json'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const stocks = seedData as any[]
        console.log(`Start seeding ${stocks.length} stocks via API...`)

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
