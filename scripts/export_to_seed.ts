
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
dotenv.config({ path: path.join(__dirname, '..', '.env') })
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Exporting Database to Seed File ---')

    const stocks = await prisma.stock.findMany({
        include: {
            financials: true,
            returns: true
        }
    })

    console.log(`Found ${stocks.length} stocks to export.`)

    const outputPath = path.join(__dirname, '..', 'prisma', 'seed_data.json')

    // Clean up dates to ISO strings for JSON
    const cleanStocks = stocks.map(s => ({
        ...s,
        lastUpdated: s.lastUpdated.toISOString(),
        financials: s.financials.map(f => ({
            ...f,
            publishedAt: f.publishedAt ? f.publishedAt.toISOString() : null,
            createdAt: f.createdAt.toISOString()
        })),
        returns: s.returns
    }))

    fs.writeFileSync(outputPath, JSON.stringify(cleanStocks, null, 2))
    console.log(`Exported to ${outputPath}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
