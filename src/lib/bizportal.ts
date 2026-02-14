
import * as cheerio from 'cheerio'

export interface BizportalQuote {
    name: string
    price: number // Absolute ILS (not Agorot)
    marketCap: number // Absolute ILS
    period: string | null
    changePercent: number
    change?: number
}

export async function getBizportalQuote(stockId: string): Promise<BizportalQuote | null> {
    const url = `https://www.bizportal.co.il/capitalmarket/quote/general/${stockId}`
    console.log(`[Bizportal] Fetching ${stockId}...`)

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 0 } // No cache
        })

        if (!response.ok) {
            console.error(`[Bizportal] Failed to fetch ${stockId}: ${response.status}`)
            return null
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // 1. Check for Redirect/Search Page
        const pageTitle = $('title').text().trim()
        if (pageTitle.includes('חיפוש')) {
            console.warn(`[Bizportal] ID ${stockId} redirects to Search (Invalid ID)`)
            return null
        }

        // 2. Name
        // Usually in <h1> or .quote-header class
        let name = $('h1').text().trim()

        // Cleanup name (remove " - גיוס הון" etc)
        name = name.split('-')[0].trim()

        // 3. Price (שער אחרון/בסיס)
        let price = 0
        let marketCap = 0
        let changePercent = 0

        $('.paper_data_wrap dl dt').each((i, el) => {
            const label = $(el).text().trim()
            const valueEl = $(el).next('dd')
            const valueText = valueEl.text().trim().replace(/,/g, '')

            if (label.includes('שער בסיס') || label === 'שער') {
                const val = parseFloat(valueText)
                // We keep base price to calculate change if needed
            }
            // Live price might be in "שער אחרון" or just the big number
            if (label.includes('שער אחרון')) {
                const val = parseFloat(valueText)
                if (!isNaN(val)) price = val
            }
        })

        // 3.5 Extract Change Percent directly from header
        const changePercentText = $('#paper_change .num').text().replace('%', '').trim()
        changePercent = parseFloat(changePercentText) || 0

        // If price is still 0, try the main header price
        if (price === 0) {
            const headerPriceText = $('#paper_rate .num').text().replace(/,/g, '').trim()
            price = parseFloat(headerPriceText) || 0
        }

        // Calculate change value (approximate based on percent if base not found, or explicit)
        // Bizportal doesn't always show the absolute change value clearly in the header, 
        // but we can compute it if we have the previous close.
        // For now, let's rely on the percent.
        let change = 0
        if (price > 0 && changePercent !== 0) {
            const previousPrice = price / (1 + changePercent / 100)
            change = price - previousPrice
        }

        // 4. Market Cap
        // Try LI list first
        $('li').each((i, el) => {
            const label = $(el).find('label').text()
            if (label.includes('שווי שוק')) {
                const valText = $(el).find('span.num').text().trim().replace(/,/g, '')
                const val = parseFloat(valText)
                if (!isNaN(val)) {
                    marketCap = val * 1000
                }
            }
        })

        // Fallback: Check DL list if LI didn't find it
        if (marketCap === 0) {
            $('.paper_data_wrap dl dt').each((i, el) => {
                const label = $(el).text().trim()
                if (label.includes('שווי שוק')) {
                    const valueText = $(el).next('dd').text().trim().replace(/,/g, '')
                    const val = parseFloat(valueText)
                    if (!isNaN(val)) {
                        marketCap = val * 1000
                    }
                }
            })
        }

        if (price === 0) {
            console.error(`[Bizportal] Could not find price for ${stockId}`)
            return null
        }

        return {
            name,
            price: price / 100, // Bizportal is usually in Agorot -> Convert to ILS
            marketCap,
            period: null, // Scraper doesn't get financial period right now
            changePercent,
            change
        }

    } catch (e) {
        console.error(`[Bizportal] Error scraping ${stockId}:`, e)
        return null
    }
}
