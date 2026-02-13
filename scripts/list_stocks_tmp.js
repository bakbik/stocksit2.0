const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function searchStocks() {
    try {
        const stocks = await prisma.stock.findMany({
            where: {
                symbol: {
                    contains: 'ICL'
                }
            }
        })
        console.log(JSON.stringify(stocks, null, 2))
    } catch (err) {
        console.error(err)
    } finally {
        await prisma.$disconnect()
    }
}

searchStocks()
