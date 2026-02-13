import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

def find_candidates():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # Simple query for stocks with PE 2-40 and positive market cap
    cursor.execute("""
        SELECT symbol, name, marketCap, peRatio 
        FROM Stock 
        WHERE symbol LIKE '%.TA' 
        AND peRatio >= 2 
        AND peRatio <= 40
        LIMIT 20
    """)
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    conn.close()

if __name__ == "__main__":
    find_candidates()
