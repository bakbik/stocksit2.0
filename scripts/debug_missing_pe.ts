import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { calculateInvestmentMetrics } from '../src/lib/investment_logic';

async function debugMissingPE() {
    console.log('--- Missing P/E Diagnostics ---');

    const stocks = await prisma.stock.findMany({
        include: {
            financials: true,
            returns: true,
            groups: true
        }
    });

    const missing = stocks.filter(s => {
        const metrics = calculateInvestmentMetrics(s, s.financials);
        return !metrics || metrics.peValue === null;
    });

    console.log(`Found ${missing.length} stocks with missing or invalid metrics.`);
    console.log('-------------------------------');

    for (const s of missing.slice(0, 50)) {
        const metrics = calculateInvestmentMetrics(s, s.financials);

        let reason = 'Unknown';
        if (!s.symbol.endsWith('.TA')) {
            reason = 'Non-Tel Aviv Stock (Filter)';
        } else if (metrics && metrics.last4QProfit <= 0 && metrics.expectedAnnualProfit <= 0) {
            reason = 'Negative/Zero Profit (TTM & Fwd)';
        } else if (s.financials.length === 0) {
            reason = 'No Financial Data';
        } else if (!s.marketCap) {
            reason = 'Missing Market Cap';
        } else if (s.peRatio && (s.peRatio <= 0 || s.peRatio > 1000)) {
            reason = `Invalid Reported PE (${s.peRatio})`;
        } else if (!metrics) {
            reason = 'Investment Logic returned null (Data Gap)';
        }

        console.log(`${s.symbol.padEnd(10)} | ${s.name.slice(0, 20).padEnd(20)} | mCap: ${s.marketCap ? (s.marketCap / 1e6).toFixed(1) + 'M' : 'MISSING'} | Reason: ${reason}`);
    }

    if (missing.length > 50) console.log('...');

    // Check for "Scale Protection" false positives
    console.log('\n--- Scale Protection Audit ---');
    for (const s of stocks) {
        const metrics = calculateInvestmentMetrics(s, s.financials);
        if (metrics && s.marketCap && metrics.last4QProfit > 0) {
            const rawPE = s.marketCap / metrics.last4QProfit;
            if (rawPE > 1000 && metrics.peValue === null) {
                console.log(`${s.symbol} - Scale Protection triggered (Raw PE: ${rawPE.toFixed(1)}). Profit: ${metrics.last4QProfit}`);
            }
        }
    }

    await prisma.$disconnect();
}

debugMissingPE();
