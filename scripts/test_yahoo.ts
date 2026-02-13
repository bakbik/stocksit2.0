import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function main() {
    const symbol = 'AVGL.TA'
    console.log(`Checking ${symbol}...`)
    try {
        const summary = await yahooFinance.quoteSummary(symbol, {
            modules: ['calendarEvents', 'defaultKeyStatistics']
        })
        console.log("Calendar Events:", JSON.stringify(summary.calendarEvents, null, 2))
        console.log("Default Key Statistics:", JSON.stringify(summary.defaultKeyStatistics, null, 2))
    } catch (e) {
        console.error(e)
    }
}

main()
