import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Student, StudentPayment

def cleanup():
    print("Starting data cleanup...")
    
    # 1. Clean up Student ID 3 (John Doe)
    try:
        student = Student.objects.get(id=3)
        print(f"Cleaning up Student: {student}")
        
        # Repaire address
        if student.permanent_address == "sdfghjklwertyuiop[]dfghj,.":
            student.permanent_address = "123 Main Street, Springfield, IL 62704"
            print("Repaired permanent address.")
        
        # Ensure reasonable default for monthly_fee if it is 0
        if student.monthly_fee == 0:
            student.monthly_fee = 1500.00
            print("Set default monthly_fee to 1500.00")
            
        student.save()
        
        # 2. Remove Duplicate Payments for Student ID 3
        all_payments = StudentPayment.objects.filter(student=student)
        seen = set()
        duplicates_removed = 0
        for p in all_payments:
            # Identifier for "duplicate": same student, amount, month, and date
            # We already filtered by student, so we check the others
            identifier = (p.amount, p.month, p.date)
            if identifier in seen:
                print(f"Removing duplicate payment: ID {p.id}, Amount {p.amount}, Month {p.month}")
                p.delete()
                duplicates_removed += 1
            else:
                seen.add(identifier)
        
        print(f"Removed {duplicates_removed} duplicate payments.")
        
    except Student.DoesNotExist:
        print("Student ID 3 not found. Skipping student cleanup.")

    print("Cleanup complete!")

if __name__ == "__main__":
    cleanup()
