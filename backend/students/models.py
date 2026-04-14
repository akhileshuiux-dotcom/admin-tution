from django.db import models
from django.contrib.auth.models import User
import datetime

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
        ('lead', 'Lead'),
        ('active', 'Active'),
        ('pending_renewal', 'Pending Renewal'),
        ('discontinued', 'Discontinued'),
        # old choices kept below for db integrity if any exist, but they are removed from UI
        ('new', 'New'),
        ('inactive', 'Inactive'),
        ('completed', 'Completed'),
        ('scheduled_leave', 'Scheduled Leave'),
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
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    assigned_teacher = models.ForeignKey('Teacher', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_students')
    lead_source = models.CharField(max_length=100, blank=True)
    reference_by = models.CharField(max_length=100, blank=True)

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
    employee_id = models.CharField(max_length=20, unique=True, blank=True)
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=100)
    monthly_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    def save(self, *args, **kwargs):
        if not self.employee_id:
            import time
            self.employee_id = f"EMP-{int(time.time())}"
            
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            # Local import to avoid circular dependency
            from .models import TeacherSalary
            current_month = datetime.datetime.now().strftime('%B %Y')
            if not TeacherSalary.objects.filter(teacher=self, month=current_month).exists():
                TeacherSalary.objects.create(
                    teacher=self,
                    month=current_month,
                    basic_salary=self.monthly_salary,
                    status='unpaid'
                )

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
        ('video_file', 'Video Upload'),
        ('link', 'External Link'),
        ('audio', 'Audio Note'),
    )
    SECTION_CHOICES = (
        ('syllabus', 'Syllabus'),
        ('notes', 'Class Notes'),
        ('assignment', 'Assignments'),
        ('reference', 'Reference Materials'),
        ('video', 'Videos'),
        ('general', 'General'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='resources')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True, related_name='resources')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True) # Added description for dashboard
    file_type = models.CharField(max_length=10, choices=RESOURCE_TYPES)
    section = models.CharField(max_length=20, choices=SECTION_CHOICES, default='general')
    file = models.FileField(upload_to='resources/', null=True, blank=True)
    url = models.CharField(max_length=500, blank=True, null=True) # Optional URL fallback
    target_grade = models.CharField(max_length=20, blank=True, null=True, help_text='Target class/standard for this resource (e.g. Class 10)')
    requires_submission = models.BooleanField(default=False, help_text='Whether students must submit/upload to complete this note')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class NoteAssignment(models.Model):
    """Tracks student completion of notes/assignments via actual file submission."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    )
    note = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='assignments')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='note_assignments')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    submission_file = models.FileField(upload_to='note_submissions/', null=True, blank=True)
    submission_text = models.TextField(blank=True)  # Optional text response
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('note', 'student')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.note.title} ({self.status})"

class Exam(models.Model):
    EXAM_MODES = (
        ('offline', 'Offline'),
        ('online', 'Online'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')
    title = models.CharField(max_length=200)
    duration_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=False)
    enable_focus_mode = models.BooleanField(default=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    exam_mode = models.CharField(max_length=10, choices=EXAM_MODES, default='offline')
    location = models.CharField(max_length=200, blank=True) # For offline
    preparation_instructions = models.TextField(blank=True)
    
    def __str__(self):
        return self.title

class Question(models.Model):
    QUESTION_TYPES = (
        ('mcq', 'Multiple Choice'),
        ('short', 'Short Answer'),
        ('long', 'Long Answer'),
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
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('evaluated', 'Evaluated'),
        ('published', 'Published'),
        ('pending', 'Pending'),
    )
    PAYMENT_METHODS = ( # Defined PAYMENT_METHODS for use in this model
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
        ('card', 'Card'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)  # Raw score/Total obtained
    total_marks = models.FloatField(default=0.0) # Maximum possible
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    transaction_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    percentage = models.FloatField(default=0.0) # Added percentage for dashboard
    grade = models.CharField(max_length=10, blank=True) # Added grade for dashboard
    installment_number = models.IntegerField(null=True, blank=True)
    
    tab_switch_count = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    teacher_feedback = models.TextField(blank=True)
    is_published = models.BooleanField(default=False) # Legacy field, synced with status

    def save(self, *args, **kwargs):
        # Sync legacy is_published with status bidirectionally
        if self.is_published:
            self.status = 'published'
        elif self.status == 'published':
            self.is_published = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.user.username} - {self.exam.title}"

class SubjectMark(models.Model):
    result = models.ForeignKey(ExamResult, on_delete=models.CASCADE, related_name='subject_performance')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    marks_obtained = models.FloatField()
    max_marks = models.FloatField(default=100.0)

    def __str__(self):
        return f"{self.subject.name}: {self.marks_obtained}/{self.max_marks}"

class StudentAnswer(models.Model):
    result = models.ForeignKey(ExamResult, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField()
    is_correct = models.BooleanField(null=True, blank=True) # For manual/auto grading
    marks_obtained = models.IntegerField(default=0)

    def __str__(self):
        return f"Ans: {self.question.id} for {self.result.id}"

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
    MEETING_TYPES = (
        ('online', 'Online'),
        ('offline', 'Offline'),
    )
    title = models.CharField(max_length=200)
    date_time = models.DateTimeField()
    end_time = models.TimeField(null=True, blank=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    meeting_type = models.CharField(max_length=15, choices=MEETING_TYPES, default='offline')
    meeting_link = models.URLField(max_length=500, blank=True)
    mandatory_for_all = models.BooleanField(default=False)
    attendees = models.ManyToManyField(Teacher, related_name='admin_meetings', blank=True)

    def __str__(self):
        return f"{self.title} on {self.date_time.strftime('%Y-%m-%d %H:%M')}"

class StudentPayment(models.Model):
    PAYMENT_STATUS = (('paid', 'Paid'), ('partial', 'Partial'), ('unpaid', 'Unpaid'))
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    month = models.CharField(max_length=20) # e.g., "January 2024"
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='pending')
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            try:
                old_status = StudentPayment.objects.get(pk=self.pk).status
            except: pass
            
        super().save(*args, **kwargs)
        
        if self.status == 'paid' and (is_new or old_status != 'paid'):
            # Only create if not already exists for this payment
            if not FinancialTransaction.objects.filter(reference_id=f"PAY-{self.id}").exists():
                FinancialTransaction.objects.create(
                    date=self.date,
                    transaction_type='income',
                    category='fee',
                    amount=self.amount,
                    payment_mode=self.payment_method or 'cash',
                    reference_id=f"PAY-{self.id}",
                    person_name=self.student.user.get_full_name(),
                    description=f"Fee payment for {self.month}"
                )

    def __str__(self):
        return f"{self.student.user.username} - {self.month} - {self.amount}"

class TeacherSalary(models.Model):
    SALARY_STATUS = (('paid', 'Paid'), ('unpaid', 'Unpaid'), ('pending', 'Pending'))
    PAYMENT_MODES = (('cash', 'Cash'), ('bank_transfer', 'Bank Transfer'), ('upi', 'UPI'), ('cheque', 'Cheque'))
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='salaries')
    month = models.CharField(max_length=50) # e.g., "March 2024"
    
    # Salary Period
    total_working_days = models.IntegerField(default=30)
    paid_days = models.FloatField(default=0.0)
    leave_days = models.FloatField(default=0.0)
    
    # Earning & Deductions
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    extra_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Keep for legacy
    deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Keep for legacy
    
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # This acts as NET SALARY
    
    # Dynamic Data (Stored as JSON for flexibility)
    earnings_json = models.JSONField(default=dict, blank=True)
    deductions_json = models.JSONField(default=dict, blank=True)
    
    # Payment Details
    status = models.CharField(max_length=15, choices=SALARY_STATUS, default='unpaid')
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODES, blank=True, null=True)
    payment_date = models.DateField(null=True, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_salaries')

    class Meta:
        unique_together = ('teacher', 'month')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            try:
                old_status = TeacherSalary.objects.get(pk=self.pk).status
            except: pass
            
        # We calculate total_amount here to ensure compatibility
        if not self.total_amount or self.total_amount == 0:
             self.total_amount = self.gross_salary - self.total_deductions
             
        super().save(*args, **kwargs)
        
        if self.status == 'paid' and (is_new or old_status != 'paid'):
            FinancialTransaction.objects.create(
                date=self.payment_date or datetime.datetime.now().date(),
                transaction_type='expense',
                category='salary',
                amount=self.total_amount,
                payment_mode=self.payment_mode or 'cash',
                reference_id=f"SAL-{self.id}",
                person_name=self.teacher.user.get_full_name(),
                description=f"Salary disbursement to {self.teacher.user.get_full_name()} for {self.month}"
            )

    def __str__(self):
        return f"{self.teacher.user.username} - {self.month} - {self.total_amount}"

class Expense(models.Model):
    PAYMENT_MODES = (('cash', 'Cash'), ('bank_transfer', 'Bank Transfer'), ('upi', 'UPI'), ('card', 'Card'))
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.CharField(max_length=100) # "Rent", "Utility", "Marketing", etc.
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODES, default='cash')
    description = models.TextField(blank=True)
    voucher_url = models.TextField(blank=True) # For receipt links
    attachment = models.FileField(upload_to='expenses/', null=True, blank=True)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            FinancialTransaction.objects.create(
                date=self.date,
                transaction_type='expense',
                category='expense',
                amount=self.amount,
                payment_mode=self.payment_mode,
                reference_id=f"EXP-{self.id}",
                person_name=self.title,
                description=f"{self.category}: {self.title}"
            )

    def __str__(self):
        return f"{self.title} - {self.amount}"

class Income(models.Model):
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    source = models.CharField(max_length=100) # "Donation", "Extra service", etc.
    category = models.CharField(max_length=100, default='Other') # Add category for income
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            FinancialTransaction.objects.create(
                date=self.date,
                transaction_type='income',
                category='other',
                amount=self.amount,
                payment_mode='cash',
                reference_id=f"INC-{self.id}",
                person_name=self.source,
                description=f"{self.title} from {self.source}"
            )

    def __str__(self):
        return f"{self.title} - {self.amount}"

class FeeInstallment(models.Model):
    STATUS_CHOICES = (('pending', 'Pending'), ('paid', 'Paid'), ('overdue', 'Overdue'))
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='installments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None
        if not is_new:
            try: old_status = FeeInstallment.objects.get(pk=self.pk).status
            except: pass
        super().save(*args, **kwargs)
        if self.status == 'paid' and (is_new or old_status != 'paid'):
            # This is a redundant record if StudentPayment already creates one, 
            # but FeeInstallment is the "Schedule". 
            # Actually, StudentPayment represents the ACTUAL CASH FLOW.
            # So if we mark installment as paid, we should probably create a StudentPayment record first?
            # Or just log it here if it's "Marked Paid" directly.
            FinancialTransaction.objects.get_or_create(
                reference_id=f"INST-{self.id}",
                defaults={
                    'date': datetime.datetime.now().date(),
                    'transaction_type': 'income',
                    'category': 'fee',
                    'amount': self.amount,
                    'payment_mode': 'cash',
                    'person_name': self.student.user.get_full_name(),
                    'description': f"Installment payment for {self.student.user.get_full_name()}"
                }
            )

    def __str__(self):
        return f"{self.student.user.username} - Installment - {self.amount} - {self.due_date}"

class FeeTier(models.Model):
    grade = models.CharField(max_length=20, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Grade {self.grade} - ${self.amount}"

class StudentDiscount(models.Model):
    DISCOUNT_TYPES = (('percentage', 'Percentage'), ('fixed', 'Fixed Amount'))
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='discounts')
    course = models.ForeignKey('Course', on_delete=models.CASCADE, null=True, blank=True)
    discount_type = models.CharField(max_length=15, choices=DISCOUNT_TYPES, default='percentage')
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # percentage or fixed amount
    reason = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.value} ({self.discount_type})"

class Invoice(models.Model):
    STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('partially_paid', 'Partially Paid'),
    )
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    month = models.CharField(max_length=30) # e.g., "March 2024"
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            import datetime
            now = datetime.datetime.now()
            # Format: INV-202403-1234
            count = Invoice.objects.filter(created_at__year=now.year, created_at__month=now.month).count() + 1
            self.invoice_number = f"INV-{now.strftime('%Y%m')}-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - {self.student.user.username}"

class CreditAdvance(models.Model):
    TYPES = (('advance', 'Teacher Advance'), ('refund', 'Student Refund'), ('loan', 'Loan Given'))
    STATUS = (('pending', 'Pending'), ('cleared', 'Cleared'))
    type = models.CharField(max_length=15, choices=TYPES)
    person_name = models.CharField(max_length=200) # Can be linked to student/teacher user if needed
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    reason = models.TextField(blank=True)
    amount_paid_back = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=15, choices=STATUS, default='pending')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_paid_back = 0
        if not is_new:
            try:
                old_paid_back = CreditAdvance.objects.get(pk=self.pk).amount_paid_back
            except: pass
            
        self.remaining_balance = self.amount - self.amount_paid_back
        if self.remaining_balance <= 0:
            self.status = 'cleared'
        super().save(*args, **kwargs)
        
        # Credit Given is an Expense
        if is_new:
            FinancialTransaction.objects.create(
                date=self.date,
                transaction_type='expense',
                category='credit',
                amount=self.amount,
                reference_id=f"CRD-OUT-{self.id}",
                person_name=self.person_name,
                description=f"Credit/Advance given to {self.person_name}"
            )
        
        # Repayment is an Income
        if old_paid_back is not None and self.amount_paid_back > old_paid_back:
            repayment_amount = self.amount_paid_back - old_paid_back
            FinancialTransaction.objects.create(
                date=datetime.datetime.now().date(),
                transaction_type='income',
                category='credit',
                amount=repayment_amount,
                reference_id=f"CRD-IN-{self.id}",
                person_name=self.person_name,
                description=f"Repayment of Credit/Advance by {self.person_name}"
            )

    def __str__(self):
        return f"{self.type} - {self.person_name} - {self.amount}"

class FinancialTransaction(models.Model):
    TRANS_TYPES = (('income', 'Income'), ('expense', 'Expense'))
    CATEGORIES = (('fee', 'Fee'), ('salary', 'Salary'), ('expense', 'Expense'), ('credit', 'Credit'), ('refund', 'Refund'))
    PAYMENT_MODES = (('cash', 'Cash'), ('bank_transfer', 'Bank Transfer'), ('upi', 'UPI'), ('card', 'Card'))
    
    transaction_type = models.CharField(max_length=10, choices=TRANS_TYPES)
    category = models.CharField(max_length=15, choices=CATEGORIES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODES, default='cash')
    reference_id = models.CharField(max_length=100, blank=True) # Linked ID from other models
    person_name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.category} - {self.amount}"


class OnlineClass(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='online_classes')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='GENERAL')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    link = models.URLField(max_length=500)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"{self.title} - {self.date} ({self.teacher.user.get_full_name()})"


class TeacherMeeting(models.Model):
    """Meetings created by teachers for their students — separate from Admin meetings."""
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='teacher_meetings')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date_time = models.DateTimeField()
    meeting_link = models.URLField(max_length=500, blank=True)
    # Optional: target specific students; if empty → all students of this teacher
    students = models.ManyToManyField(Student, blank=True, related_name='teacher_meetings')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_time']

    def __str__(self):
        return f"{self.title} by {self.teacher.user.get_full_name()} on {self.date_time.strftime('%Y-%m-%d %H:%M')}"

class PreviousYearPaper(models.Model):
    MODE_CHOICES = (
        ('practice', 'Practice Mode'),
        ('exam', 'Exam Mode'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='previous_papers', null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='previous_papers')
    title = models.CharField(max_length=200)
    exam_name = models.CharField(max_length=200, blank=True)
    year = models.IntegerField()
    duration_minutes = models.PositiveIntegerField(default=60)
    total_marks = models.PositiveIntegerField(default=100)
    instructions = models.TextField(blank=True)
    file = models.FileField(upload_to='previous_papers/')
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='practice')
    is_premium = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-year', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.year})"

class PaperQuestion(models.Model):
    QUESTION_TYPES = (
        ('mcq', 'Multiple Choice'),
        ('descriptive', 'Descriptive'),
    )
    paper = models.ForeignKey(PreviousYearPaper, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    q_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='mcq')
    points = models.IntegerField(default=1)
    
    # For MCQ
    option_a = models.CharField(max_length=200, blank=True)
    option_b = models.CharField(max_length=200, blank=True)
    option_c = models.CharField(max_length=200, blank=True)
    option_d = models.CharField(max_length=200, blank=True)
    correct_option = models.CharField(max_length=1, blank=True, help_text="A, B, C, or D")
    
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"{self.paper.title} - Q: {self.text[:30]}..."

class PaperAttempt(models.Model):
    STATUS_CHOICES = (
        ('in-progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('evaluated', 'Evaluated'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='paper_attempts')
    paper = models.ForeignKey(PreviousYearPaper, on_delete=models.CASCADE, related_name='attempts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in-progress')
    score = models.FloatField(default=0.0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.paper.title}"

class PaperAnswer(models.Model):
    attempt = models.ForeignKey(PaperAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(PaperQuestion, on_delete=models.CASCADE)
    text_answer = models.TextField(blank=True)
    selected_option = models.CharField(max_length=1, blank=True)
    marks_obtained = models.FloatField(default=0.0)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Answer for {self.question}"

class PaperPurchase(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    paper = models.ForeignKey(PreviousYearPaper, on_delete=models.CASCADE)
    razorpay_order_id = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=200, blank=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    purchased_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending') # pending, success, failed

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.paper.title} ({self.status})"

