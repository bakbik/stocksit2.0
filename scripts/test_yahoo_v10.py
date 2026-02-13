import requests
import json
import sys

def test_yahoo_v10():
    symbol = 'AVGL.TA'
    url = f"https://query2.finance.yahoo.com/v10/finance/quoteSummary/{symbol}?modules=earningsHistory,earningsTrend"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        print(f"Fetching: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
        else:
            print(f"Failed. Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_yahoo_v10()
