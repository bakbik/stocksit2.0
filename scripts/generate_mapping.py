import json
from pymaya.maya import Maya

def main():
    maya = Maya()
    print("Fetching all securities from Maya...")
    securities = maya.get_all_securities()
    
    mapping = {}
    for s in securities:
        # TASE Security Number is often 'SubId' or 'Smb'
        # Let's check ICL (281014)
        sec_num = s.get('SubId')
        maya_id = s.get('Id')
        name = s.get('Name')
        
        if sec_num:
            mapping[sec_num] = {
                'mayaId': maya_id,
                'name': name
            }
            
    with open('tase_maya_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
        
    print(f"Saved mapping for {len(mapping)} securities.")
    
    # Verify ICL
    icl_sec_num = '281014'
    if icl_sec_num in mapping:
        print("Found ICL Mapping:", mapping[icl_sec_num])
    else:
        print("ICL (281014) not found in the list. Searching by name...")
        for sec_num, info in mapping.items():
            if 'ICL' in info['name']:
                print(f"Match found: {sec_num} -> {info}")

if __name__ == "__main__":
    main()
