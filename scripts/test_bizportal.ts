async function fetchBizportalReports(securityNum: string) {
    const url = `https://www.bizportal.co.il/capitalmarket/quote/reports/${securityNum}`
    try {
        console.log(`Fetching Bizportal reports for ${securityNum}...`)
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
            }
        })
        const html = await response.text()

        // Look for dates like DD/MM/YYYY or DD.MM.YYYY
        // Often inside a table or div with class related to reports
        const dateRegex = /\d{2}[\/\.]\d{2}[\/\.]\d{4}/g
        const matches = html.match(dateRegex)

        console.log('Detected dates in HTML:', matches?.slice(0, 10))

        // Find the report section
        if (html.includes('דוחות')) {
            console.log('Found "Reports" section in HTML')
            // I'll try to extract a specific row or link
        }

    } catch (e: any) {
        console.error('Error fetching Bizportal:', e.message)
    }
}

fetchBizportalReports('281014')
