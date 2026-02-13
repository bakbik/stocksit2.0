import { updateAllStocks, updateStockPrice } from '../src/lib/sync'
import db from '../src/lib/db'

async function main() {
    console.log("Updating stock data...")

    // Test single stock from DB
    const stock = await db.stock.findFirst({ where: { symbol: { contains: '.TA' } } })
    if (!stock) {
        console.log("No stocks with .TA symbol found in DB.")
        return
    }
    const testSymbol = stock.symbol
    console.log(`Testing with ${testSymbol} (${stock.name})...`)
    const res = await updateStockPrice(testSymbol)

    if (res) {
        console.log(`Success: ${res.currentPrice}`)
    } else {
        console.log("Failed to update test stock.")
    }

    // Use argv to trigger full update?
    if (process.argv.includes('--all')) {
        await updateAllStocks()
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
