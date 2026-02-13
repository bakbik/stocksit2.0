import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function main() {
    const symbol = 'AVGL.TA'
    console.log(`Checking ${symbol} with fundamentalsTimeSeries...`)
    try {
        const result = await (yahooFinance as any).fundamentalsTimeSeries(symbol, {
            module: 'financials',
            period1: '2024-01-01',
            type: 'quarterly'
        })
        console.log("Fundamentals Time Series:", JSON.stringify(result, null, 2))
    } catch (e) {
        console.error(e)
    }
}

main()
