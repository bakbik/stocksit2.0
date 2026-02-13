import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkStock(symbol: string) {
    const stock = await prisma.stock.findFirst({
        where: { symbol },
        include: { financials: true }
    });

    if (!stock) {
        console.log(`Stock ${symbol} not found.`);
        return;
    }

    console.log(`Stock: ${stock.name} (${stock.symbol})`);
    console.log(`Market Cap: ${stock.marketCap}`);
    console.log(`Reported PE: ${stock.peRatio}`);
    console.log('\n--- Financials ---');

    const sorted = stock.financials.sort((a, b) => {
        const parse = (p: string) => {
            const [q, y] = p.split('/');
            return parseInt(y) * 10 + (q.startsWith('Q') ? parseInt(q.slice(1)) : 5);
        };
        return parse(b.period) - parse(a.period);
    });

    for (const fin of sorted) {
        console.log(`${fin.period.padEnd(8)} | Revenue: ${String(fin.revenue).padEnd(10)} | Profit: ${String(fin.netProfit).padEnd(10)} | Assets: ${fin.totalBalance}`);
    }

    await prisma.$disconnect();
}

checkStock(process.argv[2] || 'TDRN.TA');
