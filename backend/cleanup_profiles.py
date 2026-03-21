import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student, Teacher

def cleanup(email, keep_role):
    try:
        user = User.objects.get(username=email)
        print(f"Cleaning profiles for {email} (Keeping {keep_role})")
        
        if keep_role == 'teacher':
            Student.objects.filter(user=user).delete()
            print("  Deleted student profile if any")
        elif keep_role == 'student':
            Teacher.objects.filter(user=user).delete()
            print("  Deleted teacher profile if any")
        elif keep_role == 'admin':
            Student.objects.filter(user=user).delete()
            Teacher.objects.filter(user=user).delete()
            print("  Deleted both profiles")
            
    except User.DoesNotExist:
        print(f"User {email} not found")

cleanup('student@gmail.com', 'student')
cleanup('teacher@gmail.com', 'teacher')
cleanup('admin@gmail.com', 'admin')

print("Cleanup complete.")
