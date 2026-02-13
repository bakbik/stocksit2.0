import requests
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Test Investing.com for Avgol
url = "https://il.investing.com/equities/avgol-ind-earnings"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

response = requests.get(url, headers=headers)
html = response.text

print(f"Status: {response.status_code}")
print(f"HTML Length: {len(html)}\n")

# Look for "פרסום אחרון" (Last Publication)
if "פרסום אחרון" in html or "Last Publication" in html:
    print("✅ Found 'Last Publication' text in HTML!")
    
    # Find the date near it
    idx = html.find("פרסום אחרון") if "פרסום אחרון" in html else html.find("Last Publication")
    window = html[idx:idx+200]
    print(f"\nContext around publication text:\n{window}\n")
    
    # Look for date patterns
    date_pattern = r'(\d{2}\.\d{2}\.\d{4})'
    dates = re.findall(date_pattern, window)
    print(f"Dates found: {dates}")
else:
    print("❌ 'Last Publication' text NOT found in HTML")
    print("\nSearching for date patterns in entire HTML...")
    dates = re.findall(r'(\d{2}\.\d{2}\.\d{4})', html)
    print(f"Found {len(dates)} dates total: {dates[:10]}")
