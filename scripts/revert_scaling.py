import sqlite3

# This script reverses the 1000x scaling for the 81 stocks identified earlier.
# This is a safe reset before we apply a more precise fix.
def revert_scaling():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # We only revert if marketCap is very high (to avoid double dividing if run twice)
    cursor.execute("""
        SELECT symbol, marketCap 
        FROM Stock 
        WHERE symbol LIKE '%.TA' 
        AND marketCap > 10000000000 -- Over 10 Billion (most over-scaled ones are in this range)
    """)
    stocks = cursor.fetchall()
    
    print(f"Reverting {len(stocks)} stocks...")
    for symbol, mkt in stocks:
        new_mkt = mkt / 1000
        cursor.execute("UPDATE Stock SET marketCap = ? WHERE symbol = ?", (new_mkt, symbol))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    revert_scaling()
