import os
import django
import random
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from core.models import Student

def create_demo_students():
    names = [
        "Aarav Sharma", "Diya Patel", "Vihaan Singh", "Ananya Reddy", 
        "Arjun Nair", "Sanya Gupta", "Rohan Iyer", "Riya Desai",
        "Kabir Menon", "Zara Khan"
    ]
    
    statuses = ['Active', 'Active', 'Active', 'Active', 'Active', 'Drop', 'Drop', 'Graduate', 'Graduate', 'Graduate']
    grades = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
    subjects = ['Maths, Science', 'IGCSE', 'CBSE', 'Physics, Chemistry', 'English literature']
    
    # Shuffle statuses so they're assigned randomly to the names
    random.shuffle(statuses)
    
    created_count = 0
    for i, name in enumerate(names):
        # check if exists so we don't duplicate on multiple runs
        if not Student.objects.filter(full_name=name).exists():
            student = Student.objects.create(
                full_name=name,
                grade=random.choice(grades),
                syllabus=random.choice(subjects),
                status=statuses[i],
                location="Demo City",
                country="Demo Country"
            )
            created_count += 1
            print(f"Created: {student.full_name} ({student.status})")
    
    print(f"\nSuccessfully created {created_count} demo students!")

if __name__ == '__main__':
    create_demo_students()
