from django.db import models
from django.conf import settings

class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, unique=True)
    grade = models.CharField(max_length=10)
    enrolled_date = models.DateField(auto_now_add=True)
    bio = models.TextField(blank=True)
    points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"

class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=100)

    def __str__(self):
        return f"Prof. {self.user.last_name} ({self.employee_id})"

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name

class Course(models.Model):
    name = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='courses')
    grade_level = models.CharField(max_length=10) # e.g., '1st', '12th'
    description = models.TextField()

    def __str__(self):
        return f"{self.name} ({self.grade_level})"

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    date_published = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Resource(models.Model):
    RESOURCE_TYPES = (
        ('pdf', 'PDF Document'),
        ('video', 'Video Link'),
        ('link', 'External Link'),
        ('audio', 'Audio Note'),
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    file_type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    url = models.URLField() # or FileField if configured

    def __str__(self):
        return self.title

class Exam(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')
    title = models.CharField(max_length=200)
    duration_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=False)
    enable_focus_mode = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPES = (
        ('mcq', 'Multiple Choice'),
        ('desc', 'Descriptive'),
    )
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    q_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    points = models.IntegerField(default=1)
    
    # For MCQ
    option_a = models.CharField(max_length=200, blank=True)
    option_b = models.CharField(max_length=200, blank=True)
    option_c = models.CharField(max_length=200, blank=True)
    option_d = models.CharField(max_length=200, blank=True)
    correct_option = models.CharField(max_length=1, blank=True) # A, B, C, D

    def __str__(self):
        return f"Q: {self.text[:50]}..."

class ExamResult(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    tab_switch_count = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    teacher_feedback = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.exam.title}"
