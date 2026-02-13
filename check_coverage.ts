
import fs from 'fs';
import seedData from './prisma/seed_data.json';
import stockGroups from './prisma/stock_groups.json';

const seedSymbols = new Set(seedData.map(s => s.symbol));

console.log(`Total stocks in seed data: ${seedData.length}`);

for (const [groupName, groupSymbols] of Object.entries(stockGroups)) {
    let found = 0;
    let missing = [];

    for (const sym of groupSymbols) {
        if (seedSymbols.has(sym)) {
            found++;
        } else {
            missing.push(sym);
        }
    }

    console.log(`\nGroup: ${groupName}`);
    console.log(`Expected: ${groupSymbols.length}`);
    console.log(`Found in Seed: ${found}`);
    console.log(`Missing coverage: ${((groupSymbols.length - found) / groupSymbols.length * 100).toFixed(1)}%`);
}
