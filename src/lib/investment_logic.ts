export interface InvestmentMetrics {
    impliedProfit: number | null
    last4QProfit: number
    expectedAnnualProfit: number
    expectedAnnualRevenue: number
    potential: number | null
    verdict: 'buy' | 'hold'
    isPEValid: boolean
    isEquityValid: boolean
    revGrowth: number
    profitGrowth: number
    equityRatio: number
    peValue: number | null
    peType: 'reported' | 'calculated' | 'estimated' | null
    latestPeriod: string
}

export function calculateInvestmentMetrics(stock: any, financials: any[]): InvestmentMetrics | null {
    if (!stock.symbol.endsWith('.TA')) return null

    const quarterlyData = financials.filter(f => f.period.startsWith('Q')).sort((a, b) => {
        const parse = (p: string) => {
            const [q, y] = p.split('/')
            return parseInt(y) * 10 + parseInt(q.slice(1))
        }
        return parse(b.period) - parse(a.period)
    })

    const latestY = financials.filter(f => f.period.startsWith('Y')).sort((a, b) => {
        const yearA = parseInt(a.period.split('/')[1])
        const yearB = parseInt(b.period.split('/')[1])
        return yearB - yearA
    })[0] || null

    if (quarterlyData.length === 0 && !latestY) return null

    const latestF = quarterlyData[0] || latestY
    const latestPeriod = latestF.period
    const [latestQ, latestYear] = latestPeriod.split('/')
    const yearNum = parseInt(latestYear)

    // Basic required calculations for potential/verdict
    const last4QData = quarterlyData.slice(0, 4)
    let last4QProfit = last4QData.reduce((sum, f) => sum + (f.netProfit || 0), 0) * 1000
    const last4QRevenue = last4QData.reduce((sum, f) => sum + (f.revenue || 0), 0) * 1000

    const currentYearData = quarterlyData.filter(f => f.period.endsWith(`/${latestYear}`))
    const count = currentYearData.length
    let expectedAnnualProfit = 0
    let expectedAnnualRevenue = 0
    let isSparseData = count < 3

    const yPrev1 = financials.find(f => f.period === `Y/${yearNum - 1}`)
    const yPrev2 = financials.find(f => f.period === `Y/${yearNum - 2}`)
    let baseRevenue = 0
    let baseProfit = 0

    if (isSparseData) {
        if (yPrev1 && yPrev2) {
            baseRevenue = ((yPrev1.revenue || 0) + (yPrev2.revenue || 0)) / 2
            baseProfit = ((yPrev1.netProfit || 0) + (yPrev2.netProfit || 0)) / 2
        } else if (yPrev1) {
            baseRevenue = yPrev1.revenue || 0
            baseProfit = yPrev1.netProfit || 0
        } else {
            baseRevenue = yPrev2?.revenue || 0
            baseProfit = yPrev2?.netProfit || 0
        }
    } else {
        baseRevenue = yPrev1?.revenue || 0
        baseProfit = yPrev1?.netProfit || 0
    }

    if (quarterlyData.length > 0) {
        if (isSparseData) {
            const recentQuarters = quarterlyData.slice(0, 3)
            const avgP = recentQuarters.reduce((s, f) => s + (f.netProfit || 0), 0) / recentQuarters.length
            expectedAnnualProfit = (avgP * 4 * 1000 + (baseProfit * 1000)) / 2
            const avgR = recentQuarters.reduce((s, f) => s + (f.revenue || 0), 0) / recentQuarters.length
            expectedAnnualRevenue = (avgR * 4 * 1000 + (baseRevenue * 1000)) / 2
        } else {
            const currentYearProfit = currentYearData.reduce((sum, f) => sum + (f.netProfit || 0), 0)
            const currentYearRevenue = currentYearData.reduce((sum, f) => sum + (f.revenue || 0), 0)
            expectedAnnualProfit = (currentYearProfit / count) * 4 * 1000
            expectedAnnualRevenue = (currentYearRevenue || 1) / count * 4 * 1000
        }
    } else if (latestY) {
        expectedAnnualProfit = (latestY.netProfit || 0) * 1000
        expectedAnnualRevenue = (latestY.revenue || 0) * 1000
        last4QProfit = expectedAnnualProfit
    }

    const equityRatio = (latestF.equity && latestF.totalBalance) ? latestF.equity / latestF.totalBalance : 0
    const isEquityValid = equityRatio > 0.20

    const ttmProfitThousands = (last4QProfit / 1000)
    const potentialBaselineThousands = Math.max(ttmProfitThousands, baseProfit)
    const calculateGrowth = (current: number, previous: number) => {
        if (!previous || previous === 0) return 0
        const prevAbsolute = previous * 1000
        const diff = (current - prevAbsolute)
        return prevAbsolute < 0 ? diff / Math.abs(prevAbsolute) : (current / prevAbsolute) - 1
    }
    const potential = potentialBaselineThousands > 0 ? calculateGrowth(expectedAnnualProfit, potentialBaselineThousands) : null

    // STRICT P/E HIERARCHY
    let peValue: number | null = null
    let peType: 'reported' | 'calculated' | 'estimated' | null = null

    // 1. Reported
    if (stock.peRatio && stock.peRatio > 0 && stock.peRatio < 500) {
        peValue = stock.peRatio
        peType = 'reported'
    }
    // 2. Calculated (formerly TTM)
    else {
        let normalizedTTM = last4QProfit
        if (normalizedTTM > stock.marketCap * 10 && normalizedTTM > 1000000) normalizedTTM /= 1000

        if (normalizedTTM > 0) {
            peValue = stock.marketCap / normalizedTTM
            peType = 'calculated'
        }
        // 3. Estimated (Forward)
        else {
            let normalizedForward = expectedAnnualProfit
            if (normalizedForward > stock.marketCap * 10 && normalizedForward > 1000000) normalizedForward /= 1000

            if (normalizedForward > 0) {
                peValue = stock.marketCap / normalizedForward
                peType = 'estimated'
            }
        }
    }

    const isPEValid = peValue !== null && peValue >= 2 && peValue <= 40
    const revGrowth = calculateGrowth(expectedAnnualRevenue, baseRevenue)
    const profitGrowth = calculateGrowth(expectedAnnualProfit, baseProfit)
    const verdict = (isPEValid && isEquityValid && potential !== null && potential > 0 && revGrowth > 0 && profitGrowth > 0) ? 'buy' : 'hold'

    return {
        impliedProfit: (stock.marketCap && (peValue || 15)) ? stock.marketCap / (peValue || 15) : null,
        last4QProfit,
        expectedAnnualProfit,
        expectedAnnualRevenue,
        potential,
        verdict,
        isPEValid,
        isEquityValid,
        revGrowth,
        profitGrowth,
        equityRatio,
        peValue,
        peType,
        latestPeriod
    }
}
