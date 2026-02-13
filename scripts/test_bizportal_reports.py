import requests
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def test_bizportal_reports():
    # Bizportal usually lists reports here
    url = "https://www.bizportal.co.il/capitalmarket/quote/reports/1100957"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        print(f"Fetching: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            html = response.text
            print(f"HTML Length: {len(html)}")
            
            # Look for dates
            dates = re.findall(r'(\d{2}[/.]\d{2}[/.]\d{4})', html)
            print(f"Dates found: {dates[:10]}")
            
            # Look for "דוח" (Report) or "רבעון" (Quarter)
            if "דוח" in html or "רבעון" in html:
                 print("✅ Found 'Report' or 'Quarter' text!")
        else:
            print(f"Failed. Text: {response.text[:200]}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_bizportal_reports()
