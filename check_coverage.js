
const fs = require('fs');
const path = require('path');

// Read JSON files directly
const seedDataPath = path.join(__dirname, 'prisma', 'seed_data.json');
const stockGroupsPath = path.join(__dirname, 'prisma', 'stock_groups.json');

const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
const stockGroups = JSON.parse(fs.readFileSync(stockGroupsPath, 'utf8'));

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
    if (found > 0 && groupName === 'TA35') {
        const foundSymbols = groupSymbols.filter(s => seedSymbols.has(s));
        console.log(`Found Symbols: ${foundSymbols.join(', ')}`);
    }
    console.log(`Missing coverage: ${((groupSymbols.length - found) / groupSymbols.length * 100).toFixed(1)}%`);

    if (missing.length > 0) {
        // console.log(`Missing symbols: ${missing.join(', ')}`);
    }
}
