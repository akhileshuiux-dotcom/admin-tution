import urllib.request
import json

payload = {
    "studentName": "Test Student",
    "grade": "10",
    "contactNumber": "1234567890",
    "email": "test@example.com",
    "location": "Test Location",
    "country": "Test Country",
    "syllabus": "Test Syllabus"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request("http://localhost:8001/api/enquiries/", data=data)
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response Body: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
