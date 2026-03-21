import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student, Teacher

print("=" * 50)

# ── 1. STUDENT: student@gmail.com / Student@123 ──────────
s_user, created = User.objects.get_or_create(username='student@gmail.com')
s_user.email = 'student@gmail.com'
s_user.first_name = 'Demo'
s_user.last_name = 'Student'
s_user.is_staff = False
s_user.is_superuser = False
s_user.set_password('Student@123')
s_user.save()
student, _ = Student.objects.get_or_create(user=s_user, defaults={'student_id': 'STD-001', 'grade': '10th'})
print(f"[{'CREATED' if created else 'UPDATED'}] student@gmail.com → Student profile (ID: {student.student_id})")

# ── 2. TEACHER: teacher@gmail.com / Teacher@123 ──────────
t_user, created = User.objects.get_or_create(username='teacher@gmail.com')
t_user.email = 'teacher@gmail.com'
t_user.first_name = 'Demo'
t_user.last_name = 'Teacher'
t_user.is_staff = False        # NOT staff — avoids admin fallback
t_user.is_superuser = False
t_user.set_password('Teacher@123')
t_user.save()
teacher, _ = Teacher.objects.get_or_create(user=t_user, defaults={'employee_id': 'T-001', 'specialization': 'General'})
print(f"[{'CREATED' if created else 'UPDATED'}] teacher@gmail.com → Teacher profile (ID: {teacher.employee_id})")

# ── 3. ADMIN: admin@gmail.com / Admin@123 ────────────────
a_user, created = User.objects.get_or_create(username='admin@gmail.com')
a_user.email = 'admin@gmail.com'
a_user.first_name = 'Admin'
a_user.last_name = 'User'
a_user.is_staff = True
a_user.is_superuser = True
a_user.set_password('Admin@123')
a_user.save()
# Admin must NOT have teacher or student profile
Student.objects.filter(user=a_user).delete()
Teacher.objects.filter(user=a_user).delete()
print(f"[{'CREATED' if created else 'UPDATED'}] admin@gmail.com → Superuser/Admin")

# ── Also fix old test@gmail.com admin if it exists ────────
try:
    old = User.objects.get(username='test@gmail.com')
    old.set_password('Test@123')
    old.is_staff = True
    old.is_superuser = True
    old.save()
    Student.objects.filter(user=old).delete()
    Teacher.objects.filter(user=old).delete()
    print("[UPDATED] test@gmail.com → Admin (kept as backup)")
except User.DoesNotExist:
    pass

print("=" * 50)
print("All credentials ready!")
print("  student@gmail.com  / Student@123 → Student Portal")
print("  teacher@gmail.com  / Teacher@123 → Teacher Portal")
print("  admin@gmail.com    / Admin@123   → Admin Portal")
