import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

import db from './db'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import { sendEmail } from './email'

const BIZPORTAL_BRIDGE_PATH = path.join(process.cwd(), 'scripts', 'bizportal_bridge.py')

async function getIsraeliReportDate(symbol: string, period: string): Promise<Date | null> {
    if (!symbol.endsWith('.TA')) return null

    try {
        const stock = await (db as any).stock.findUnique({ where: { symbol }, select: { id: true } })
        if (!stock) return null

        const secNum = stock.id.toString()
        console.log(`Calling Bizportal bridge for ${symbol} (Security: ${secNum}, Period: ${period})...`)

        const cmd = `python "${BIZPORTAL_BRIDGE_PATH}" "${secNum}" "${period}"`
        const output = execSync(cmd, { encoding: 'utf-8' })
        const result = JSON.parse(output)

        if (result.pubDate) {
            // PubDate format expected: "DD/MM/YYYY" or "DD.MM.YYYY"
            const dateStr = result.pubDate.replace(/\./g, '/')
            const [day, month, year] = dateStr.split('/')
            return new Date(`${year}-${month}-${day}T09:00:00`)
        }
    } catch (e) {
        console.error(`Error in getIsraeliReportDate for ${symbol}:`, e)
    }
    return null
}

const OVERRIDE_PATH = path.join(process.cwd(), 'src', 'lib', 'report_dates_override.json')

function getManualOverrideDate(symbol: string, period: string): Date | null {
    try {
        if (!fs.existsSync(OVERRIDE_PATH)) return null

        const overrides = JSON.parse(fs.readFileSync(OVERRIDE_PATH, 'utf-8'))
        const symbolDates = overrides.dates?.[symbol]

        if (symbolDates && symbolDates[period]) {
            return new Date(symbolDates[period])
        }
    } catch (e) {
        console.error('Error reading manual overrides:', e)
    }
    return null
}

function calculatePeriodEndDate(period: string): Date {
    // Calculate the end date of a financial period
    // Q1/2024 -> March 31, 2024
    // Q2/2024 -> June 30, 2024
    // Q3/2024 -> September 30, 2024
    // Q4/2024 -> December 31, 2024
    // Y/2024 -> December 31, 2024

    const [periodType, yearStr] = period.split('/')
    const year = parseInt(yearStr)

    if (periodType === 'Y') {
        return new Date(year, 11, 31) // December 31
    }

    if (periodType.startsWith('Q')) {
        const quarter = parseInt(periodType.slice(1))
        const month = quarter * 3 - 1 // Q1=2(Mar), Q2=5(Jun), Q3=8(Sep), Q4=11(Dec)
        const lastDay = new Date(year, month + 1, 0).getDate() // Get last day of month
        return new Date(year, month, lastDay)
    }

    // Fallback to end of year
    return new Date(year, 11, 31)
}

async function checkForNewIsraeliReports(symbol: string, stockId: number) {
    if (!symbol.endsWith('.TA')) return

    try {
        const url = `https://www.bizportal.co.il/capitalmarket/quote/reports/${stockId}`
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        if (!response.ok) return

        const html = await response.text()

        // Bizportal reports page contains headers like Q3/2025, Q2/2025 etc.
        const periodMatch = html.match(/<th[^>]*>(Q[1-4]\/\d{4})<\/th>/i)
        if (!periodMatch) return

        const latestPeriod = periodMatch[1] // e.g., "Q3/2025"

        const latestRecord = await (db as any).financialRecord.findFirst({
            where: { stockId },
            orderBy: { period: 'desc' }
        })

        if (!latestRecord || latestRecord.period !== latestPeriod) {
            console.log(`🔔 NEW REPORT DETECTED for ${symbol}: ${latestPeriod} (Current: ${latestRecord?.period || 'None'})`)

            const message = `A new financial report (${latestPeriod}) has been detected for ${symbol}.`

            // Create notification in DB
            await (db as any).notification.create({
                data: {
                    stockId,
                    type: 'new_report',
                    period: latestPeriod,
                    message: message
                }
            })

            // Send to all users
            const users = await (db as any).user.findMany()
            for (const user of users) {
                if (user.email) {
                    await sendEmail({
                        to: user.email,
                        subject: `NEW REPORT: ${symbol} - ${latestPeriod}`,
                        text: `${message}\n\nCheck it here: ${url}`
                    })
                }
            }
        }
    } catch (e) {
        console.error(`Error checking Bizportal for ${symbol}:`, e)
    }
}


import { getBizportalQuote } from './bizportal'

