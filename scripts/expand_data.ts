
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file in root
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import db from '../src/lib/db'
import { getBizportalQuote } from '../src/lib/bizportal'
// import yahooFinance from 'yahoo-finance2'
const YahooFinance = require('yahoo-finance2').default
const yahooFinance = new YahooFinance()
import stockGroups from '../prisma/stock_groups.json'

async function expandData() {
    console.log('--- Starting Data Expansion ---')

    const groups = Object.entries(stockGroups)

    for (const [groupName, symbols] of groups) {
        console.log(`\nProcessing Group: ${groupName} (${symbols.length} symbols)`)

        // Ensure group exists
        const groupRecord = await db.stockGroup.upsert({
            where: { name: groupName },
            update: {},
            create: { name: groupName }
        })

        for (const symbol of symbols) {
            // Rate limit
            await new Promise(r => setTimeout(r, 500))

            try {
                // Check if exists
                const existing = await db.stock.findUnique({ where: { symbol } })

                if (existing) {
                    // Start connecting it to the group if not already
                    // Check if connected
                    const isConnected = await db.stock.findFirst({
                        where: {
                            id: existing.id,
                            groups: { some: { id: groupRecord.id } }
                        }
                    })

                    if (!isConnected) {
                        await db.stock.update({
                            where: { id: existing.id },
                            data: { groups: { connect: { id: groupRecord.id } } }
                        })
                        process.stdout.write('.')
                    } else {
                        process.stdout.write('-')
                    }
                    continue
                }

                // New Stock - Fetch Data
                let name = ''
                let price = 0
                let marketCap = 0
                let peRatio: number | undefined = undefined
                let roe: number | undefined = undefined
                let stockId = 0

                console.log(`\nFetching ${symbol}...`)

                if (symbol.endsWith('.TA')) {
                    // TASE Logic (Bizportal)
                    const mkId = symbol.replace('.TA', '')
                    stockId = parseInt(mkId)
                    const biz = await getBizportalQuote(mkId)

                    if (!biz) {
                        console.error(`Failed to fetch TASE data for ${symbol}`)
                        continue
                    }

                    name = biz.name
                    price = biz.price
                    marketCap = biz.marketCap
                    // PE/ROE not available from main scraper yet, leave null

                } else {
                    // US Logic (Yahoo)
                    // Generate a custom ID for US stocks since TASE IDs are 6-7 digits
                    // We'll use a hash or just an incrementing ID starting from 9000000
                    // Actually, let's just use a simple hash of the symbol chars to get a stable ID
                    stockId = 9000000 + symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + Math.floor(Math.random() * 1000)
                    // Wait, random is bad for idempotency. 
                    // Let's check if we can find a stable ID or just check if ID exists.
                    // Ideally we should use the same ID if we run this script again.
                    // But for now let's try to get a unique int.
                    // Better approach: 9000000 + Index in S&P list? No.
                    // Let's just generate a unique ID based on symbol hash.
                    stockId = parseInt(
                        symbol.split('').map(c => c.charCodeAt(0)).join('').substring(0, 8)
                    )

                    // Fetch Yahoo
                    const quote = await yahooFinance.quote(symbol) as any
                    if (!quote) {
                        console.error(`Failed to fetch Yahoo data for ${symbol}`)
                        continue
                    }

                    name = quote.longName || quote.shortName || symbol
                    price = quote.regularMarketPrice || 0
                    marketCap = quote.marketCap || 0
                    peRatio = quote.trailingPE || quote.forwardPE
                    roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined
                }

                // Create Stock
                // Handle duplicate ID collision just in case (though unlikely with real TASE IDs)
                // For US stocks, if ID collides we might need to retry, but let's assume it works.

                await db.stock.upsert({
                    where: { id: stockId },
                    update: {
                        symbol,
                        name,
                        currentPrice: price,
                        marketCap,
                        peRatio,
                        roe,
                        groups: { connect: { id: groupRecord.id } },
                        lastUpdated: new Date()
                    },
                    create: {
                        id: stockId,
                        symbol,
                        name,
                        currentPrice: price,
                        marketCap,
                        peRatio,
                        roe,
                        groups: { connect: { id: groupRecord.id } },
                        lastUpdated: new Date()
                    }
                })

                console.log(` Created ${symbol} (${name})`)

            } catch (e) {
                console.error(`Error processing ${symbol}:`, e)
            }
        }
    }
    console.log('\n--- Data Expansion Complete ---')
}

expandData()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect()
    })
