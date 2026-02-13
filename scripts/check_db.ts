import db from '../src/lib/db'

async function main() {
    const count = await db.financialRecord.count()
    console.log(`Financial Records count: ${count}`)
    const sample = await db.financialRecord.findFirst()
    console.log('Sample record:', JSON.stringify(sample, null, 2))
}

main().finally(() => db.$disconnect())
