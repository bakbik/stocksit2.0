from pymaya.maya import Maya
import json

def fetch_reports(maya_id):
    maya = Maya()
    # Maya ID might need to be an int list or string list depending on API
    payload = {
        "CompanyId": [int(maya_id)],
        "EventsFamilyIds": [100], # 100 is for Financial Reports
        "Page": 1
    }
    
    # We use the maya_securities base class which has the session
    base = maya.maya_securities
    url = "https://mayaapi.tase.co.il/api/report/filter"
    
    # Prepare session with headers like pymaya
    headers = {
        "Cache-Control": "no-cache",
        "referer": "https://www.tase.co.il/",
        "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)",
        "X-Maya-With": "True",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Fetching reports for Maya ID {maya_id}...")
        # Use simple requests for now but with pymaya headers
        import requests
        response = requests.post(url, json=payload, headers=headers, verify=True)
        
        print("Status:", response.status_code)
        if response.status_code == 200:
            data = response.json()
            reports = data.get('Reports', [])
            if reports:
                print("Latest Report Found!")
                print(json.dumps({
                    "pubDate": reports[0].get('PubDate'),
                    "subject": reports[0].get('Subject'),
                    "period": reports[0].get('ReportPeriodDesc')
                }, ensure_ascii=False))
            else:
                print("No reports found.")
        else:
            print("Error response:", response.text[:200])
            
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    # Test for Avgol (1390)
    fetch_reports("1390")
