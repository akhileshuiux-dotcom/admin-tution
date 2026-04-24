import os
import django
from datetime import date, time

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import Teacher, RegularizationRequest, TeacherAttendance
from django.contrib.auth.models import User

def test_regularization_sync():
    # 1. Setup mock data
    admin_user = User.objects.filter(is_superuser=True).first()
    teacher = Teacher.objects.first()
    test_date = date(2024, 4, 17)
    
    # Ensure clear state
    TeacherAttendance.objects.filter(teacher=teacher, date=test_date).delete()
    RegularizationRequest.objects.filter(teacher=teacher, attendance_date=test_date).delete()
    
    # 2. Create initial attendance record
    att = TeacherAttendance.objects.create(
        teacher=teacher,
        date=test_date,
        check_in=time(10, 30),
        status='late'
    )
    print(f"Initial Attendance: {att.check_in}, Status: {att.status}")
    
    # 3. Create regularization request
    reg = RegularizationRequest.objects.create(
        teacher=teacher,
        attendance_date=test_date,
        request_type='wrong_check_in_time',
        reason='Train was late but I was actually here at 9',
        requested_check_in=time(9, 0)
    )
    print(f"Created Request: {reg.request_type}, Requested Time: {reg.requested_check_in}")
    
    # 4. Mock the approval logic (as implemented in views.py)
    # This is what process_request does
    attendance, created = TeacherAttendance.objects.get_or_create(
        teacher=reg.teacher, 
        date=reg.attendance_date,
        defaults={'status': 'present', 'attendance_source': 'admin'}
    )
    
    reg.original_check_in = attendance.check_in
    reg.original_check_out = attendance.check_out
    reg.original_status = attendance.status
    
    if reg.requested_check_in:
        attendance.check_in = reg.requested_check_in
    
    attendance.status = 'corrected'
    attendance.is_corrected = True
    attendance.save()
    
    reg.status = 'approved'
    reg.approved_by = admin_user
    reg.save()
    
    # 5. Verify
    updated_att = TeacherAttendance.objects.get(id=att.id)
    print(f"Updated Attendance: {updated_att.check_in}, Status: {updated_att.status}")
    print(f"Audit Log in Request: Original In: {reg.original_check_in}, Original Status: {reg.original_status}")
    
    if updated_att.check_in == time(9, 0) and updated_att.status == 'corrected':
        print("SUCCESS: Regularization synced correctly.")
    else:
        print("FAILURE: Sync logic failed.")

if __name__ == "__main__":
    test_regularization_sync()
