import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listStocks() {
    const stocks = await prisma.stock.findMany({
        take: 50,
        select: { symbol: true, name: true, peRatio: true }
    });
    console.log(JSON.stringify(stocks, null, 2));
    await prisma.$disconnect();
}

listStocks();
