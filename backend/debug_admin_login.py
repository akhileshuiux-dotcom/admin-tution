import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.contrib.auth.models import User
from students.models import Student, Teacher

print("=" * 50)
u = User.objects.filter(email='admin@gmail.com').first()
if not u:
    print("User admin@gmail.com does not exist.")
else:
    print(f"Username: {u.username}")
    print(f"Is Active: {u.is_active}")
    print(f"Is Staff: {u.is_staff}")
    print(f"Is Superuser: {u.is_superuser}")
    print(f"Password correct (Admin@123): {u.check_password('Admin@123')}")
    
    # Check if extra profiles exist
    print(f"Has Student profile: {hasattr(u, 'student_profile')}")
    print(f"Has Teacher profile: {hasattr(u, 'teacher_profile')}")

print("=" * 50)
