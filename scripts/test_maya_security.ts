
async function test() {
    const id = '126011' // Numeric ID
    const url = `https://mayaapi.tase.co.il/api/company/details?companyId=${id}`
    console.log(`Fetching ${url}...`)

    const headers = {
        "Cache-Control": "no-cache",
        "referer": "https://www.tase.co.il/",
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)",
        "X-Maya-With": "True",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try {
        const res = await fetch(url, { headers })
        const data = await res.json()
        console.log("English Name:", data.EnglishName)
        console.log("Symbol:", data.Symbol)
    } catch (e) {
        console.log('Direct details failed, trying search...')
        const query = `https://mayaapi.tase.co.il/api/company/search?query=${id}`
        const res2 = await fetch(query, { headers })
        const data2 = await res2.json()
        console.log(JSON.stringify(data2, null, 2))
    }
}

test()
