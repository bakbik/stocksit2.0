import db from '../src/lib/db'

async function main() {
    console.log('Populating stock groups...')

    // Clear existing groups/memberships for a fresh start? 
    // For now let's just upsert groups and update memberships

    const groups = [
        { name: 'TA-35', description: '35 largest companies on TASE' },
        { name: 'TA-125', description: '125 largest companies on TASE' },
        { name: 'TA-90', description: 'Companies in TA-125 but not in TA-35' },
        { name: 'Yeter', description: 'Stocks not in TA-125' },
        { name: 'S&P 500', description: 'Top 500 US companies' }
    ]

    for (const g of groups) {
        await db.stockGroup.upsert({
            where: { name: g.name },
            update: { description: g.description },
            create: { name: g.name, description: g.description }
        })
    }

    // Get all Israeli stocks (those with .TA symbol)
    const allIsraeliStocks = await db.stock.findMany({
        where: { symbol: { contains: '.TA' } },
        orderBy: { marketCap: 'desc' }
    })

    console.log(`Found ${allIsraeliStocks.length} Israeli stocks.`)

    const ta35Group = await db.stockGroup.findUnique({ where: { name: 'TA-35' } })
    const ta125Group = await db.stockGroup.findUnique({ where: { name: 'TA-125' } })
    const ta90Group = await db.stockGroup.findUnique({ where: { name: 'TA-90' } })
    const yeterGroup = await db.stockGroup.findUnique({ where: { name: 'Yeter' } })

    if (!ta35Group || !ta125Group || !ta90Group || !yeterGroup) return

    // Reset memberships for these groups
    await db.stockGroup.update({ where: { name: 'TA-35' }, data: { stocks: { set: [] } } })
    await db.stockGroup.update({ where: { name: 'TA-125' }, data: { stocks: { set: [] } } })
    await db.stockGroup.update({ where: { name: 'TA-90' }, data: { stocks: { set: [] } } })
    await db.stockGroup.update({ where: { name: 'Yeter' }, data: { stocks: { set: [] } } })

    const ta35Ids = allIsraeliStocks.slice(0, 35).map(s => ({ id: s.id }))
    const ta125Ids = allIsraeliStocks.slice(0, 125).map(s => ({ id: s.id }))
    const ta90Ids = allIsraeliStocks.slice(35, 125).map(s => ({ id: s.id }))
    const yeterIds = allIsraeliStocks.slice(125).map(s => ({ id: s.id }))

    await db.stockGroup.update({ where: { name: 'TA-35' }, data: { stocks: { connect: ta35Ids } } })
    await db.stockGroup.update({ where: { name: 'TA-125' }, data: { stocks: { connect: ta125Ids } } })
    await db.stockGroup.update({ where: { name: 'TA-90' }, data: { stocks: { connect: ta90Ids } } })
    await db.stockGroup.update({ where: { name: 'Yeter' }, data: { stocks: { connect: yeterIds } } })

    console.log('TASE groups populated.')

    // Add sample S&P 500 stocks
    const sp500Group = await db.stockGroup.findUnique({ where: { name: 'S&P 500' } })
    if (sp500Group) {
        const sp500Stocks = [
            { id: 990001, symbol: 'AAPL', name: 'Apple Inc.', marketCap: 3000000000000 },
            { id: 990002, symbol: 'MSFT', name: 'Microsoft Corp.', marketCap: 3000000000000 },
            { id: 990003, symbol: 'GOOGL', name: 'Alphabet Inc.', marketCap: 2000000000000 },
            { id: 990004, symbol: 'AMZN', name: 'Amazon.com Inc.', marketCap: 1800000000000 },
            { id: 990005, symbol: 'META', name: 'Meta Platforms Inc.', marketCap: 1200000000000 }
        ]

        for (const s of sp500Stocks) {
            await db.stock.upsert({
                where: { id: s.id },
                update: { symbol: s.symbol, name: s.name, marketCap: s.marketCap },
                create: s
            })
        }

        await db.stockGroup.update({
            where: { name: 'S&P 500' },
            data: { stocks: { set: [], connect: sp500Stocks.map(s => ({ id: s.id })) } }
        })
        console.log('S&P 500 sample stocks added.')
    }

    console.log('Done.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
