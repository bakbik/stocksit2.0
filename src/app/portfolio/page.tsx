
import db from '@/lib/db'
import { PortfolioClient } from '@/components/PortfolioClient'
import { calculateInvestmentMetrics } from '@/lib/investment_logic'

export const dynamic = 'force-dynamic'

const USER_ID = 1

export default async function PortfolioPage() {
    // Fetch user portfolio with all stock data
    let portfolio = await db.portfolio.findUnique({
        where: { userId: USER_ID },
        include: {
            holdings: {
                include: {
                    stock: {
                        include: {
                            returns: true,
                            financials: true,
                            groups: true
                        }
                    }
                }
            }
        }
    })

    // Create portfolio if not exists
    if (!portfolio) {
        portfolio = await db.portfolio.create({
            data: { userId: USER_ID },
            include: {
                holdings: {
                    include: {
                        stock: {
                            include: {
                                returns: true,
                                financials: true,
                                groups: true
                            }
                        }
                    }
                }
            }
        })
    }

    // Process stocks with metrics
    const holdings = portfolio.holdings.map((h: any) => {
        const stock = h.stock
        const metrics = calculateInvestmentMetrics(stock, stock.financials)

        // Find latest price change (using 3m as proxy if daily not available, later we can add daily)
        // For now we will calculate Gain/Loss based on buy price

        return {
            ...h,
            stock: {
                ...stock,
                metrics
            }
        }
    })

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
                <PortfolioClient initialHoldings={holdings} />
            </div>
        </main>
    )
}
