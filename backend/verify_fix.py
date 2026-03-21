import http.client
import json

def verify():
    conn = http.client.HTTPConnection("127.0.0.1", 8000)
    
    print("--- Verifying Login (Admin) ---")
    data = json.dumps({"username": "admin@gmail.com", "password": "Admin@123", "role": "admin"}).encode()
    headers = {
        "Origin": "http://127.0.0.1:5173",
        "Content-Type": "application/json"
    }
    # We should NOT send X-CSRFToken here to verify @csrf_exempt works
    conn.request("POST", "/api/login/", body=data, headers=headers)
    resp = conn.getresponse()
    print(f"Status: {resp.status}")
    body = resp.read().decode()
    print(f"Body: {body}")
    
    if resp.status == 200 and '"role":"admin"' in body:
        print("\nSUCCESS: Admin login works without CSRF token (exempted).")
    else:
        print("\nFAILURE: Admin login failed.")

if __name__ == "__main__":
    verify()
