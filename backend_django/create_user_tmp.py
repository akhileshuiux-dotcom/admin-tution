import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from users.models import User

email = 'Akhil@gmail.com'
password = 'Akhil@123'
username = 'akhil'
name = 'Akhil'
role = 'Admin'

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        name=name,
        role=role
    )
    print(f"User {email} created successfully.")
else:
    print(f"User {email} already exists.")
