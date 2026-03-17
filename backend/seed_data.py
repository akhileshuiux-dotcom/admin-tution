import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student, Teacher, Subject, Course, Lesson, Resource, Exam, Question, ExamResult
from django.utils import timezone
from datetime import timedelta

def create_demo_data():
    # 0. Cleanup existing data to avoid IntegrityErrors
    print("Cleaning up old LMS data...")
    ExamResult.objects.all().delete()
    Question.objects.all().delete()
    Exam.objects.all().delete()
    Resource.objects.all().delete()
    Lesson.objects.all().delete()
    Course.objects.all().delete()
    Subject.objects.all().delete()
    Student.objects.all().delete()
    Teacher.objects.all().delete()
    # Note: Keep Users for login stability, but we can delete them if needed
    
    # 1. Create superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Superuser created: admin / admin123")

    # 2. Create Teacher
    t_user, _ = User.objects.get_or_create(username='teacher1', defaults={'email': 'teacher1@example.com'})
    t_user.set_password('teacher123')
    t_user.first_name = 'Orion'
    t_user.last_name = 'Star'
    t_user.save()
    
    teacher, _ = Teacher.objects.get_or_create(
        user=t_user,
        defaults={
            'employee_id': 'INST-001',
            'bio': 'Expert in Quantum Mechanics and Early Education.',
            'specialization': 'Physics & Pedagogy'
        }
    )
    print("Teacher profile ready.")

    # 3. Create Students
    # Secondary Student (G12)
    s1_user, _ = User.objects.get_or_create(username='student1', defaults={'email': 'student1@example.com'})
    s1_user.set_password('student123')
    s1_user.first_name = 'John'
    s1_user.last_name = 'Doe'
    s1_user.save()
    
    Student.objects.get_or_create(
        user=s1_user,
        defaults={
            'student_id': 'AETHER-101',
            'grade': '12th',
            'bio': 'Aspiring physicist.',
            'points': 1250
        }
    )
    print("Secondary Student profile ready.")

    # Primary Student (G1)
    p1_user, _ = User.objects.get_or_create(username='primary1', defaults={'email': 'primary1@example.com'})
    p1_user.set_password('primary123')
    p1_user.first_name = 'Alice'
    p1_user.last_name = 'Young'
    p1_user.save()
    
    Student.objects.get_or_create(
        user=p1_user,
        defaults={
            'student_id': 'AETHER-001',
            'grade': '1st',
            'bio': 'Loves stars and coloring.',
            'points': 100
        }
    )
    print("Primary Student profile ready.")

    # 4. Create Subjects
    math_sub, _ = Subject.objects.get_or_create(name='Mathematics', code='MATH')
    sci_sub, _ = Subject.objects.get_or_create(name='Science', code='SCI')

    # 5. Create Courses
    # Secondary Course
    calc_course, _ = Course.objects.get_or_create(
        name='Advanced Calculus',
        subject=math_sub,
        teacher=teacher,
        grade_level='12th',
        description='Multivariable calculus and vector fields.'
    )

    # Primary Course
    magic_math, _ = Course.objects.get_or_create(
        name='Magic with Numbers',
        subject=math_sub,
        teacher=teacher,
        grade_level='1st',
        description='Fun with addition and subtraction!'
    )

    # 6. Create Lessons & Resources
    lesson1, _ = Lesson.objects.get_or_create(
        course=calc_course,
        title='Vectors in 3D',
        order=1
    )
    Resource.objects.get_or_create(
        lesson=lesson1,
        title='3D Vector Guide (PDF)',
        file_type='pdf',
        url='https://example.com/vectors.pdf'
    )

    lesson2, _ = Lesson.objects.get_or_create(
        course=magic_math,
        title='The Wonder of Addition',
        order=1
    )
    Resource.objects.get_or_create(
        lesson=lesson2,
        title='Addition Song (Video)',
        file_type='video',
        url='https://youtube.com/magic-math'
    )

    # 7. Create Exams
    exam, _ = Exam.objects.get_or_create(
        course=calc_course,
        title='Calculus Midterm',
        duration_minutes=90,
        is_active=True,
        enable_focus_mode=True
    )
    
    Question.objects.get_or_create(
        exam=exam,
        text='Find the gradient of f(x,y) = x^2 + y^2.',
        q_type='desc',
        points=10
    )

    print("LMS seeding completed successfully.")

if __name__ == '__main__':
    create_demo_data()

