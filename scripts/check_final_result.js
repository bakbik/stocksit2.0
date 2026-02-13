const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkResult() {
    const symbol = 'AVGL.TA'
    const stock = await prisma.stock.findUnique({
        where: { symbol },
        include: { financials: true }
    })

    if (stock) {
        console.log(`Results for ${symbol}:`)
        stock.financials.sort((a, b) => b.period.localeCompare(a.period)).forEach(f => {
            console.log(`${f.period}: PublishedAt: ${f.publishedAt}`)
        })
    } else {
        console.log('Stock not found.')
    }
    await prisma.$disconnect()
}

checkResult()
