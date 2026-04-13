from students.models import Exam, Question, Course, Teacher
from django.contrib.auth.models import User
from students.serializers import ExamSerializer
import json

# Setup
course = Course.objects.first()
teacher = Teacher.objects.first()
user = teacher.user

# Test 1: Create Offline Exam
offline_data = {
    "title": "Offline Physics Test",
    "course": course.id,
    "scheduled_date": "2026-04-01T10:00:00Z",
    "exam_mode": "offline",
    "location": "Lab 101",
    "duration_minutes": 90
}
serializer = ExamSerializer(data=offline_data)
if serializer.is_valid():
    exam = serializer.save()
    print(f"Created Offline Exam: {exam.title} (ID: {exam.id}, Mode: {exam.exam_mode})")
else:
    print(f"Offline Serializer Errors: {serializer.errors}")

# Test 2: Create Online Exam with Questions
online_data = {
    "title": "Online Math Quiz",
    "course": course.id,
    "scheduled_date": "2026-04-02T14:00:00Z",
    "exam_mode": "online",
    "duration_minutes": 45,
    "questions": [
        {
            "text": "What is 2+2?",
            "q_type": "mcq",
            "points": 5,
            "option_a": "3",
            "option_b": "4",
            "option_c": "5",
            "option_d": "6",
            "correct_option": "B"
        },
        {
            "text": "Define Gravity.",
            "q_type": "short",
            "points": 10
        }
    ]
}
serializer = ExamSerializer(data=online_data)
if serializer.is_valid():
    exam = serializer.save()
    print(f"Created Online Exam: {exam.title} (ID: {exam.id}, Mode: {exam.exam_mode})")
    print(f"Questions count: {exam.questions.count()}")
    for q in exam.questions.all():
        print(f" - Q: {q.text} ({q.q_type})")
else:
    print(f"Online Serializer Errors: {serializer.errors}")
