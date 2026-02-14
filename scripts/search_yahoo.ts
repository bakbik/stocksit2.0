
import yahooFinance from 'yahoo-finance2';

async function search() {
    const ids = ['2530185', '1081819', '1164920', '315018', '600023'];

    for (const id of ids) {
        console.log(`\nSearching for ${id}...`);
        try {
            const result = await yahooFinance.search(id);
            console.log(JSON.stringify(result, null, 2));
        } catch (e) {
            console.error(`Error searching ${id}:`, e);
        }
    }
}

search();
