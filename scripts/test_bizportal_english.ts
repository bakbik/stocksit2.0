
import * as cheerio from 'cheerio'

async function check() {
    const id = '126011'
    const url = `https://www.bizportal.co.il/capitalmarket/quote/general/${id}`
    console.log(`Fetching ${url}...`)

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    })

    const html = await response.text()
    const $ = cheerio.load(html)

    // Look for English name or symbol
    // Usually in some meta tag or specific div
    console.log('Title:', $('title').text())
    console.log('H1:', $('h1').text())

    // Sometimes there is a field "שם באנגלית" (Name in English) or "סימול" (Symbol)
    $('.paper-info-list li, table tr, .info-row').each((i, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ')
        if (text.includes('אנגלית') || text.includes('סימול') || /^[A-Za-z0-9]+$/.test(text)) {
            console.log('Match:', text)
        }
    })

    // Check script tags for JSON data
    $('script').each((i, el) => {
        const text = $(el).html() || ''
        if (text.includes('symbol') || text.includes('englishName')) {
            // Find English words in JSON
            const match = text.match(/"[a-zA-Z\s]+"/g)
            if (match) {
                // console.log('Potential English names in Script:', match.join(', '))
            }
        }
    })
}

check()
