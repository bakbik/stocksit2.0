async function searchMaya() {
    const url = 'https://mayaapi.tase.co.il/api/search/search'
    const q = '281014'

    try {
        console.log(`Searching for security ${q} on Maya...`)
        const fullUrl = `${url}?q=${q}`
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'x-maya-with': 'True',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
            }
        })

        console.log('Response Status:', response.status)
        const text = await response.text()
        try {
            const data = JSON.parse(text)
            console.log('Search Results:', JSON.stringify(data, null, 2).slice(0, 1000))
        } catch (je) {
            console.log('Not JSON. First 500 chars:', text.slice(0, 500))
        }
    } catch (e: any) {
        console.error('Error searching Maya:', e.message)
    }
}

searchMaya()
