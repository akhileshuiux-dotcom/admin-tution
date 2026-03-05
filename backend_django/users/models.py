from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Admission Manager', 'Admission Manager'),
        ('Education Manager', 'Education Manager'),
        ('Tutor', 'Tutor'),
        ('Account Manager', 'Account Manager'),
        ('Admin', 'Admin'),
    )
    
    # We use username from AbstractUser, but we might want to default it to email if needed
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name', 'role']

    def __str__(self):
        return f"{self.name} ({self.role})"
