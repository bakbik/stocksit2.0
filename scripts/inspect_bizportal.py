
import sys
import requests
import re

def inspect(security_num):
    url = f"https://www.bizportal.co.il/capitalmarket/quote/general/{security_num}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        html = response.text
        
        with open('bizportal_dump.txt', 'w', encoding='utf-8') as f:
            f.write(f"URL: {url}\n")
            f.write(f"Status: {response.status_code}\n")
            f.write("\n--- HEAD ---\n")
            f.write(html[:5000])
            f.write("\n--- END HEAD ---\n")
            
        with open('bizportal_full.html', 'w', encoding='utf-8') as f:
            f.write(html)
            
            # Look for Price (שער last/current)
            f.write("\n--- Searching for 'שער' ---\n")
            indices = [m.start() for m in re.finditer('שער', html)]
            for i in indices[:10]:
                f.write(f"MATCH AT {i}:\n")
                f.write(html[i-150:i+150] + "\n\n")
                
            f.write("\n--- Searching for 'שווי שוק' ---\n")
            indices = [m.start() for m in re.finditer('שווי שוק', html)]
            for i in indices[:5]:
                f.write(f"MATCH AT {i}:\n")
                f.write(html[i-150:i+200] + "\n\n")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    stock_id = sys.argv[1] if len(sys.argv) > 1 else "1100957"
    inspect(stock_id)
