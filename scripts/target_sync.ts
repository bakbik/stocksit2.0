import { updateStockPrice, updateFundamentals } from '../src/lib/sync'
import db from '../src/lib/db'

async function main() {
    const symbols = ['ICL.TA', 'AVGL.TA', 'AAPL', 'MSFT']
    for (const symbol of symbols) {
        console.log(`Syncing ${symbol}...`)
        await updateStockPrice(symbol)
        await updateFundamentals(symbol)
    }
}

main().catch(console.error).finally(() => (db as any).$disconnect())
