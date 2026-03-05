from django.db import models
from users.models import User
from enquiries.models import Enquiry

class Student(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    )
    
    full_name = models.CharField(max_length=100)
    grade = models.CharField(max_length=50)
    syllabus = models.CharField(max_length=100, blank=True, null=True)
    academic_year = models.CharField(max_length=50, blank=True, null=True)
    medium_of_communication = models.JSONField(default=list, blank=True) # e.g. ["English", "Malayalam"]
    publication = models.CharField(max_length=100, blank=True, null=True)
    contact_method = models.JSONField(default=list, blank=True)
    location = models.CharField(max_length=100)
    school = models.CharField(max_length=200, blank=True, null=True)
    parent_remarks = models.TextField(max_length=500, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    timezone = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=100)
    whatsapp_group = models.CharField(max_length=100, blank=True, null=True)
    contact_via = models.CharField(max_length=100, blank=True, null=True)

    parent_name = models.CharField(max_length=100, blank=True, null=True)
    tutor = models.CharField(max_length=100, blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    enquiry_ref = models.ForeignKey(Enquiry, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_students')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name

class Tutor(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Scheduled Leave', 'Scheduled Leave'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tutor_profile')
    contact_number = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    educational_qualifications = models.JSONField(default=list, blank=True)
    teaching_experience_months = models.IntegerField(blank=True, null=True)
    
    # Store complex arrays of objects as JSON for simplicity, or we could create related models
    subject_expertise = models.JSONField(default=list, blank=True) # [{subject: String, proficiency: String}]
    classes_can_teach = models.JSONField(default=list, blank=True)
    syllabus_expertise = models.JSONField(default=list, blank=True) # [{syllabus: String, experienceYears: String}]
    languages_spoken = models.JSONField(default=list, blank=True) # [{language: String, proficiency: String}]
    
    google_meet_link = models.URLField(blank=True, null=True)
    network_connectivity = models.CharField(max_length=100, blank=True, null=True)
    device = models.CharField(max_length=100, blank=True, null=True)
    board_type = models.CharField(max_length=100, blank=True, null=True)
    
    bank_details = models.JSONField(default=dict, blank=True)
    availability = models.JSONField(default=list, blank=True) # [{dayOfWeek: String, startTime: String, ...}]
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Active')
    remarks = models.JSONField(default=list, blank=True) # [{date: Date, comment: String, severity: String}]

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.name

class Plan(models.Model):
    PLAN_TYPE_CHOICES = (
        ('One-on-One', 'One-on-One'), ('Twin', 'Twin'), 
        ('Batch', 'Batch'), ('Revision', 'Revision')
    )
    STATUS_CHOICES = (
        ('New', 'New'), ('Active', 'Active'), ('Pending Renewal', 'Pending Renewal'), 
        ('Inactive', 'Inactive'), ('Course Completion', 'Course Completion'), 
        ('Scheduled Leave (Normal)', 'Scheduled Leave (Normal)'), 
        ('Scheduled Leave (Annual)', 'Scheduled Leave (Annual)'), 
        ('Discontinuation', 'Discontinuation'), ('Tutor Change', 'Tutor Change')
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='plans')
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE, related_name='plans')
    subject = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=50, choices=PLAN_TYPE_CHOICES)
    sessions_per_week = models.IntegerField()
    session_duration = models.FloatField() # in hours
    
    schedule_pattern = models.JSONField(default=list, blank=True) # [{dayOfWeek: String, time: String}]
    
    batch_ref = models.CharField(max_length=100, blank=True, null=True) # Mock ObjectId as string for now
    twin_student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='twin_plans')
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='New')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} Plan for {self.student.full_name}"

class SubPlan(models.Model):
    PAYMENT_STATUS_CHOICES = (('Pending', 'Pending'), ('Paid', 'Paid'))

    plan = models.ForeignKey(Plan, related_name='sub_plans', on_delete=models.CASCADE)
    cycle_number = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    total_sessions = models.IntegerField()
    fee_per_session = models.DecimalField(max_digits=10, decimal_places=2)
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    one_time_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')

class Session(models.Model):
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'), ('Completed', 'Completed'), ('Rescheduled', 'Rescheduled'), 
        ('Rescheduled: New', 'Rescheduled: New'), ('Cancelled', 'Cancelled'), ('Disputed', 'Disputed')
    )
    
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='sessions')
    sub_plan = models.ForeignKey(SubPlan, on_delete=models.SET_NULL, null=True, blank=True)
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE)
    student_refs = models.ManyToManyField(Student, blank=True) # Array for batched sessions
    
    subject = models.CharField(max_length=100)
    scheduled_date = models.DateField()
    scheduled_time = models.CharField(max_length=50) # "HH:MM"
    duration_hours = models.FloatField()
    google_meet_link = models.URLField(blank=True, null=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Scheduled')
    attendance = models.JSONField(default=list, blank=True) # [{studentRef: ID, status: 'Present'/'Absent'}]
    
    homework_given = models.BooleanField(default=False)
    homework_notes = models.TextField(blank=True, null=True)
    
    original_session = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    managers_remarks = models.JSONField(default=list, blank=True) # [{author_id, category, severity, comment, date}]

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Payment(models.Model):
    STATUS_CHOICES = (('Verified', 'Verified'), ('Pending', 'Pending'), ('Failed', 'Failed'))

    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='payments')
    sub_plan = models.ForeignKey(SubPlan, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_received = models.DecimalField(max_digits=10, decimal_places=2)

    bank_account_credited = models.CharField(max_length=100)

    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Verified')

    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)

    payment_method = models.CharField(max_length=50, blank=True, null=True)
    receipt_id = models.CharField(max_length=100, blank=True, null=True)
    is_one_time_fee_included = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
