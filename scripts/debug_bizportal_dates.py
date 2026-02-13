import requests
import re
import sys

# Force UTF-8 encoding for output
sys.stdout.reconfigure(encoding='utf-8')

url = "https://www.bizportal.co.il/capitalmarket/quote/news/1100957"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

response = requests.get(url, headers=headers)
html = response.text

# Find article link
article_pattern = r'<a[^>]*href="([^"]*\/article\/20017047)"[^>]*>([^<]+)<'
match = re.search(article_pattern, html)

if match:
    start_idx = match.start()
    # Show HTML context around this article
    window_before = html[max(0, start_idx - 500):start_idx]
    window_after = html[start_idx:min(len(html), start_idx + 500)]
    
    print("=== HTML BEFORE ARTICLE LINK ===")
    print(window_before[-300:])  # Last 300 chars
    print("\n=== ARTICLE MATCH ===")
    print(match.group(0))
    print("\n=== HTML AFTER ARTICLE LINK ===")
    print(window_after[:300])  # First 300 chars
    
    # Look for date patterns
    combined = window_before + window_after
    dates = re.findall(r'(\d{2}[/.]\d{2}[/.]\d{4})', combined)
    print(f"\n=== DATES FOUND IN WINDOW ===")
    print(dates)
else:
    print("Article not found in HTML")
    # Show all article links found
    all_articles = re.findall(r'<a[^>]*href="([^"]*\/article\/\d+)"[^>]*>([^<]+)<', html)
    print(f"\nFound {len(all_articles)} articles total")
    for i, (link, title) in enumerate(all_articles[:5]):
        print(f"{i+1}. {title[:50]}... -> {link}")
