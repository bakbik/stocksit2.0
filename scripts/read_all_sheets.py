
import pandas as pd
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def read_all_sheets(file_path):
    try:
        xl = pd.ExcelFile(file_path, engine='openpyxl')
        for sheet_name in xl.sheet_names:
            print(f"\n--- Reading sheet: {sheet_name} ---")
            df = pd.read_excel(file_path, sheet_name=sheet_name, engine='openpyxl')
            print(f"Shape: {df.shape}")
            print(f"Columns: {df.columns.tolist()[:10]}")
            print(f"First 3 rows:\n{df.head(3).to_string()}")
            
            # Save each sheet to a temp json
            data = df.to_dict(orient='records')
            def sanitize(obj):
                if isinstance(obj, float) and pd.isna(obj): return None
                return obj
            sanitized_data = [{str(k): sanitize(v) for k, v in row.items()} for row in data]
            
            # Use safe filename
            safe_name = "".join([c for c in sheet_name if c.isalnum() or c in (' ', '_')]).rstrip()
            output_path = f'scripts/excel_{safe_name}_temp.json'
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(sanitized_data, f, ensure_ascii=False, indent=2)
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    file_path = r"c:\Users\sapir\Desktop\stocksit2.0\reference_data\פעולות בגיליון מניות היתר ברבעון שלישי.xlsx"
    read_all_sheets(file_path)
