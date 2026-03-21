import urllib.request, json

def test_login(username, password):
    url = "http://localhost:8000/api/login/"
    data = json.dumps({"username": username, "password": password}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as f:
            cookies = []
            for h, v in f.headers.items():
                if h.lower() == 'set-cookie':
                    cookies.append(v.split(';')[0])
            cookie_hdr = "; ".join(cookies)

        req2 = urllib.request.Request("http://localhost:8000/api/profile/", headers={"Cookie": cookie_hdr})
        with urllib.request.urlopen(req2) as f2:
            profile = json.loads(f2.read())
            return True, profile.get('role', '?')
    except urllib.error.HTTPError as e:
        return False, e.read().decode()
    except Exception as ex:
        return False, str(ex)

tests = [
    ("student@gmail.com", "Student@123", "Student"),
    ("teacher@gmail.com", "Teacher@123", "Teacher"),
    ("admin@gmail.com",   "Admin@123",   "Admin"),
]

print("\n=== Login Verification ===")
all_ok = True
for username, password, expected in tests:
    ok, result = test_login(username, password)
    status = "✓" if ok else "✗"
    role_ok = result == expected.lower() if ok else False
    route_ok = "✓ routes to " + expected + " portal" if role_ok else ("✗ got role='" + result + "' expected '" + expected.lower() + "'" if ok else "✗ LOGIN FAILED")
    mark = "✓" if ok and role_ok else "✗"
    print(f"  {mark} {username} / {password}")
    print(f"     {route_ok}")
    if not (ok and role_ok):
        all_ok = False

print("\n" + ("All logins correct!" if all_ok else "Some logins FAILED — check above."))
