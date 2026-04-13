import os
import django
import datetime
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Student, Course, Subject, Exam, Resource, ExamResult, SubjectMark, Teacher
from django.contrib.auth.models import User

def seed_dashboard():
    print("Starting dashboard seed...")
    
    # 1. Get or Create Demo Student
    # Using student@gmail.com from seed_users.py context
    try:
        user = User.objects.get(username='student@gmail.com')
        student = Student.objects.get(user=user)
        print(f"Found student: {student}")
    except (User.DoesNotExist, Student.DoesNotExist):
        print("Demo student not found, creating one...")
        user, _ = User.objects.get_or_create(
            username='student@gmail.com', 
            defaults={'first_name': 'Demo', 'last_name': 'Student', 'email': 'student@gmail.com'}
        )
        user.set_password('Student@123')
        user.save()
        student, _ = Student.objects.get_or_create(
            user=user, 
            defaults={'student_id': 'STD-DEMO', 'grade': '10th'}
        )

    # 2. Ensure Teacher, Subject, and Course exist
    teacher_user, _ = User.objects.get_or_create(username='teacher@gmail.com', defaults={'first_name': 'Demo', 'last_name': 'Teacher'})
    teacher, _ = Teacher.objects.get_or_create(user=teacher_user, defaults={'employee_id': 'T-DEMO', 'specialization': 'General'})
    
    subject, _ = Subject.objects.get_or_create(name='Mathematics', defaults={'code': 'MATH101'})
    course, _ = Course.objects.get_or_create(
        name='Mathematics Advanced', 
        defaults={
            'subject': subject, 
            'teacher': teacher, 
            'grade_level': '10th',
            'description': 'Advanced Mathematics for Grade 10'
        }
    )

    # 3. Seed "My Tasks" (Exams)
    # Task 1: Upcoming (To Do)
    Exam.objects.get_or_create(
        title='Mid-Term Algebra Quiz',
        course=course,
        defaults={
            'scheduled_date': timezone.now() + datetime.timedelta(days=3),
            'duration_minutes': 60,
            'is_active': False,
            'exam_mode': 'online'
        }
    )
    # Task 2: Active (In Progress)
    Exam.objects.get_or_create(
        title='Geometry Practice Assignment',
        course=course,
        defaults={
            'scheduled_date': timezone.now() - datetime.timedelta(hours=2),
            'duration_minutes': 120,
            'is_active': True,
            'exam_mode': 'online'
        }
    )

    # 4. Seed "My Notes" (Resources)
    Resource.objects.get_or_create(
        title='Introduction to Calculus',
        course=course,
        defaults={
            'description': 'Basis concepts of derivatives and integrals for beginners.',
            'file_type': 'pdf',
            'section': 'notes'
        }
    )
    Resource.objects.get_or_create(
        title='Trigonometry Formula Sheet',
        course=course,
        defaults={
            'description': 'Quick reference for all trig identities and ratios.',
            'file_type': 'pdf',
            'section': 'reference'
        }
    )

    # 5. Seed "My Performance" (Exam Results)
    # Finished Exam
    finished_exam, _ = Exam.objects.get_or_create(
        title='Quarterly Math Exam',
        course=course,
        defaults={
            'scheduled_date': timezone.now() - datetime.timedelta(days=15),
            'duration_minutes': 180,
            'is_active': False
        }
    )
    
    result, created = ExamResult.objects.get_or_create(
        student=student,
        exam=finished_exam,
        defaults={
            'score': 88,
            'total_marks': 100.0,
            'percentage': 88.0,
            'grade': 'A',
            'status': 'published',
            'is_published': True
        }
    )
    
    if created:
        SubjectMark.objects.get_or_create(
            result=result,
            subject=subject,
            defaults={'marks_obtained': 88, 'max_marks': 100}
        )

    print("Dashboard seeding complete!")

if __name__ == "__main__":
    seed_dashboard()
