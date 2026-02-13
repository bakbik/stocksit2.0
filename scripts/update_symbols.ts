import db from '../src/lib/db'
import fs from 'fs'

async function main() {
    const mapping = JSON.parse(fs.readFileSync('tase_mapping.json', 'utf8'))
    const stocks = await db.stock.findMany()

    console.log(`Updating symbols for ${stocks.length} stocks...`)

    let updated = 0
    let skipped = 0

    for (const stock of stocks) {
        const idStr = stock.id.toString()
        const symbol = mapping[idStr]

        if (symbol) {
            const newSymbol = `${symbol}.TA`
            await db.stock.update({
                where: { id: stock.id },
                data: { symbol: newSymbol }
            })
            updated++
        } else {
            // console.log(`No mapping found for ID ${stock.id} (${stock.name})`)
            skipped++
        }
    }

    console.log(`Finished. Updated: ${updated}, Skipped: ${skipped}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
