import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from core.serializers import TutorSerializer
from users.models import User

data = {
    'user': {
        'name': 'Debug Tutor 2',
        'email': 'debugtutor2@example.com',
        'role': 'Tutor',
        'password': 'password123'
    },
    'contact_number': '1112223333',
    'status': 'Active',
    'subject_expertise': 'Math, Physics',
    'classes_can_teach': 'Grade 10, Grade 11'
}

serializer = TutorSerializer(data=data)
try:
    if serializer.is_valid():
        tutor = serializer.save()
        print(f"Success! Created Tutor with ID: {tutor.id}")
    else:
        print(f"Validation Errors: {serializer.errors}")
except Exception as e:
    import traceback
    traceback.print_exc()
