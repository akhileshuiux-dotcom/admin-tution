import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from core.models import Student

def create_more_demo_students():
    inactive_names = [
        "Liam Smith", "Olivia Johnson", "Noah Williams", "Emma Brown", "Oliver Jones",
        "Ava Garcia", "Elijah Miller", "Sophia Davis", "James Rodriguez", "Isabella Martinez"
    ]
    
    graduate_names = [
        "William Hernandez", "Mia Lopez", "Benjamin Gonzalez", "Amelia Wilson", "Lucas Anderson",
        "Harper Thomas", "Henry Taylor", "Evelyn Moore", "Alexander Jackson", "Abigail Martin"
    ]
    
    grades = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
    subjects = ['Maths, Science', 'IGCSE', 'CBSE', 'Physics, Chemistry', 'English literature']
    
    created_count = 0
    
    # Create Inactive students
    for name in inactive_names:
        if not Student.objects.filter(full_name=name).exists():
            student = Student.objects.create(
                full_name=name,
                grade=random.choice(grades),
                syllabus=random.choice(subjects),
                status='Inactive',
                location="Demo City",
                country="Demo Country"
            )
            created_count += 1
            print(f"Created: {student.full_name} (Inactive)")

    # Create Graduate students
    for name in graduate_names:
        if not Student.objects.filter(full_name=name).exists():
            student = Student.objects.create(
                full_name=name,
                grade=random.choice(grades),
                syllabus=random.choice(subjects),
                status='Graduate',
                location="Demo City",
                country="Demo Country"
            )
            created_count += 1
            print(f"Created: {student.full_name} (Graduate)")
            
    print(f"\nSuccessfully created {created_count} new demo students!")

if __name__ == '__main__':
    create_more_demo_students()
