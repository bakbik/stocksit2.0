import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function main() {
    const q = encodeURIComponent('אבגול')
    console.log(`Searching for encoded: ${q}`)
    try {
        const res = await yahooFinance.search('אבגול') // Try raw first again to be sure
        console.log("Raw worked!")
    } catch (e) {
        console.log("Raw failed.")
        try {
            const res = await yahooFinance.search(q)
            console.log("Encoded worked!")
            console.log(res.quotes[0])
        } catch (e2) {
            console.log("Encoded failed too.")
        }
    }
}

main()
