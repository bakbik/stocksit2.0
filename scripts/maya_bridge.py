import sys
import json
from pymaya.maya import Maya
from datetime import datetime

def get_report_date(maya_id, target_period):
    """
    maya_id: Maya Company ID (string or int)
    target_period: Period string like 'Q3/2025' or 'FY 2024'
    """
    maya = Maya()
    
    # Financial reports family ID is 100
    try:
        # Use direct requests with maya headers to bypass proxy/filtering if needed
        import requests
        url = "https://mayaapi.tase.co.il/api/report/filter"
        payload = {
            "CompanyId": [int(maya_id)],
            "EventsFamilyIds": [100],
            "Page": 1
        }
        headers = {
            "Cache-Control": "no-cache",
            "referer": "https://www.tase.co.il/",
            "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)",
            "X-Maya-With": "True",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        if response.status_code != 200:
            sys.stderr.write(f"Error: Status {response.status_code}\n")
            return None
            
        data = response.json()
        reports = data.get('Reports', [])
        sys.stderr.write(f"Found {len(reports)} reports.\n")
        
        for r in reports:
            # Example: "דוח רבעון 3 לשנת 2025"
            # PubDate format: "20/11/2025 15:30"
            pub_date_str = r.get('PubDate')
            subject = r.get('Subject', '')
            sys.stderr.write(f"Checking: {subject}\n")
            
            # Simple matching logic
            # Yahoo usually uses "Q3/2025"
            if target_period.startswith('Q'):
                q = target_period[1]
                year = target_period[3:]
                if f"רבעון {q}" in subject and year in subject:
                    return pub_date_str
            elif target_period.startswith('FY'):
                year = target_period[3:]
                if "שנתי" in subject and year in subject:
                    return pub_date_str
                    
        # Fallback: if we can't match exactly, just return the latest one if it looks relevant
        if reports:
             return reports[0].get('PubDate')
             
    except Exception as e:
        return None
    
    return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)
        
    m_id = sys.argv[1]
    period = sys.argv[2]
    
    date_found = get_report_date(m_id, period)
    print(json.dumps({"pubDate": date_found}))
