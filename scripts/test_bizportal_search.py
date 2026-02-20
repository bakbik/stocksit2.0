
import requests
import sys
import json

def get_ticker(security_id):
    url = f"https://data.bizportal.co.il/api/search/searchresults?searchText={security_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
        else:
            print(f"Failed. Status: {response.status_code}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_ticker(sys.argv[1])
    else:
        # Default test
        get_ticker("126011")
