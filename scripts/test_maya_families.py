import requests
import json
import sys

def test_maya_search_families():
    url = "https://mayaapi.tase.co.il/api/report/filter"
    headers = {
        "Cache-Control": "no-cache",
        "referer": "https://www.tase.co.il/",
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)",
        "X-Maya-With": "True",
        "Content-Type": "application/json"
    }

    # Common Family IDs:
    # 100: Financial Reports
    # 200: Immediate Reports
    # 300: Prospects/Offerings
    # 400: Capital/Shares
    # 500: Corporate Actions (Maybe scheduled events are here?)
    # 600: Meetings
    
    for family_id in [100, 200, 500]:
        payload = {
            "EventsFamilyIds": [family_id],
            "Page": 1
        }
        try:
            print(f"Testing Family ID: {family_id}")
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                reports = data.get('Reports', [])
                print(f"Found {len(reports)} reports.")
                if reports:
                    print(f"First subject: {reports[0].get('Subject')}")
            else:
                print(f"Failed. Text: {response.text[:100]}")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_maya_search_families()
