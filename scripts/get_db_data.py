import sqlite3
import json
import sys

import sys

sys.stdout.reconfigure(encoding='utf-8')

def get_stock_data(symbol):
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # Get stock info
    cursor.execute("SELECT * FROM Stock WHERE symbol = ?", (symbol,))
    stock_raw = cursor.fetchone()
    if not stock_raw:
        print(f"Stock {symbol} not found")
        return

    # Get column names for stock
    cursor.execute("PRAGMA table_info(Stock)")
    stock_cols = [c[1] for c in cursor.fetchall()]
    stock = dict(zip(stock_cols, stock_raw))

    # Get financials
    cursor.execute("SELECT * FROM FinancialRecord WHERE stockId = ? ORDER BY period DESC", (stock['id'],))
    fin_raws = cursor.fetchall()
    
    cursor.execute("PRAGMA table_info(FinancialRecord)")
    fin_cols = [c[1] for c in cursor.fetchall()]
    financials = [dict(zip(fin_cols, f)) for f in fin_raws]

    print(json.dumps({'stock': stock, 'financials': financials}, indent=2, ensure_ascii=False))
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_stock_data(sys.argv[1])
    else:
        get_stock_data('AVGL.TA')
