import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function main() {
    const queries = ['1100957', 'אבגול', 'Avgol']

    for (const q of queries) {
        console.log(`Searching for: ${q}`)
        try {
            const res = await yahooFinance.search(q)
            console.log(`Results for ${q}:`)
            res.quotes.forEach(quote => {
                console.log(`  - ${quote.symbol} (${quote.shortname || quote.longname}) [${quote.exchange}]`)
            })
        } catch (e) {
            console.error(`Error searching ${q}:`, e)
        }
    }
}

main()
