import urllib.request
import json

url = "http://localhost:8000/api/login/"
data = json.dumps({"username": "teacher@gmail.com", "password": "Teacher@123"}).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as f:
        cookie_parts = []
        for header, value in f.headers.items():
            if header.lower() == 'set-cookie':
                # Just take the first part before semicolon for each cookie
                cookie_parts.append(value.split(';')[0])
        cookie_header = "; ".join(cookie_parts)
    
    req2 = urllib.request.Request("http://localhost:8000/api/profile/", headers={"Cookie": cookie_header})
    with urllib.request.urlopen(req2) as f2:
        print(f"Profile Code: {f2.getcode()}")
        print(f"Profile Body: {f2.read().decode('utf-8')}")

except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
