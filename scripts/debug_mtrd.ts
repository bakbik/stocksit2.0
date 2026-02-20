
import db from '../src/lib/db'
import { calculateInvestmentMetrics } from '../src/lib/investment_logic'

async function debug() {
    console.log('Fetching MTRD.TA...')
    const stock = await db.stock.findFirst({
        where: { symbol: 'MTRD.TA' },
        include: { financials: true }
    })

    if (!stock) {
        console.error('Stock not found')
        return
    }

    console.log(`Symbol: ${stock.symbol}`)
    console.log(`Current Price: ${stock.currentPrice}`)
    console.log(`Market Cap: ${stock.marketCap}`)

    const metrics = calculateInvestmentMetrics(stock, stock.financials)

    if (metrics) {
        console.log('\n--- Metrics ---')
        console.log(`Verdict: ${metrics.verdict}`)
        console.log(`Potential: ${metrics.potential ? (metrics.potential * 100).toFixed(2) + '%' : 'null'}`)
        console.log(`Implied Profit (Fair Value?): ${metrics.impliedProfit}`)
        console.log(`Expected Annual Profit: ${metrics.expectedAnnualProfit}`)
        console.log(`Last 4Q Profit (TTM): ${metrics.last4QProfit}`)

        // Re-implement logic slightly to show intermediate steps if needed or trust the output
        // The logic uses calculateGrowth(expectedAnnualProfit, potentialBaselineThousands)
        // potentialBaselineThousands = Math.max(ttmProfitThousands, baseProfit)

        // Let's deduce baseProfit from the script by replicating logic:
        const financials = stock.financials
        const quarterlyData = financials.filter(f => f.period.startsWith('Q')).sort((a, b) => {
            const parse = (p: string) => {
                const [q, y] = p.split('/')
                return parseInt(y) * 10 + parseInt(q.slice(1))
            }
            return parse(b.period) - parse(a.period)
        })

        const latestF = quarterlyData[0]
        if (latestF) {
            const [latestQ, latestYear] = latestF.period.split('/')
            const yearNum = parseInt(latestYear)
            const yPrev1 = financials.find(f => f.period === `Y/${yearNum - 1}`)
            const yPrev2 = financials.find(f => f.period === `Y/${yearNum - 2}`)

            console.log(`\n--- Baseline Data ---`)
            console.log(`Latest Period: ${latestF.period}`)
            console.log(`Y-${yearNum - 1} Profit: ${yPrev1?.netProfit}`)
            console.log(`Y-${yearNum - 2} Profit: ${yPrev2?.netProfit}`)
        }
    } else {
        console.log('Metrics calculation returned null')
    }
}

debug()
