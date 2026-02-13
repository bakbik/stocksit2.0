import sqlite3
conn = sqlite3.connect('prisma/dev.db')
cursor = conn.cursor()

# Bulk fix for Israeli stocks with suspiciously low market cap and low implied shares
# Threshold: < 10M Cap AND < 50k Shares
cursor.execute("""
    UPDATE Stock 
    SET marketCap = marketCap * 1000 
    WHERE symbol LIKE '%.TA' 
    AND marketCap < 10000000
    AND (marketCap / currentPrice) < 50000
""")
print(f"Bulk Updated {cursor.rowcount} rows")
conn.commit()
conn.close()
