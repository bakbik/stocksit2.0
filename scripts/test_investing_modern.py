import requests
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def test_investing_modern():
    url = "https://il.investing.com/equities/avgol-ind-earnings"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "max-age=0",
        "Referer": "https://www.google.com/",
        "DNT": "1",
        "Upgrade-Insecure-Requests": "1"
    }

    try:
        session = requests.Session()
        print(f"Fetching: {url} with MODERN headers...")
        response = session.get(url, headers=headers, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            html = response.text
            print(f"HTML Length: {len(html)}")
            
            # Search for the user's specific text: "פרסום אחרון"
            if "פרסום אחרון" in html:
                print("✅ Found 'פרסום אחרון'!")
                idx = html.find("פרסום אחרון")
                print(f"Context: {html[idx:idx+100]}")
            
            # Simple date match
            dates = re.findall(r'(\d{2}\.\d{2}\.\d{4})', html)
            print(f"Dates found: {dates[:10]}")
        else:
            print(f"Still blocked or failed. Content start: {response.text[:200]}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_investing_modern()
