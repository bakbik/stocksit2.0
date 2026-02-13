import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

def bulk_normalize_mkt_cap():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # Select stocks where implied shares are < 100,000
    # (Excluding extreme low prices to avoid false positives, though TASE prices are usually high)
    cursor.execute("""
        SELECT symbol, name, marketCap, currentPrice
        FROM Stock 
        WHERE symbol LIKE '%.TA' 
        AND currentPrice > 0 
        AND marketCap > 0
        AND (marketCap / currentPrice) < 100000
    """)
    stocks = cursor.fetchall()
    
    print(f"Repairing {len(stocks)} stocks...")
    for symbol, name, mkt, prc in stocks:
        new_mkt = mkt * 1000
        cursor.execute("UPDATE Stock SET marketCap = ? WHERE symbol = ?", (new_mkt, symbol))
        print(f"  [FIXED] {symbol} ({name}): {mkt:,.0f} -> {new_mkt:,.0f} (Shares: {new_mkt/prc:,.0f})")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    bulk_normalize_mkt_cap()
