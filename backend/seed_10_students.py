import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student

def seed_students():
    student_data = [
        ("Alice", "Johnson", "AETHER-201", "10th", "Loves Mathematics and Physics."),
        ("Bob", "Smith", "AETHER-202", "11th", "Avid reader and history buff."),
        ("Charlie", "Davis", "AETHER-203", "9th", "Interested in computer science."),
        ("Diana", "Prince", "AETHER-204", "12th", "Sports enthusiast and team leader."),
        ("Ethan", "Hunt", "AETHER-205", "10th", "Enjoys chemistry experiments."),
        ("Fiona", "Gallagher", "AETHER-206", "8th", "Passionate about literature."),
        ("George", "Miller", "AETHER-207", "11th", "Gifted in biology and nature."),
        ("Hannah", "Abbott", "AETHER-208", "9th", "Loves art and design."),
        ("Ian", "Wright", "AETHER-209", "12th", "Aspiring engineer."),
        ("Julia", "Roberts", "AETHER-210", "10th", "Enjoys learning foreign languages.")
    ]

    created_count = 0
    for first, last, s_id, grade, bio in student_data:
        username = first.lower() + s_id.split('-')[-1]
        email = f"{username}@eduway.com"
        
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=email,
                password="Student@123",
                first_name=first,
                last_name=last
            )
            
            Student.objects.create(
                user=user,
                student_id=s_id,
                grade=grade,
                bio=bio,
                points=0,
                parent_contact="555-010" + s_id.split('-')[-1]
            )
            created_count += 1
            print(f"Created student: {first} {last} ({s_id})")
        else:
            print(f"User {username} already exists, skipping.")

    print(f"Seeding finished. Added {created_count} new students.")

if __name__ == "__main__":
    seed_students()
