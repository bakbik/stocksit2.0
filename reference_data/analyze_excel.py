import pandas as pd
import json

try:
    df = pd.read_excel('c:/Users/sapir/Desktop/stocksit2.0/stocks_27_11_2025.xlsx')
    output = {
        'columns': df.columns.tolist(),
        'first_row': df.head(1).to_dict('records')[0] if not df.empty else {},
        'row_count': len(df)
    }
    
    with open('analysis.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, default=str, ensure_ascii=False, indent=2)
        
    print("Analysis complete. Saved to analysis.json")
except Exception as e:
    print(f"Error: {e}")
