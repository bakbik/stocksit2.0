import sqlite3

def resync_units():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # Selecting all Israeli stocks
    cursor.execute("SELECT symbol, currentPrice, marketCap FROM Stock WHERE symbol LIKE '%.TA'")
    stocks = cursor.fetchall()
    
    print(f"Checking units for {len(stocks)} stocks...")
    updated_count = 0
    
    for symbol, price, mkt in stocks:
        if not price or price <= 0: continue
        
        # 1. Fix Price (Assume it was in Agorot if > 2000 and marketCap looks like millions)
        # Actually, most TASE stocks are currently stored in Agorot in our DB.
        # Safe detection: If price > 1000, it's almost certainly Agorot.
        # But even low prices like 50 might be Agorot (0.5 ILS).
        
        # Let's apply the rule: All TASE stocks in our DB currently have Agorot prices 
        # because we never divided by 100 before.
        new_price = price / 100
        
        # 2. Fix Market Cap
        # Use the same logic as sync.ts: impliedShares < 500,000
        implied_shares = mkt / new_price
        new_mkt = mkt
        if implied_shares < 500000:
            new_mkt = mkt * 1000
            print(f"  [FIXED MKT] {symbol}: Implied shares {implied_shares:,.0f} -> Scaling Mkt Cap")
            
        cursor.execute("UPDATE Stock SET currentPrice = ?, marketCap = ? WHERE symbol = ?", (new_price, new_mkt, symbol))
        updated_count += 1
        
    conn.commit()
    conn.close()
    print(f"Finished. Updated {updated_count} stocks.")

if __name__ == "__main__":
    resync_units()
