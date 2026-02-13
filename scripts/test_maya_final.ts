async function testMayaFinal() {
    const url = 'https://mayaapi.tase.co.il/api/report/filter'
    const payload = {
        "CompanyId": [1390],
        "EventsFamilyIds": [100],
        "Page": 1
    }

    try {
        console.log('Fetching reports for Company ID 1390 with LEGACY headers...')
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'x-maya-with': 'True',
                'referer': 'https://www.tase.co.il/',
                'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)'
            },
            body: JSON.stringify(payload)
        })

        console.log('Response Status:', response.status)
        const text = await response.text()
        try {
            const data = JSON.parse(text)
            if (data && data.Reports && data.Reports.length > 0) {
                console.log('SUCCESS! Latest Report:', data.Reports[0].PubDate)
                console.log('Subject:', data.Reports[0].Subject)
            } else {
                console.log('No reports or empty response.')
            }
        } catch (e) {
            console.log('Not JSON. Start:', text.slice(0, 200))
        }
    } catch (e: any) {
        console.error('Error:', e.message)
    }
}

testMayaFinal()
