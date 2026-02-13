
const YahooFinance = require('yahoo-finance2').default
const yahooFinance = new YahooFinance()

async function testSearch(query: string) {
    console.log(`Searching for '${query}'...`)
    try {
        const result = await yahooFinance.search(query)
        console.log(`Found ${result.quotes.length} results.`)
        if (result.quotes.length > 0) {
            console.log('Top Result:', result.quotes[0])
            // Check if any result is .TA
            const taResult = result.quotes.find(q => q.symbol.endsWith('.TA'))
            if (taResult) {
                console.log('Found TA symbol:', taResult.symbol)
            }
        }
    } catch (e) {
        console.error(e)
    }
}

async function run() {
    await testSearch('אבגול') // Avgol -> AVGL.TA?
    await testSearch('קנון') // Kenon -> KEN.TA?
    await testSearch('דיסקונט השקעות')  // Discount Investment -> DISI.TA?
    await testSearch('קרן רומ')  // Rom Fund -> ?
}

run()
