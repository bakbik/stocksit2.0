import requests
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def analyze_bizportal_publication_dates():
    # Avgol reports page
    url = "https://www.bizportal.co.il/capitalmarket/quote/reports/1100957"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"Failed: {response.status_code}")
            return
            
        html = response.text
        
        # Search for "פרסום" (Publication)
        # Search for date patterns like DD/MM/YYYY
        date_pattern = r'(\d{2}[/.]\d{2}[/.]\d{4})'
        matches = list(re.finditer(r'פרסום', html))
        print(f"Keyword 'פרסום' found {len(matches)} times.")
        
        for m in matches:
             start = max(0, m.start() - 100)
             end = min(len(html), m.end() + 100)
             print(f"Context: ...{html[start:end]}...")
             
             # Check for dates in this context
             sub_dates = re.findall(date_pattern, html[start:end])
             if sub_dates:
                 print(f"Dates found in context: {sub_dates}")
             print("-" * 20)
             
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    analyze_bizportal_publication_dates()
