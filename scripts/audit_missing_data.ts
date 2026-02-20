
import db from '../src/lib/db'
import stockGroupsRaw from '../prisma/stock_groups.json'

const stockGroups = stockGroupsRaw as Record<string, string[]>

async function audit() {
    console.log('--- DATABASE AUDIT ---')

    let totalMissingSymbols: string[] = []
    let totalMissingFinancials: string[] = []
    let totalMissingPrice: string[] = []

    for (const [groupName, symbols] of Object.entries(stockGroups)) {
        console.log(`\nEvaluating Group: ${groupName} (Expected: ${symbols.length})`)

        const stocksInDb = await db.stock.findMany({
            where: { symbol: { in: symbols } },
            include: { financials: true, groups: true }
        })

        const foundSymbols = new Set(stocksInDb.map(s => s.symbol))
        const missingInDb = symbols.filter(s => !foundSymbols.has(s))

        console.log(`- Found in DB: ${foundSymbols.size}`)
        console.log(`- Missing entirely: ${missingInDb.length}`)
        if (missingInDb.length > 0) {
            console.log(`  Symbols: ${missingInDb.slice(0, 10).join(', ')}${missingInDb.length > 10 ? '...' : ''}`)
            totalMissingSymbols.push(...missingInDb)
        }

        const missingFin = stocksInDb.filter(s => s.financials.length === 0)
        console.log(`- Found but missing financial reports: ${missingFin.length}`)
        if (missingFin.length > 0) {
            totalMissingFinancials.push(...missingFin.map(s => s.symbol))
        }

        const missingPrice = stocksInDb.filter(s => !s.currentPrice || s.currentPrice === 0)
        console.log(`- Found but missing current price: ${missingPrice.length}`)
        if (missingPrice.length > 0) {
            totalMissingPrice.push(...missingPrice.map(s => s.symbol))
        }
    }

    console.log('\n--- OVERALL SUMMARY ---')
    console.log(`Total Symbols Missing from DB: ${new Set(totalMissingSymbols).size}`)
    console.log(`Total DB Stocks Missing Financials: ${new Set(totalMissingFinancials).size}`)
    console.log(`Total DB Stocks Missing Price: ${new Set(totalMissingPrice).size}`)

    if (totalMissingSymbols.length > 0) {
        console.log('\nSample Missing Symbols:', Array.from(new Set(totalMissingSymbols)).slice(0, 20).join(', '))
    }
    if (totalMissingFinancials.length > 0) {
        console.log('\nSample Missing Financials:', Array.from(new Set(totalMissingFinancials)).slice(0, 20).join(', '))
    }
}

audit()
    .catch(console.error)
    .finally(() => db.$disconnect())
