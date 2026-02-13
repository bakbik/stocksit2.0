
import sys
import requests

def inspect_url(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        html = response.text
        
        print(f"URL: {url}")
        print(f"Status: {response.status_code}")
        print(f"Length: {len(html)}")
        
        with open('url_dump.txt', 'w', encoding='utf-8') as f:
            f.write(html)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    url = sys.argv[1]
    inspect_url(url)
