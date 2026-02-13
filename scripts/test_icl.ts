import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function main() {
    const symbol = 'ICL.TA'
    try {
        const summary = await yahooFinance.quoteSummary(symbol, {
            modules: ['earnings']
        })
        console.log("Earnings Chart:", JSON.stringify(summary.earnings?.earningsChart?.quarterly, null, 2))
    } catch (e) {
        console.error(e)
    }
}

main()
