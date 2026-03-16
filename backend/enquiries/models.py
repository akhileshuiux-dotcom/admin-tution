from django.db import models
from users.models import User

class Enquiry(models.Model):
    STATUS_CHOICES = (
        ('New', 'New'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
    )
    
    student_name = models.CharField(max_length=100)
    grade = models.CharField(max_length=50)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    preferred_channel = models.CharField(max_length=50, default='Email')
    syllabus = models.CharField(max_length=100, blank=True, null=True)
    publication = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    timezone = models.CharField(max_length=50, blank=True, null=True)
    admission_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    student_pricing = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    contact_via = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New')
    failure_reason = models.TextField(max_length=500, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student_name} - {self.grade}"

class DemoRequest(models.Model):
    STATUS_CHOICES = (
        ('New', 'New'), ('Draft', 'Draft'), ('Tutor Assigned', 'Tutor Assigned'), 
        ('Tutor Accepted', 'Tutor Accepted'), ('Demo Scheduled', 'Demo Scheduled'), 
        ('Demo Completed', 'Demo Completed'), ('Not Proceeding', 'Not Proceeding'), 
        ('Not Interested', 'Not Interested'), ('Redemo', 'Redemo'), 
        ('Demo Successful', 'Demo Successful'), ('Plan Created', 'Plan Created')
    )
    
    enquiry = models.ForeignKey(Enquiry, related_name='demo_requests', on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    topic = models.CharField(max_length=200, blank=True, null=True)
    preferred_date = models.DateField(blank=True, null=True)
    preferred_time = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='New')
    
    assigned_tutors = models.ManyToManyField(User, related_name='assigned_demo_requests', blank=True)
    final_tutor = models.ForeignKey(User, related_name='final_demo_requests', on_delete=models.SET_NULL, null=True, blank=True)
    demo_conducted_duration_ms = models.IntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class FollowUp(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'), ('Completed', 'Completed'), 
        ('Rescheduled', 'Rescheduled'), ('Closed', 'Closed')
    )
    
    enquiry = models.ForeignKey(Enquiry, related_name='follow_ups', on_delete=models.CASCADE)
    date = models.DateTimeField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    resolution_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
