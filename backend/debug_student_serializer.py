import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Student
from students.serializers import StudentSerializer

try:
    student = Student.objects.get(id=3)
    serializer = StudentSerializer(student)
    print("Serializer Data Keys:")
    print(list(serializer.data.keys()))
    print("\nSerializer Data Values:")
    import json
    print(json.dumps(serializer.data, indent=2))
except Exception as e:
    print(f"Error: {e}")