export async function updateStockPrice(symbol: string) {
    try {
        let price: number | undefined
        let marketCap: number | undefined
        let peRatio: number | undefined
        let roe: number | undefined

        // BIZPORTAL PATH for Israeli Stocks
        if (symbol.endsWith('.TA')) {
            const stockId = symbol.replace('.TA', '') // 1100957.TA -> 1100957
            const bizData = await getBizportalQuote(stockId)

            if (bizData) {
                price = bizData.price
                marketCap = bizData.marketCap
                console.log(`[Bizportal] Fetched ${symbol}: ${price} ILS, Cap: ${marketCap}`)
            } else {
                console.error(`[Bizportal] Failed to fetch data for ${symbol}`)
                return null
            }
        }
        // YAHOO PATH for Global Stocks (S&P 500 etc)
        else {
            const quote = await yahooFinance.quote(symbol)
            if (!quote) {
                console.error(`No data found for ${symbol}`)
                return null
            }
            price = quote.regularMarketPrice
            marketCap = quote.marketCap
            peRatio = quote.trailingPE || quote.forwardPE
            roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined
        }

        if (price === undefined) {
            console.error(`No price found for ${symbol}`)
            return null
        }

        // Update DB
        const updated = await (db as any).stock.update({
            where: { symbol: symbol },
            data: {
                currentPrice: price,
                marketCap: marketCap,
                peRatio: peRatio,
                roe: roe,
                lastUpdated: new Date()
            }
        })

        console.log(`Updated ${symbol}: ${price}`)
        return updated

    } catch (e) {
        console.error(`Error fetching price for ${symbol}:`, e)
        return null
    }
}

export async function updateFundamentals(symbol: string) {
    try {
        const stock = await (db as any).stock.findUnique({ where: { symbol } })
        if (!stock) return null

        // Try to get quote summary for fundamentals
        const summary = await yahooFinance.quoteSummary(symbol, {
            modules: ['incomeStatementHistory', 'balanceSheetHistory', 'earnings']
        })

        if (!summary) return null

        const income = summary.incomeStatementHistory?.incomeStatementHistory || []
        const balance = summary.balanceSheetHistory?.balanceSheetStatements || []
        const earnings = summary.earnings?.earningsChart?.quarterly || []

        // Map data by period (date string)
        for (const inc of income) {
            const date = new Date(inc.endDate)
            const quarter = Math.floor(date.getMonth() / 3) + 1
            const year = date.getFullYear()
            const period = `Q${quarter}/${year}`

            // Find matching balance statement
            const bal = balance.find(b => new Date(b.endDate).getTime() === date.getTime()) as any

            // Find publishing date (reportedDate) from earnings module
            // Support multiple formats: Q4/2024, 4Q2024, Q42024, etc.
            const earn = earnings.find((e: any) => {
                const eDate = e.date || e.fiscalQuarter || '';
                return eDate.includes(`${quarter}Q${year}`) ||
                    eDate.includes(`Q${quarter}/${year}`) ||
                    eDate.includes(`Q${quarter}${year}`) ||
                    eDate.includes(`${quarter}Q/${year}`);
            });

            const reportedDate = earn?.reportedDate || (earn as any)?.reportedDate;
            let publishedAt = reportedDate ? new Date((reportedDate as any) * 1000) : null;

            // PRIORITY 1: Manual overrides (exact dates)
            const manualDate = getManualOverrideDate(symbol, period)
            if (manualDate) {
                publishedAt = manualDate
            }
            // PRIORITY 2: Israeli stocks - Bizportal
            else if (symbol.endsWith('.TA')) {
                const isrDate = await getIsraeliReportDate(symbol, period)
                if (isrDate) {
                    publishedAt = isrDate
                }
            }

            // FINAL FALLBACK: Period end date
            if (!publishedAt) {
                publishedAt = calculatePeriodEndDate(period)
                if (symbol.endsWith('.TA')) {
                    console.log(`⚠️ ${symbol} ${period} - ADD TO report_dates_override.json`)
                }
            }

            await (db as any).financialRecord.upsert({
                where: {
                    stockId_period: {
                        stockId: stock.id,
                        period: period
                    }
                },
                update: {
                    revenue: (inc as any).totalRevenue,
                    netProfit: (inc as any).netIncome || (inc as any).netIncomeApplicableToCommonShares,
                    equity: bal?.totalStockholderEquity,
                    totalBalance: bal?.totalAssets,
                    publishedAt: publishedAt
                },
                create: {
                    stockId: stock.id,
                    period: period,
                    revenue: (inc as any).totalRevenue,
                    netProfit: (inc as any).netIncome || (inc as any).netIncomeApplicableToCommonShares,
                    equity: bal?.totalStockholderEquity,
                    totalBalance: bal?.totalAssets,
                    publishedAt: publishedAt
                }
            })
        }

        // Update lastUpdated on the stock model itself
        await (db as any).stock.update({
            where: { id: stock.id },
            data: { lastUpdated: new Date() }
        })

        console.log(`Updated fundamentals for ${symbol}`)
        return true
    } catch (e) {
        console.error(`Error updating fundamentals for ${symbol}:`, e)
        return null
    }
}

export async function updateAllStocksData() {
    console.log("Starting bulk data sync...")
    const stocks = await (db as any).stock.findMany({ select: { id: true, symbol: true } })

    let success = 0
    let failed = 0

    for (const stock of stocks) {
        try {
            await new Promise(r => setTimeout(r, 1000)) // 1s delay
            const priceRes = await updateStockPrice(stock.symbol)
            await updateFundamentals(stock.symbol)

            // Check for new reports on Bizportal as a fallback
            if (stock.symbol.endsWith('.TA')) {
                await checkForNewIsraeliReports(stock.symbol, stock.id)
            }

            if (priceRes) success++
            else failed++
        } catch (e) {
            failed++
        }
    }

    console.log(`Deep sync complete. Success: ${success}, Failed: ${failed}`)
}
