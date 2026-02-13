async function testMaya() {
    const url = 'https://mayaapi.tase.co.il/api/report/filter'
    const payload = {
        "CompanyId": [1390],
        "EventsFamilyIds": [100],
        "Page": 1
    }

    try {
        console.log('Fetching reports for Company ID 1390 with browser headers...')
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'pragma': 'no-cache',
                'sec-ch-ua': '\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '\"Windows\"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'x-maya-with': 'True',
                'Referer': 'https://maya.tase.co.il/',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.34 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.34'
            },
            body: JSON.stringify(payload)
        })

        console.log('Response Status:', response.status)
        const data = await response.json() as any

        if (data && data.Reports && data.Reports.length > 0) {
            console.log('Latest Report Found!')
            console.log('Title:', data.Reports[0].Subject)
            console.log('Raw Date:', data.Reports[0].PubDate)

            const pubDate = data.Reports[0].PubDate
            console.log('Extracted Date:', pubDate)
        } else {
            console.log('No reports found or unexpected structure:', JSON.stringify(data).slice(0, 500))
        }
    } catch (e: any) {
        console.error('Error fetching from Maya:', e.message)
    }
}

testMaya()
