import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { calculateInvestmentMetrics } from '../src/lib/investment_logic';

async function debugMissingPE() {
    console.log('--- Detailed P/E Diagnostics ---');

    const stocks = await prisma.stock.findMany({
        where: { symbol: { endsWith: '.TA' } },
        include: { financials: true }
    });

    for (const s of stocks) {
        const metrics = calculateInvestmentMetrics(s, s.financials);
        if (metrics && metrics.peValue === null) {
            console.log(`${s.symbol.padEnd(10)} | ${s.name.slice(0, 15).padEnd(15)} | TTM: ${String(Math.round(metrics.last4QProfit / 1e3)).padStart(8)}k | Fwd: ${String(Math.round(metrics.expectedAnnualProfit / 1e3)).padStart(8)}k | mCap: ${Math.round(s.marketCap / 1e6)}M`);
        }
    }

    await prisma.$disconnect();
}

debugMissingPE();
