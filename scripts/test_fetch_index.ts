
import * as cheerio from 'cheerio'

async function testFetchIndex(indexId: string) {
    const url = `https://www.bizportal.co.il/capitalmarket/indices/structure/${indexId}`
    console.log(`Fetching index structure: ${url}`)

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const html = await response.text()
        const $ = cheerio.load(html)

        // Find links to quotes
        // usually <a href="/capitalmarket/quote/general/1100957">

        let count = 0
        $('a').each((i, el) => {
            const href = $(el).attr('href')
            if (href && href.includes('/capitalmarket/quote/general/')) {
                // Extract ID
                const id = href.split('/').pop()
                const name = $(el).text().trim()
                if (id && /^\d+$/.test(id)) {
                    console.log(`Found: ${id} - ${name}`)
                    count++
                }
            }
        })
        console.log(`Total found: ${count}`)

    } catch (e) {
        console.error(e)
    }
}

testFetchIndex('333') // TA-35
