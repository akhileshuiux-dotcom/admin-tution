import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from enquiries.models import Enquiry

try:
    enq = Enquiry.objects.create(
        student_name="Debug Student",
        grade="10",
        contact_number="1234567890",
        location="Test",
        country="Test"
    )
    print(f"Success! Created Enquiry with ID: {enq.id}")
except Exception as e:
    print(f"Failed to create Enquiry: {e}")
    import traceback
    traceback.print_exc()
