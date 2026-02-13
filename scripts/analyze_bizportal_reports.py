import requests
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def analyze_bizportal_reports():
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
        
        # Look for the table or list of reports
        # Common structure: <div class="reports_list"> or similar
        # Let's search for keywords and show context
        keywords = ["דוח", "רבעון", "2024", "2025"]
        for kw in keywords:
            matches = list(re.finditer(kw, html))
            print(f"Keyword '{kw}' found {len(matches)} times.")
            if matches:
                # Show context for the first few matches
                for m in matches[:3]:
                    start = max(0, m.start() - 100)
                    end = min(len(html), m.end() + 100)
                    print(f"Match at {m.start()}: ...{html[start:end]}...")
                    print("-" * 20)
                    
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    analyze_bizportal_reports()
