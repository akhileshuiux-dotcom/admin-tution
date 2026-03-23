from django.db import models
from django.contrib.auth.models import User

class Student(models.Model):
    PLAN_TYPES = (
        ('one-on-one', 'One-on-One'),
        ('batch', 'Batch'),
        ('twin', 'Twin'),
        ('revision', 'Revision'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )
    PLAN_STATUS_CHOICES = (
        ('new', 'New'),
        ('active', 'Active'),
        ('pending_renewal', 'Pending Renewal'),
        ('inactive', 'Inactive'),
        ('completed', 'Completed'),
        ('scheduled_leave', 'Scheduled Leave'),
        ('discontinued', 'Discontinued'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, unique=True, blank=True) # Allow blank for auto-generation
    grade = models.CharField(max_length=10)
    enrolled_date = models.DateField(auto_now_add=True)
    bio = models.TextField(blank=True)
    points = models.IntegerField(default=0)
    parent_name = models.CharField(max_length=100, blank=True)
    parent_contact = models.CharField(max_length=50, blank=True)
    medical_info = models.TextField(blank=True)
    
    # New Fields
    subjects = models.ManyToManyField('Subject', related_name='students', blank=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, default='one-on-one')
    syllabus = models.CharField(max_length=100, blank=True)
    sessions_per_week = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=255, blank=True)
    learning_goals = models.TextField(blank=True)
    special_requirements = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    plan_status = models.CharField(max_length=20, choices=PLAN_STATUS_CHOICES, default='new')

    def save(self, *args, **kwargs):
        if not self.student_id:
            # Simple auto-generation logic: STD-UNIXTIMESTAMP or similar
            import time
            self.student_id = f"STD-{int(time.time())}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"

class Teacher(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

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
    scheduled_date = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    preparation_instructions = models.TextField(blank=True)
    
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
    score = models.IntegerField(default=0)  # Acts as raw_score
    average_score = models.FloatField(default=0.0)
    tab_switch_count = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    teacher_feedback = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.user.username} - {self.exam.title}"

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='marked_attendance')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.date} - {self.status}"

class TeacherAttendance(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    )
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ('teacher', 'date')

    def __str__(self):
        return f"{self.teacher.user.get_full_name()} - {self.date} - {self.status}"

class AdminMeeting(models.Model):
    title = models.CharField(max_length=200)
    date_time = models.DateTimeField()
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    mandatory_for_all = models.BooleanField(default=False)
    attendees = models.ManyToManyField(Teacher, related_name='admin_meetings', blank=True)

    def __str__(self):
        return f"{self.title} on {self.date_time.strftime('%Y-%m-%d %H:%M')}"

class StudentPayment(models.Model):
    PAYMENT_STATUS = (('paid', 'Paid'), ('pending', 'Pending'))
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    month = models.CharField(max_length=20) # e.g., "January 2024"
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='pending')
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.month} - {self.amount}"

class TeacherSalary(models.Model):
    SALARY_STATUS = (('paid', 'Paid'), ('pending', 'Pending'))
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='salaries')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date = models.DateField()
    month = models.CharField(max_length=20)
    status = models.CharField(max_length=10, choices=SALARY_STATUS, default='pending')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.teacher.user.username} - {self.month} - {self.amount}"

class Expense(models.Model):
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.CharField(max_length=100) # "Rent", "Utility", "Marketing", etc.
    description = models.TextField(blank=True)
    voucher_url = models.TextField(blank=True) # For receipt links

    def __str__(self):
        return f"{self.title} - {self.amount}"

class Income(models.Model):
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    source = models.CharField(max_length=100) # "Donation", "Extra service", etc.
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"

class FeeTier(models.Model):
    grade = models.CharField(max_length=20, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Grade {self.grade} - ${self.amount}"

class StudentDiscount(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='discount')
    percentage = models.PositiveIntegerField(default=0) # e.g., 10 for 10%
    reason = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.percentage}%"

class Invoice(models.Model):
    STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('partially_paid', 'Partially Paid'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    month = models.CharField(max_length=30) # e.g., "March 2024"
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice - {self.student.user.username} - {self.month}"
