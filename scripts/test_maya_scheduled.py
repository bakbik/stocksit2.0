import requests
import json
import sys

def test_maya_scheduled():
    endpoints = [
        'https://mayaapi.tase.co.il/api/corporateactions/financialscheduled',
        'https://mayaapi.tase.co.il/api/corporateactions/getfinancialscheduled',
        'https://mayaapi.tase.co.il/api/corporateactions/getfinancialschedule',
        'https://mayaapi.tase.co.il/api/reports/financialscheduled'
    ]

    headers = {
        'accept': 'application/json, text/plain, */*',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'x-maya-with': 'True',
        'referer': 'https://www.tase.co.il/',
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)'
    }

    for url in endpoints:
        try:
            print(f"Testing: {url}")
            # Try GET first, most listing endpoints are GET
            response = requests.get(url, headers=headers, timeout=10)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"Data (first 500 chars): {response.text[:500]}")
                break
            
            # If 405 Method Not Allowed, try POST
            if response.status_code == 405:
                 print("Attempting POST...")
                 response = requests.post(url, headers=headers, json={}, timeout=10)
                 print(f"POST Status: {response.status_code}")
                 if response.status_code == 200:
                     print(f"Data (first 500 chars): {response.text[:500]}")
                     break
                     
        except Exception as e:
            print(f"Error for {url}: {str(e)}")

if __name__ == "__main__":
    test_maya_scheduled()
