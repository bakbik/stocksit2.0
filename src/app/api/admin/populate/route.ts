
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
    const limit = parseInt(searchParams.get('limit') || '10') // Reduced default limit to 10 to avoid timeouts

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

    console.log(`Starting population for group: ${targetGroup} (${symbols.length} symbols, limit ${limit})`)

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

        // If everything is done, just return success (Unless force update?)
        if (pendingSymbols.length === 0) {
            return NextResponse.json({
                success: true,
                group: targetGroup,
                processed: 0,
                message: `All ${symbols.length} symbols are already populated!`
            })
        }

        // Process symbols
        let processedCount = 0

        for (const symbolOriginal of pendingSymbols) {
            if (processedCount >= limit) break
            processedCount++

            // Mutable symbol for this iteration (in case we find a better one via search)
            let symbol = symbolOriginal

            try {
                let name = ''
                let price = 0
                let marketCap = 0
                let peRatio: number | undefined = undefined
                let roe: number | undefined = undefined
                let stockId = 0
                let dailyChange = 0
                let dailyChangePercent = 0
                let fetched = false

                // 1. TASE Strategy (Bizportal -> Yahoo Fallback -> Yahoo Search)
                if (symbol.endsWith('.TA')) {
                    // ID Derivation for Bizportal
                    const mkId = symbol.replace('.TA', '')
                    stockId = parseInt(mkId)

                    // A. Try Bizportal
                    await new Promise(r => setTimeout(r, 2000)) // Rate limit
                    try {
                        const biz = await getBizportalQuote(mkId)
                        if (biz) {
                            name = biz.name
                            price = biz.price
                            marketCap = biz.marketCap
                            dailyChange = biz.change || 0
                            dailyChangePercent = biz.changePercent || 0
                            fetched = true
                        }
                    } catch (err) {
                        console.warn(`[Populate] Bizportal error for ${symbol}:`, err)
                    }

                    // B. Fallback to Yahoo if Bizportal failed
                    if (!fetched) {
                        const numericId = mkId
                        console.log(`[Populate] Falling back to Yahoo for ${symbol}`)

                        await new Promise(r => setTimeout(r, 500))
                        try {
                            // 1. Try Direct Quote first (e.g. 12345.TA - unlikely but possible)
                            const quote = await yahooFinance.quote(symbol) as any
                            if (quote) {
                                name = quote.longName || quote.shortName || symbol
                                price = quote.regularMarketPrice || 0
                                marketCap = quote.marketCap || 0
                                peRatio = quote.trailingPE || quote.forwardPE
                                roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined
                                dailyChange = quote.regularMarketChange || 0
                                dailyChangePercent = quote.regularMarketChangePercent || 0
                                fetched = true
                            }
                        } catch (err) {
                            console.warn(`[Populate] Yahoo direct quote failed for ${symbol}:`, err)

                            // 2. Auto-Discovery: Search for the ID to find the real ticker (e.g. 2530185 -> ISRA.TA)
                            try {
                                console.log(`[Populate] Searching Yahoo for ID ${numericId}...`)
                                const searchResult = await yahooFinance.search(numericId) as any

                                if (searchResult.quotes && searchResult.quotes.length > 0) {
                                    const bestMatch = searchResult.quotes[0]
                                    const foundTicker = bestMatch.symbol
                                    console.log(`[Populate] Found mapped ticker: ${numericId} -> ${foundTicker}`)

                                    // Fetch using the found ticker
                                    const quote = await yahooFinance.quote(foundTicker) as any
                                    if (quote) {
                                        // Update symbol to the correct one!
                                        // Note: We keep the ID as the numeric TASE ID for DB consistency, 
                                        // but we save the official symbol.
                                        symbol = foundTicker // Update local var for saving
                                        name = quote.longName || quote.shortName || symbol
                                        price = quote.regularMarketPrice || 0
                                        marketCap = quote.marketCap || 0
                                        peRatio = quote.trailingPE || quote.forwardPE
                                        roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined
                                        dailyChange = quote.regularMarketChange || 0
                                        dailyChangePercent = quote.regularMarketChangePercent || 0
                                        fetched = true
                                    }
                                }
                            } catch (searchErr) {
                                console.warn(`[Populate] Yahoo search failed for ${numericId}:`, searchErr)
                            }
                        }
                    }

                } else {
                    // 2. US Strategy (Yahoo Only)
                    // Hashing ID
                    stockId = parseInt(
                        symbol.split('').map(c => c.charCodeAt(0)).join('').substring(0, 8)
                    )

                    await new Promise(r => setTimeout(r, 500)) // Rate limit

                    try {
                        const quote = await yahooFinance.quote(symbol) as any
                        if (quote) {
                            name = quote.longName || quote.shortName || symbol
                            price = quote.regularMarketPrice || 0
                            marketCap = quote.marketCap || 0
                            peRatio = quote.trailingPE || quote.forwardPE
                            roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined
                            dailyChange = quote.regularMarketChange || 0
                            dailyChangePercent = quote.regularMarketChangePercent || 0
                            fetched = true
                        }
                    } catch (err) {
                        console.warn(`[Populate] Yahoo error for ${symbol}:`, err)
                    }
                }

                if (!fetched) {
                    results.errors.push(`Failed to fetch data for ${symbolOriginal} (All sources failed)`)
                    continue
                }

                // Create/Update Stock
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
                console.error(`Error processing ${symbolOriginal}:`, e)
                results.errors.push(`${symbolOriginal}: ${String(e)}`)
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
