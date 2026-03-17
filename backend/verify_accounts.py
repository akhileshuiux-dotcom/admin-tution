import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def check_users():
    users = [('student1', 'student123'), ('akhil1', 'akhil123')]
    for username, password in users:
        user = authenticate(username=username, password=password)
        if user:
            print(f"SUCCESS: {username} authenticated.")
        else:
            print(f"FAILED: {username} failed authentication.")

if __name__ == '__main__':
    check_users()
