import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from students.models import LeaveRequest
try:
    leave = LeaveRequest.objects.filter(status='pending').first()
    if leave:
        print('Found pending leave:', leave.id)
        leave.status = 'approved'
        leave.save()
        print('Saved')
        # Simulate sync attendance
        from datetime import timedelta
        current_date = leave.from_date
        while current_date <= leave.to_date:
            from students.models import Holiday, TeacherAttendance
            if current_date.weekday() < 5:
                if not Holiday.objects.filter(date=current_date).exists():
                    TeacherAttendance.objects.update_or_create(
                        teacher=leave.teacher,
                        date=current_date,
                        defaults={
                            'status': 'leave',
                            'is_corrected': True,
                            'correction_reason': f"Approved Leave: {leave.leave_type.name if leave.leave_type else 'Manual'}"
                        }
                    )
            current_date += timedelta(days=1)
        print('Synced Attendance')
        
        # Simulate notification
        from students.models import Notification
        Notification.objects.create(
            recipient=leave.teacher.user,
            title='Leave Approved',
            message='test',
            notification_type='system'
        )
        print('Notification created')
    else:
        print('No pending leaves found')
except Exception as e:
    import traceback
    traceback.print_exc()
