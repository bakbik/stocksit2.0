import pandas as pd
import json
import re
import math

def clean_float(val):
    if pd.isna(val):
        return None
    if isinstance(val, str):
        # Handle "הפסד" or other strings
        try:
            return float(val.replace(',', ''))
        except ValueError:
            return None
    try:
        if math.isnan(val) or math.isinf(val):
            return None
        return float(val)
    except:
        return None

def main():
    try:
        df = pd.read_excel('reference_data/stocks_27_11_2025.xlsx')
        
        stocks_data = []
        
        # Financial columns mapping pattern
        # "Period Type" -> "English Field"
        # "סך מאזן" -> "totalBalance"
        # "הון עצמי" -> "equity"
        # "הכנסות" -> "revenue"
        # "רווח נקי" -> "netProfit"
        
        financial_map = {
            "סך מאזן": "totalBalance",
            "הון עצמי": "equity",
            "הכנסות": "revenue",
            "רווח נקי": "netProfit"
        }
        
        for _, row in df.iterrows():
            stock = {
                "id": int(row["מספר סידורי"]),
                "name": str(row["שם החברה"]),
                "symbol": f"{row['מספר סידורי']}.TA", # Default symbol for now
                "currentPrice": clean_float(row["שער מניה"]),
                "marketCap": clean_float(row["שווי שוק"]),
                "peRatio": clean_float(row["מכפיל רווח"]),
                "roe": clean_float(row["תשואה על ההון"]),
                "financials": [],
                "returns": []
            }
            
            # Returns
            returns_map = {
                "תשואות 3 חודשים": "3m",
                "תשואות 12 חודשים": "12m",
                "תשואות 3 שנים": "3y"
            }
            
            for col, period in returns_map.items():
                if col in row and not pd.isna(row[col]):
                    stock["returns"].append({
                        "period": period,
                        "value": clean_float(row[col])
                    })
            
            # Financials
            # Iterate through columns to find financial data
            # Pattern: "Period Metric" e.g., "Y/2024 סך מאזן"
            
            financials_dict = {} # Key: period, Value: dict of fields
            
            for col in df.columns:
                # Check if column starts with Y/XXXX or QX/XXXX
                match = re.match(r"^(Y/\d{4}|Q\d/\d{4})\s+(.+)$", str(col))
                if match:
                    period = match.group(1)
                    metric_hebrew = match.group(2)
                    
                    if metric_hebrew in financial_map:
                        metric_english = financial_map[metric_hebrew]
                        val = clean_float(row[col])
                        
                        if period not in financials_dict:
                            financials_dict[period] = {"period": period}
                        
                        if val is not None:
                             financials_dict[period][metric_english] = val

            for period, data in financials_dict.items():
                # Only add if at least one metric is present
                if len(data) > 1:
                    stock["financials"].append(data)
            
            stocks_data.append(stock)
            
        with open('prisma/seed_data.json', 'w', encoding='utf-8') as f:
            json.dump(stocks_data, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully converted {len(stocks_data)} stocks to prisma/seed_data.json")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
