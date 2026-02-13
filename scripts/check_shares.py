import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

def check_shares():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT symbol, name, marketCap, currentPrice
        FROM Stock 
        WHERE symbol LIKE '%.TA' 
        AND marketCap < 2000000
        AND marketCap > 0
    """)
    rows = cursor.fetchall()
    print("Symbol | Name | Mkt Cap | Price | Implied Shares")
    for symbol, name, mkt, prc in rows:
        shares = mkt / prc if prc and prc > 0 else 0
        print(f"{symbol} | {name} | {mkt} | {prc} | {shares:,.0f}")
    conn.close()

if __name__ == "__main__":
    check_shares()
