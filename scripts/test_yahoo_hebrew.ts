
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

async function test() {
    console.log('Searching Yahoo for "ג\'י סיטי"...')
    try {
        const res = await yahooFinance.search("ג'י סיטי")
        console.log(res.quotes.slice(0, 3))
    } catch (e) {
        console.error(e)
    }
}

test()
