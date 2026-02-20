import db from '../src/lib/db'
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function fix() {
    const stocks = await db.stock.findMany({
        where: {
            symbol: { endsWith: '.TA' }
        }
    })

    const numericStocks = stocks.filter(s => {
        const base = s.symbol.replace('.TA', '')
        return /^\d+$/.test(base)
    })

    console.log(`Found ${numericStocks.length} numeric TASE stocks in DB to fix.`)

    for (const stock of numericStocks) {
        const numericId = stock.symbol.replace('.TA', '')
        console.log(`Processing ${stock.symbol}...`)

        try {
            await new Promise(r => setTimeout(r, 500))
            const searchResult = await yahooFinance.search(numericId) as any
            if (searchResult.quotes && searchResult.quotes.length > 0) {
                const bestMatch = searchResult.quotes[0]
                const foundTicker = bestMatch.symbol

                if (foundTicker !== stock.symbol) {
                    console.log(`  -> Found mapped ticker! ${stock.symbol} became ${foundTicker}`)

                    // Check if the target symbol already exists (to avoid unique constraint errors)
                    const existingTarget = await db.stock.findUnique({ where: { symbol: foundTicker } })

                    if (existingTarget) {
                        console.log(`  -> Warning: ${foundTicker} already exists. Migrating groups and deleting old numeric profile.`)
                        // Transfer groups
                        const groups = await db.stockGroup.findMany({
                            where: { stocks: { some: { id: stock.id } } }
                        })

                        await db.stock.update({
                            where: { id: existingTarget.id },
                            data: {
                                groups: { connect: groups.map(g => ({ id: g.id })) }
                            }
                        })
                        // Delete numeric duplicate
                        await db.stock.delete({ where: { id: stock.id } })
                    } else {
                        // Just update the symbol
                        await db.stock.update({
                            where: { id: stock.id },
                            data: { symbol: foundTicker }
                        })
                    }
                } else {
                    console.log(`  -> Search returned same ticker: ${foundTicker}`)
                }
            } else {
                console.log(`  -> No mapping found on Yahoo.`)
            }
        } catch (e) {
            console.error(`  -> Error mapping ${stock.symbol}:`, e)
        }
    }

    console.log('Finished fixing tickers.')
}

fix()
    .catch(console.error)
    .finally(() => db.$disconnect())
