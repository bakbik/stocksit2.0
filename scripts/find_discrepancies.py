import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

def find_suspicious():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # Stocks with market cap < 2M ILS but have financial records with > 1M ILS revenue/profit
    # Since financials are in thousands, 1M ILS absolute = 1000 in DB
    cursor.execute("""
        SELECT s.symbol, s.name, s.marketCap, MAX(f.revenue) as max_rev
        FROM Stock s
        JOIN FinancialRecord f ON s.id = f.stockId
        WHERE s.symbol LIKE '%.TA' 
        AND s.marketCap < 2000000
        AND s.marketCap > 0
        GROUP BY s.symbol
        HAVING max_rev > 100
    """)
    rows = cursor.fetchall()
    print("Suspicious Stocks (Low Mkt Cap vs Financials):")
    for row in rows:
        print(row)
    conn.close()

if __name__ == "__main__":
    find_suspicious()
