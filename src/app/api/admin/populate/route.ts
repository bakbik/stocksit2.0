
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

        // OPTIMIZATION: Fetch all existing symbols in this group to skip them efficiently
        const existingInGroup = await db.stock.findMany({
            where: {
                groups: { some: { id: groupRecord.id } }
            },
            select: { symbol: true }
        })
        const existingSet = new Set(existingInGroup.map(s => s.symbol))

        // Filter symbols that are already done
        const pendingSymbols = symbols.filter(s => !existingSet.has(s))

        console.log(`Found ${existingSet.size} existing, ${pendingSymbols.length} pending.`)

        // Process symbols
        let processedCount = 0

        // If everything is done, just return success
        if (pendingSymbols.length === 0) {
            return NextResponse.json({
                success: true,
                group: targetGroup,
                processed: 0,
                message: `All ${symbols.length} symbols are already populated!`
            })
        }

        for (const symbol of pendingSymbols) {
            if (processedCount >= limit) break
            processedCount++

            try {
                // Check if exists (but not in group, though logic above handles 'in group')
                // We still need to check if it exists in DB at all to decide between update/create logic or just use upsert
                // Upsert is safe.

                // Reuse existing retrieval logic
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
                    const quote = await yahooFinance.quote(symbol) as any
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
