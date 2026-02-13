import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function testYahooEarnings() {
    const symbol = 'AVGL.TA'
    try {
        console.log(`Fetching quoteSummary for ${symbol}...`)
        const result = await yahooFinance.quoteSummary(symbol, {
            modules: ['earningsHistory', 'earningsTrend']
        })

        console.log('Result:', JSON.stringify(result, null, 2))
    } catch (e: any) {
        console.error('Error:', e.message)
    }
}

testYahooEarnings()
