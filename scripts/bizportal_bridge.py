import sys
import json
import requests
import re

def get_bizportal_report_date(security_num, target_period):
    # Bizportal has different pages. Quote page news usually has the report announcement.
    # But let's try the direct reports page first as planned.
    url = f"https://www.bizportal.co.il/capitalmarket/quote/reports/{security_num}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            sys.stderr.write(f"Error: Status {response.status_code} for {url}\n")
            return None
            
        html = response.text
        sys.stderr.write(f"HTML Length: {len(html)}\n")
        
        # Test if common strings exist
        for test_s in ["רבעון", "2025", "2024", "דוחות"]:
            if test_s in html:
                sys.stderr.write(f"String '{test_s}' found at {html.find(test_s)}\n")
            else:
                sys.stderr.write(f"String '{test_s}' NOT found\n")

        # Extract all dates from HTML
        date_pattern = r'(\d{2}[/.]\d{2}[/.]\d{4})'
        all_dates = re.findall(date_pattern, html)
        sys.stderr.write(f"Top 10 dates found: {all_dates[:10]}\n")
        
        # Mapping Yahoo period (Q3/2025) to Hebrew variations
        # Variations: "רבעון 3 2025", "רבעון שלישי 2025", "Q3 2025"
        year = ""
        q_num = ""
        if target_period.startswith('Q'):
            q_num = target_period[1]
            year = target_period[3:]
        elif target_period.startswith('Y/'):
             year = target_period[2:]
        elif target_period.startswith('FY'):
             year = target_period[3:]

        if not year: return None

        # We look for a date format like DD/MM/YYYY or DD.MM.YYYY
        date_pattern = r'(\d{2}[/.]\d{2}[/.]\d{4})'
        
        # Bizportal reports page often has rows like:
        # 20.11.2025 | דוחות רבעון שלישי 2025
        # We search for year + quarter in a window
        search_terms = []
        if q_num:
            search_terms.append(f"רבעון {q_num} {year}")
            search_terms.append(f"רבעון {q_num}/{year}")
            if q_num == '1': search_terms.append(f"רבעון ראשון {year}")
            if q_num == '2': search_terms.append(f"רבעון שני {year}")
            if q_num == '3': search_terms.append(f"רבעון שלישי {year}")
        else:
            search_terms.append(f"שנתי {year}")
            search_terms.append(f"דוח שנתי {year}")

        for term in search_terms:
            idx = html.find(term)
            if idx != -1:
                sys.stderr.write(f"Found term '{term}' at index {idx}\n")
                # Search for original date pattern near this term
                window = html[max(0, idx-200):idx+400]
                dates = re.findall(date_pattern, window)
                if dates:
                    sys.stderr.write(f"Match found: {dates[0]}\n")
                    return dates[0].replace('.', '/')
        
        # DESPERATE FALLBACK: If specific period terms fail, just find ANY date near the year
        # This is useful if the Hebrew is encoded or formatted differently
        year_mentions = [m.start() for m in re.finditer(year, html)]
        for m_idx in year_mentions:
             window = html[max(0, m_idx-100):m_idx+100]
             # If "דוח" or "רבעון" (even if encoded) is nearby? 
             # Let's just take the first date near a year in the bottom half of the page 
             # (where reports usually are)
             dates = re.findall(date_pattern, window)
             if dates:
                 sys.stderr.write(f"Desperate match found near year {year} at {m_idx}: {dates[0]}\n")
                 return dates[0].replace('.', '/')

    except Exception as e:
        sys.stderr.write(f"Scraper error: {str(e)}\n")
        return None
        
    return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)
        
    sec_num = sys.argv[1]
    period = sys.argv[2]
    
    date_found = get_bizportal_report_date(sec_num, period)
    print(json.dumps({"pubDate": date_found}))
