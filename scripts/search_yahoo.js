
const yahooFinance = require('yahoo-finance2').default;

async function search() {
    const ids = ['2530185', '1081819', '1164920', '315018', '600023'];

    console.log('Searching Yahoo Finance for IDs...');
    for (const id of ids) {
        try {
            const result = await yahooFinance.search(id);
            console.log(`\nResults for ${id}:`);
            if (result.quotes && result.quotes.length > 0) {
                result.quotes.forEach(q => {
                    console.log(`- ${q.symbol} (${q.shortname || q.longname}) [${q.exchange}]`);
                });
            } else {
                console.log('No results found.');
            }
        } catch (e) {
            console.error(`Error searching ${id}:`, e.message);
        }
    }
}

search();
