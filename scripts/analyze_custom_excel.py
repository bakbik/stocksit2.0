
import pandas as pd
import json
import os
import sys

# Set encoding for print statements to handle Hebrew
sys.stdout.reconfigure(encoding='utf-8')

def analyze_excel(file_path):
    try:
        # Load the Excel file
        # Using openpyxl engine
        xl = pd.ExcelFile(file_path, engine='openpyxl')
        sheet_names = xl.sheet_names
        last_sheet = sheet_names[-1]
        
        # We'll avoid printing sheet names if they cause issues, or just print a success message
        print(f"File loaded successfully. Total sheets: {len(sheet_names)}")
        print(f"Processing sheet: {last_sheet}")
        
        # Read the last sheet
        df = pd.read_excel(file_path, sheet_name=last_sheet, engine='openpyxl')
        
        # Convert all columns to strings to avoid serialization issues
        df_display = df.copy()
        for col in df_display.columns:
            df_display[col] = df_display[col].astype(str)
            
        print(f"Columns found: {len(df.columns)}")
        
        # Save to JSON
        data = df.to_dict(orient='records')
        
        # Handle NaN values which are not JSON serializable
        def sanitize(obj):
            if isinstance(obj, float):
                if pd.isna(obj): return None
            return obj

        sanitized_data = []
        for row in data:
            sanitized_row = {str(k): sanitize(v) for k, v in row.items()}
            sanitized_data.append(sanitized_row)

        output_path = 'scripts/excel_data_temp.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(sanitized_data, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully saved {len(sanitized_data)} rows to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    file_path = r"c:\Users\sapir\Desktop\stocksit2.0\reference_data\פעולות בגיליון מניות היתר ברבעון שלישי.xlsx"
    analyze_excel(file_path)
