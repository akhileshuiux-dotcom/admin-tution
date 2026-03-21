import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student, Teacher

def check_user(email):
    try:
        user = User.objects.get(username=email)
        print(f"User: {email}")
        print(f"  is_staff: {user.is_staff}")
        print(f"  is_superuser: {user.is_superuser}")
        print(f"  Has Student Profile: {Student.objects.filter(user=user).exists()}")
        print(f"  Has Teacher Profile: {Teacher.objects.filter(user=user).exists()}")
    except User.DoesNotExist:
        print(f"User {email} NOT FOUND")

check_user('admin@gmail.com')
