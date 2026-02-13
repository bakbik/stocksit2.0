import sqlite3
conn = sqlite3.connect('prisma/dev.db')
cursor = conn.cursor()
cursor.execute('UPDATE Stock SET marketCap = marketCap * 1000 WHERE symbol = "BBLS.TA" AND marketCap < 1000000')
print(f"Updated {cursor.rowcount} rows")
conn.commit()
conn.close()
