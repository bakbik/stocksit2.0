import requests
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Fetch the actual article page to see if date is there
article_url = "https://www.bizportal.co.il/capitalmarket/news/article/20017047"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

response = requests.get(article_url, headers=headers)
html = response.text

# Look for date patterns in article page
# Common formats: "18.05.2025", "18/05/2025", metadata tags, etc.
print("=== Searching for dates in article page ===")
dates = re.findall(r'(\d{2}[/.]\d{2}[/.]\d{4})', html)
print(f"Found {len(dates)} date patterns: {dates[:10]}")

# Look for meta tags
meta_pattern = r'<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"'
meta_match = re.search(meta_pattern, html)
if meta_match:
    print(f"\nFound article:published_time meta tag: {meta_match.group(1)}")

# Look for datetime attributes
datetime_pattern = r'<time[^>]*datetime="([^"]+)"'
datetime_match = re.search(datetime_pattern, html)
if datetime_match:
    print(f"\nFound <time> element: {datetime_match.group(1)}")

# Show some context around "2025" if present
if "2025" in html:
    idx = html.find("2025")
    context = html[max(0, idx-100):min(len(html), idx+100)]
    print(f"\n=== Context around '2025' ===")
    print(context)
