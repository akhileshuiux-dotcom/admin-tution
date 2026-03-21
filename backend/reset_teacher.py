import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Teacher

user, created = User.objects.get_or_create(username='teacher@gmail.com')
user.email = 'teacher@gmail.com'
user.set_password('Teacher@123')
user.is_staff = False # Teacher is not necessarily staff, unless required for admin login. But we check hasattr(user, 'teacher_profile') first!
user.save()

teacher, t_created = Teacher.objects.get_or_create(user=user, defaults={'employee_id': 'T-001'})

print(f"Teacher user: {user.username}, Password reset to Teacher@123. Teacher profile exists: {hasattr(user, 'teacher_profile')}")
