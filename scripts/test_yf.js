const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();

async function test() {
    try {
        const result = await yf.fundamentalsTimeSeries('AAPL', {
            period1: '2022-01-01',
            module: 'financials',
            type: 'annualTotalRevenue'
        });
        console.log(JSON.stringify(result, null, 2));
        console.log('Result keys:', Object.keys(result));
    } catch (err) {
        console.error('Error fetching data:', err.message);
    }
}

test();
