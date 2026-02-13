
async function testMayaScheduled() {
    const endpoints = [
        'https://mayaapi.tase.co.il/api/corporateactions/financialscheduled',
        'https://mayaapi.tase.co.il/api/corporateactions/getfinancialscheduled',
        'https://mayaapi.tase.co.il/api/corporateactions/getfinancialschedule',
        'https://mayaapi.tase.co.il/api/reports/financialscheduled'
    ]

    const headers = {
        'accept': 'application/json, text/plain, */*',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'x-maya-with': 'True',
        'referer': 'https://www.tase.co.il/',
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)'
    }

    for (const url of endpoints) {
        try {
            console.log(`Testing: ${url}`)
            const response = await fetch(url, {
                method: 'GET', // Most list endpoints are GET
                headers: headers
            })

            console.log(`Status: ${response.status}`)
            if (response.status === 200) {
                const text = await response.text()
                console.log(`Data (first 200 chars): ${text.slice(0, 200)}`)
                break
            }
        } catch (e: any) {
            console.error(`Error for ${url}:`, e.message)
        }
    }
}

testMayaScheduled()
