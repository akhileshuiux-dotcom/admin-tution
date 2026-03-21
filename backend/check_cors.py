import http.client
import json

def check_cors():
    conn = http.client.HTTPConnection("127.0.0.1", 8000)
    
    print("--- Testing OPTIONS ---")
    headers = {
        "Origin": "http://127.0.0.1:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"
    }
    conn.request("OPTIONS", "/api/login/", headers=headers)
    resp = conn.getresponse()
    print(f"Status: {resp.status}")
    for h, v in resp.getheaders():
        if h.lower().startswith('access-control-'):
            print(f"  {h}: {v}")
    resp.read() # Consume response
    
    print("\n--- Testing POST ---")
    data = json.dumps({"username": "admin@gmail.com", "password": "Admin@123"}).encode()
    headers = {
        "Origin": "http://127.0.0.1:5173",
        "Content-Type": "application/json"
    }
    conn.request("POST", "/api/login/", body=data, headers=headers)
    resp = conn.getresponse()
    print(f"Status: {resp.status}")
    for h, v in resp.getheaders():
        if h.lower().startswith('access-control-'):
            print(f"  {h}: {v}")
    print(f"Body: {resp.read().decode()}")

if __name__ == "__main__":
    check_cors()
