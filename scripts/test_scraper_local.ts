
import * as fs from 'fs'
import * as cheerio from 'cheerio'

function testScraper() {
    console.log('Reading dump file: bizportal_full.html')
    const html = fs.readFileSync('bizportal_full.html', 'utf-8')
    const $ = cheerio.load(html)

    console.log('Title:', $('title').text().trim())

    let price = 0
    let marketCap = 0

    const wrap = $('.paper_data_wrap')
    console.log(`Found ${wrap.length} .paper_data_wrap elements`)
    if (wrap.length > 0) {
        console.log('Wrap text (first 200 chars):', wrap.text().trim().substring(0, 200))
        console.log('Wrap HTML (first 200 chars):', wrap.html()?.substring(0, 200))
    }

    const dts = $('.paper_data_wrap dl dt')
    console.log(`Found ${dts.length} DT elements inside wrap`)

    // Fallback debug: print ALL dt elements
    const allDts = $('dt')
    console.log(`Found ${allDts.length} total DT elements on page`)
    allDts.slice(0, 5).each((i, el) => {
        console.log(`Generic DT: ${$(el).text().trim()}`)
    })

    $('.paper_data_wrap dl dt').each((i, el) => {
        const label = $(el).text().trim()
        const val = $(el).next('dd').text().trim()
        console.log(`DT: "${label}" -> DD: "${val}"`)
    })

    $('.paper_data_wrap dl dt').each((i, el) => {
        const label = $(el).text().trim()
        const valueEl = $(el).next('dd')
        const valueText = valueEl.text().trim().replace(/,/g, '')

        if (label.includes('שער בסיס') || label === 'שער' || label.includes('שער אחרון')) {
            console.log(`Found Price Label: ${label}, Value: ${valueText}`)
            const val = parseFloat(valueText)
            if (!isNaN(val)) price = val
        }
    })

    // 3. Market Cap
    $('li').each((i, el) => {
        const label = $(el).find('label').text()
        if (label.includes('שווי שוק')) {
            const valText = $(el).find('span.num').text().trim().replace(/,/g, '')
            console.log(`Found Market Cap Label (li): ${label}, Value: ${valText}`)
            const val = parseFloat(valText)
            if (!isNaN(val)) {
                marketCap = val * 1000
            }
        }
    })

    $('.paper_data_wrap dl dt').each((i, el) => {
        const label = $(el).text().trim()
        if (label.includes('שווי שוק')) {
            const valueText = $(el).next('dd').text().trim().replace(/,/g, '')
            console.log(`Found Market Cap Label (dl): ${label}, Value: ${valueText}`)
            const val = parseFloat(valueText)
            if (!isNaN(val)) {
                marketCap = val * 1000
            }
        }
    })

    console.log('--- Result ---')
    console.log(`Price: ${price}`)
    console.log(`Market Cap: ${marketCap}`)
}

testScraper()
