
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export const dynamic = 'force-dynamic'

// Hardcoded user ID for now
const USER_ID = 1

export async function GET() {
    try {
        // Ensure user exists (for dev/first-time)
        let user = await db.user.findUnique({ where: { id: USER_ID } })
        if (!user) {
            user = await db.user.create({ data: { id: USER_ID, email: 'demo@user.com' } })
        }

        let portfolio = await db.portfolio.findUnique({
            where: { userId: USER_ID },
            include: {
                holdings: {
                    include: {
                        stock: {
                            include: {
                                returns: true,
                                financials: true
                            }
                        }
                    }
                }
            }
        })

        if (!portfolio) {
            portfolio = await db.portfolio.create({
                data: { userId: USER_ID },
                include: {
                    holdings: {
                        include: {
                            stock: {
                                include: {
                                    returns: true,
                                    financials: true
                                }
                            }
                        }
                    }
                }
            })
        }

        return NextResponse.json(portfolio)
    } catch (error) {
        console.error('Error fetching portfolio:', error)
        return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { stockId, quantity, price } = body

        if (!stockId || !quantity || price === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let portfolio = await db.portfolio.findUnique({ where: { userId: USER_ID } })
        if (!portfolio) {
            portfolio = await db.portfolio.create({ data: { userId: USER_ID } })
        }

        // Check if holding exists to average the price
        const existingHolding = await db.holding.findUnique({
            where: {
                portfolioId_stockId: {
                    portfolioId: portfolio.id,
                    stockId: Number(stockId)
                }
            }
        })

        let newQuantity = Number(quantity)
        let newAvgPrice = Number(price)

        if (existingHolding) {
            const totalCost = (existingHolding.quantity * existingHolding.buyPrice) + (newQuantity * newAvgPrice)
            newQuantity = existingHolding.quantity + newQuantity
            newAvgPrice = totalCost / newQuantity
        }

        const holding = await db.holding.upsert({
            where: {
                portfolioId_stockId: {
                    portfolioId: portfolio.id,
                    stockId: Number(stockId)
                }
            },
            update: {
                quantity: newQuantity,
                buyPrice: newAvgPrice
            },
            create: {
                portfolioId: portfolio.id,
                stockId: Number(stockId),
                quantity: newQuantity,
                buyPrice: newAvgPrice
            }
        })

        return NextResponse.json(holding)
    } catch (error) {
        console.error('Error updating portfolio:', error)
        return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 })
    }
}
