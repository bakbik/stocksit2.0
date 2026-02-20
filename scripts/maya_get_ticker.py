
import requests
import sys

def get_ticker(security_id):
    url = f"https://mayaapi.tase.co.il/api/company/details?companyId={security_id}"
    headers = {
        "Cache-Control": "no-cache",
        "referer": "https://www.tase.co.il/",
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)",
        "X-Maya-With": "True",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            data = response.json()
            print(f"EnglishName: {data.get('EnglishName')}")
            print(f"Symbol: {data.get('Symbol')}")
        else:
            print(f"Failed. Status: {response.status_code}")
    except Exception as e:
        print(f"Error: {str(e)}")

        # Fallback to search
        try:
             url2 = f"https://mayaapi.tase.co.il/api/company/search?query={security_id}"
             response2 = requests.get(url2, headers=headers, timeout=15)
             if response2.status_code == 200:
                 print(f"Search fallback success: {response2.text[:100]}")
        except Exception as e2:
             print(f"Fallback Error: {str(e2)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_ticker(sys.argv[1])
    else:
        # Default test
        get_ticker("126011")
