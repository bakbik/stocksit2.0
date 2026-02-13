import sqlite3
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

def run_audit():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # Audit 1: Implied Share Count (Mkt Cap / Price)
    # Most public companies have > 1,000,000 shares. 
    # Values < 100,000 are suspicious for public TASE stocks (thousands mismatch).
    cursor.execute("""
        SELECT symbol, name, marketCap, currentPrice, (marketCap / currentPrice) as shares
        FROM Stock 
        WHERE symbol LIKE '%.TA' AND currentPrice > 0 AND marketCap > 0
        AND (marketCap / currentPrice) < 100000
    """)
    suspicious_mkt_cap = cursor.fetchall()

    # Audit 2: Extreme Potentials
    # Since we don't have the full investment logic in SQL, we'll look for 
    # raw data discrepancies: Mkt Cap vs Revenue or Profit.
    # Case A: Market Cap is huge but Revenue/Profit in DB is tiny (financials missing thousands multiplier).
    # Case B: Market Cap is tiny but Revenue/Profit in DB is huge (market cap missing thousands multiplier).
    cursor.execute("""
        SELECT s.symbol, s.name, s.marketCap, MAX(f.revenue) * 1000 as max_rev_absolute
        FROM Stock s
        JOIN FinancialRecord f ON s.id = f.stockId
        WHERE s.symbol LIKE '%.TA' 
        AND s.marketCap > 0
        GROUP BY s.symbol
        HAVING (s.marketCap / max_rev_absolute > 1000) OR (max_rev_absolute / s.marketCap > 1000)
    """)
    suspicious_scaling = cursor.fetchall()

    # Audit 3: Missing Financials
    # Stocks with no financial records in the last year
    cursor.execute("""
        SELECT symbol, name 
        FROM Stock s
        WHERE symbol LIKE '%.TA'
        AND NOT EXISTS (
            SELECT 1 FROM FinancialRecord f 
            WHERE f.stockId = s.id 
            AND (f.period LIKE '%/2024' OR f.period LIKE '%/2025')
        )
    """)
    missing_financials = cursor.fetchall()

    # Audit 4: Inconsistent P/E
    # Where s.peRatio is very different from (Market Cap / Last 4Q Profit)
    # This might indicate wrong P/E from source or wrong logic.
    cursor.execute("""
        SELECT s.symbol, s.name, s.peRatio, (s.marketCap / (SUM(f.netProfit) * 1000)) as calc_pe
        FROM Stock s
        JOIN FinancialRecord f ON s.id = f.stockId
        WHERE s.symbol LIKE '%.TA'
        AND f.period LIKE 'Q%/2024' -- Simplified TTM
        AND s.peRatio > 0
        AND s.marketCap > 0
        GROUP BY s.symbol
        HAVING ABS(s.peRatio - calc_pe) > (s.peRatio * 2)
    """)
    inconsistent_pe = cursor.fetchall()

    results = {
        "suspicious_mkt_cap_shares": suspicious_mkt_cap,
        "suspicious_scaling_mismatch": suspicious_scaling,
        "missing_recent_financials": missing_financials,
        "inconsistent_pe_vs_calc": inconsistent_pe
    }
    
    print(json.dumps(results, indent=2, ensure_ascii=False))
    conn.close()

if __name__ == "__main__":
    run_audit()
