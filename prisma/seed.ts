import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    try {
        const dataPath = path.join(__dirname, 'seed_data.json')
        const rawData = fs.readFileSync(dataPath, 'utf-8')
        const stocks = JSON.parse(rawData)

        console.log(`Start seeding ${stocks.length} stocks...`)

        for (const stock of stocks) {
            // Upsert Stock
            const createdStock = await prisma.stock.upsert({
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
                // Check if exists
                const exists = await prisma.financialRecord.findUnique({
                    where: {
                        stockId_period: {
                            stockId: createdStock.id,
                            period: fin.period
                        }
                    }
                })

                if (!exists) {
                    await prisma.financialRecord.create({
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
                const exists = await prisma.stockReturn.findUnique({
                    where: {
                        stockId_period: {
                            stockId: createdStock.id,
                            period: ret.period
                        }
                    }
                })

                if (!exists) {
                    await prisma.stockReturn.create({
                        data: {
                            stockId: createdStock.id,
                            period: ret.period,
                            value: ret.value
                        }
                    })
                }
            }
        }

        console.log('Seeding finished.')
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
