
import * as cheerio from 'cheerio'
import db from '../src/lib/db'

async function check() {
    const stocks = await db.stock.findMany({
        where: { symbol: { endsWith: '.TA' } }
    })

    const numericStocks = stocks.filter(s => {
        const base = s.symbol.replace('.TA', '')
        return /^\d+$/.test(base)
    })

    console.log(`Extracting names for ${numericStocks.length} stocks...`)

    for (const stock of numericStocks) {
        const id = stock.symbol.replace('.TA', '')
        const url = `https://www.bizportal.co.il/capitalmarket/quote/general/${id}`
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
            })
            const html = await response.text()
            const $ = cheerio.load(html)
            const title = $('h1').text().trim() || $('title').text().trim()
            console.log(`${id}: ${title}`)
        } catch (e) {
            console.error(`Error for ${id}:`, e)
        }
        await new Promise(r => setTimeout(r, 1000))
    }
}

check()
