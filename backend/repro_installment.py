import os
import django
import sys
import datetime

# Setup Django environment
sys.path.append(r'e:\New Project\tution-backup\admin-tution\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Student, FeeInstallment
from django.contrib.auth.models import User
from students.serializers import FeeInstallmentSerializer

def repro():
    print("Testing FeeInstallment save...")
    try:
        # Get Bob Smith
        student = Student.objects.filter(user__first_name='Bob').first()
        if not student:
            print("Student not found")
            return

        # Payload from user screenshot (one row)
        payload = {
            'student': student.id,
            'amount': 25000,
            'due_date': '2026-04-06',
            'status': 'pending'
        }
        
        print(f"Payload: {payload}")
        
        serializer = FeeInstallmentSerializer(data=payload)
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
