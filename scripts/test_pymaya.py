from pymaya.maya import Maya
import json

def main():
    maya = Maya()
    print("Testing get_details for Avgol (1390)...")
    try:
        details = maya.get_details("1390")
        print("Type of details:", type(details))
        
        # Try to see all attributes
        attrs = [a for a in dir(details) if not a.startswith('_')]
        print("Attributes of details:", attrs)
        
        # If it's a class with properties, let's try to print some
        for attr in attrs:
            try:
                val = getattr(details, attr)
                # If it's a list or dict, print its length/size
                if isinstance(val, (list, dict)):
                     print(f"{attr}: len={len(val)}")
                else:
                     print(f"{attr}: {val}")
            except:
                pass
                    
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
