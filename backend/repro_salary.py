import os
import django
import sys
import datetime

# Setup Django environment
sys.path.append(r'e:\New Project\tution-backup\admin-tution\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Teacher, TeacherSalary
from django.contrib.auth.models import User
from students.serializers import TeacherSalarySerializer

def repro():
    print("Testing TeacherSalary save...")
    try:
        # Get Akhilesh s
        teacher = Teacher.objects.filter(user__first_name='Akhilesh').first()
        if not teacher:
            print("Teacher not found")
            return

        # Payload from user screenshot
        payload = {
            'teacher': teacher.id,
            'month': 'march 2026',
            'basic_salary': 20000,
            'earnings_json': [
                {'name': 'home rent', 'amount': 6000},
                {'name': 'food', 'amount': 4000},
                {'name': 'traveling', 'amount': 2000}
            ],
            'deductions_json': [
                {'name': 'esi', 'amount': 200},
                {'name': 'pf', 'amount': 1800}
            ],
            'total_amount': 30000,
            'status': 'unpaid'
        }
        
        print(f"Payload: {payload}")
        
        serializer = TeacherSalarySerializer(data=payload)
        if serializer.is_valid():
            print("Serializer IS valid. Saving...")
            serializer.save()
            print("Save SUCCESSFUL")
        else:
            print(f"Serializer NOT valid: {serializer.errors}")

    except Exception as e:
        print(f"Error during repro: {e}")

if __name__ == "__main__":
    repro()
