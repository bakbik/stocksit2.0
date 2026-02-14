
import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getBizportalQuote } from '@/lib/bizportal'
import yahooFinance from 'yahoo-finance2'
import stockGroupsRaw from '../../../../../prisma/stock_groups.json'

// Cast to explicit type to avoid TS errors
const stockGroups = stockGroupsRaw as Record<string, string[]>

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow longer timeout on Vercel Pro, though Hobby is 10s

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const targetGroup = searchParams.get('group') // e.g. "TA-35" or "S&P 500"
    const limit = parseInt(searchParams.get('limit') || '50') // Limit processing to avoid timeout

    if (!targetGroup) {
        return NextResponse.json({
            error: 'Missing group parameter. Available: ' + Object.keys(stockGroups).join(', ')
        }, { status: 400 })
    }

    if (!stockGroups[targetGroup]) {
        return NextResponse.json({
            error: 'Invalid group. Available: ' + Object.keys(stockGroups).join(', ')
        }, { status: 400 })
    }

    const symbols = stockGroups[targetGroup]
    const results = {
        total: symbols.length,
        processed: 0,
        created: 0,
        updated: 0,
        errors: [] as string[]
    }

    console.log(`Starting population for group: ${targetGroup} (${symbols.length} symbols)`)

    try {
        // Ensure group exists
        const groupRecord = await db.stockGroup.upsert({
            where: { name: targetGroup },
            update: {},
            create: { name: targetGroup }
        })

        // Process symbols
        let processedCount = 0
        for (const symbol of symbols) {
            if (processedCount >= limit) break
            processedCount++

            try {
                // Check if exists
                const existing = await db.stock.findUnique({ where: { symbol } })

                if (existing) {
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
                        results.updated++
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
                let dailyChange = 0
                let dailyChangePercent = 0

                if (symbol.endsWith('.TA')) {
                    // TASE Logic (Bizportal)
                    const mkId = symbol.replace('.TA', '')
                    stockId = parseInt(mkId)
                    const biz = await getBizportalQuote(mkId)

                    if (!biz) {
                        results.errors.push(`Failed to fetch TASE data for ${symbol}`)
                        continue
                    }

                    name = biz.name
                    price = biz.price
                    marketCap = biz.marketCap
                    dailyChange = biz.change || 0
                    dailyChangePercent = biz.changePercent || 0

                } else {
                    // US Logic (Yahoo)
                    // Configurable hash ID for US stocks to ensure stability
                    // Using a simple hash based on char codes
                    stockId = parseInt(
                        symbol.split('').map(c => c.charCodeAt(0)).join('').substring(0, 8)
                    )

                    // Fetch Yahoo
                    const quote = await yahooFinance.quote(symbol)
                    if (!quote) {
                        results.errors.push(`Failed to fetch Yahoo data for ${symbol}`)
                        continue
                    }

                    name = quote.longName || quote.shortName || symbol
                    price = quote.regularMarketPrice || 0
                    marketCap = quote.marketCap || 0
                    peRatio = quote.trailingPE || quote.forwardPE
                    roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined
                    dailyChange = quote.regularMarketChange || 0
                    dailyChangePercent = quote.regularMarketChangePercent || 0
                }

                // Create Stock
                await db.stock.upsert({
                    where: { id: stockId },
                    update: {
                        symbol,
                        name,
                        currentPrice: price,
                        marketCap,
                        peRatio,
                        roe,
                        dailyChange,
                        dailyChangePercent,
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
                        dailyChange,
                        dailyChangePercent,
                        groups: { connect: { id: groupRecord.id } },
                        lastUpdated: new Date()
                    }
                })
                results.created++

            } catch (e) {
                console.error(`Error processing ${symbol}:`, e)
                results.errors.push(`${symbol}: ${String(e)}`)
            }
        }

        results.processed = processedCount

        return NextResponse.json({
            success: true,
            group: targetGroup,
            ...results,
            message: `Processed ${processedCount}/${symbols.length} symbols. Run again to continue if needed.`
        })

    } catch (error) {
        console.error('Population error:', error)
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 })
    }
}
