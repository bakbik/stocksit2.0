import db from '../src/lib/db'

async function main() {
    const stocks = await (db as any).stock.findMany({
        include: {
            financials: {
                orderBy: { period: 'desc' },
                take: 1
            }
        }
    })

    console.log("Symbol | Name | Latest Period | PublishedAt")
    console.log("---|---|---|---")
    for (const s of stocks) {
        const fin = s.financials[0]
        console.log(`${s.symbol} | ${s.name} | ${fin?.period || '-'} | ${fin?.publishedAt || 'NULL'}`)
    }
}

main().catch(console.error).finally(() => (db as any).$disconnect())
