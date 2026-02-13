import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.stock.count()
    console.log(`Total stocks: ${count}`)

    const formattedSymbol = '1100957.TA'
    const stock = await prisma.stock.findFirst({
        where: { symbol: formattedSymbol }
    })

    if (stock) {
        console.log(`Found stock: ${stock.name} (${stock.symbol})`)
    } else {
        console.log(`Stock ${formattedSymbol} NOT FOUND`)
        // List 5 samples
        const samples = await prisma.stock.findMany({ take: 5 })
        console.log('Samples:', samples.map(s => s.symbol))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
