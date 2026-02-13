import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function main() {
    const symbols = ['AVGL.TA', 'ICL.TA', 'AAPL']
    for (const symbol of symbols) {
        console.log(`Checking ${symbol}...`)
        try {
            const quote = await yahooFinance.quote(symbol)
            console.log(`Quote for ${symbol}:`, JSON.stringify({
                earningsTimestamp: (quote as any).earningsTimestamp,
                earningsTimestampStart: (quote as any).earningsTimestampStart,
                earningsTimestampEnd: (quote as any).earningsTimestampEnd,
            }, null, 2))
        } catch (e) {
            console.error(e)
        }
    }
}

main()
