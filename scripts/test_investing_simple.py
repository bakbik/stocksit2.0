import requests
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def test_investing_simple():
    url = "https://il.investing.com/equities/avgol-ind-earnings"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "he,en-US;q=0.9,en;q=0.8",
        # Only gzip/deflate, avoiding br if possible
        "Accept-Encoding": "gzip, deflate"
    }

    try:
        print(f"Fetching: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            html = response.text
            print(f"HTML Length: {len(html)}")
            
            # Check for the user's string
            if "פרסום אחרון" in html:
                print("✅ SUCCESS! Found 'פרסום אחרון'")
                idx = html.find("פרסום אחרון")
                print(f"Context: {html[idx:idx+200]}")
            else:
                 print("Keyword not found. Checking for any dates...")
                 dates = re.findall(r'(\d{2}[/.]\d{2}[/.]\d{4})', html)
                 print(f"Dates: {dates[:10]}")
        else:
            print(f"Failed. Text start: {response.text[:200]}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_investing_simple()
