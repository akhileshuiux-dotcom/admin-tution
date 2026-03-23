import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Teacher
from students.serializers import TeacherSerializer

data = {
    "user": {
        "first_name": "Akhilesh",
        "last_name": "s",
        "email": "akhil_test@gmail.com",
        "password": "Teacher@123"
    },
    "employee_id": "EMP-12-2005",
    "specialization": "Science",
    "bio": "Test Bio"
}

serializer = TeacherSerializer(data=data)
if serializer.is_valid():
    try:
        teacher = serializer.save()
        print(f"Successfully created teacher: {teacher}")
    except Exception as e:
        print(f"Error during save: {e}")
else:
    print(f"Serializer errors: {serializer.errors}")
