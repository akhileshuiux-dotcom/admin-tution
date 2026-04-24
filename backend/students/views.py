from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.db.models import Q
from .models import (
    Student, Teacher, Subject, Course, Lesson, Resource, 
    Exam, Question, ExamResult, Attendance, AdminMeeting,
    StudentPayment, TeacherSalary, Expense, Income, TeacherAttendance,
    FeeTier, StudentDiscount, Invoice, CreditAdvance, FinancialTransaction,
    FeeInstallment, NoteAssignment, OnlineClass, TeacherMeeting,
    PreviousYearPaper, PaperQuestion, PaperAttempt, PaperAnswer, PaperPurchase, Post, TeacherPermission,
    Holiday, SchoolSettings, RegularizationRequest, Notification, PasswordResetRequest,
    LeaveType, LeaveRequest, TeacherLeaveAllocation
)
from .serializers import (
    StudentSerializer, TeacherSerializer, SubjectSerializer, 
    CourseSerializer, LessonSerializer, ResourceSerializer, 
    ExamSerializer, QuestionSerializer, ExamResultSerializer, 
    UserSerializer, AttendanceSerializer, AdminMeetingSerializer,
    StudentPaymentSerializer, TeacherSalarySerializer, ExpenseSerializer, 
    IncomeSerializer, TeacherAttendanceSerializer, HolidaySerializer,
    FeeTierSerializer, StudentDiscountSerializer, InvoiceSerializer,
    CreditAdvanceSerializer, FinancialTransactionSerializer, UserSerializer,
    FeeInstallmentSerializer, NoteAssignmentSerializer, OnlineClassSerializer, TeacherMeetingSerializer,
    PreviousYearPaperSerializer, PaperQuestionSerializer, PaperAttemptSerializer, PaperAnswerSerializer, PaperPurchaseSerializer,
    PostSerializer, TeacherPermissionSerializer, SchoolSettingsSerializer, RegularizationRequestSerializer,
    NotificationSerializer, PasswordResetRequestSerializer,
    LeaveTypeSerializer, LeaveRequestSerializer, TeacherLeaveAllocationSerializer
)

from rest_framework.views import APIView

def get_profile_data(user):
    # 1. Check for Teacher
    if hasattr(user, 'teacher_profile'):
        teacher = user.teacher_profile
        serializer = TeacherSerializer(teacher)
        data = serializer.data
        data['role'] = 'teacher'
        
        # Include Teacher Permissions
        from .models import TeacherPermission
        perm_obj = TeacherPermission.objects.first()
        if not perm_obj:
            # Create default if missing
            perm_obj = TeacherPermission.objects.create(permissions=TeacherPermission.get_default_permissions())
        data['permissions'] = perm_obj.permissions
        
        return data
        
    # 2. Check for Student
    if hasattr(user, 'student_profile'):
        student = user.student_profile
        serializer = StudentSerializer(student)
        data = serializer.data
        data['role'] = 'student'
        return data
        
    # 3. Check for Admin
    if user.is_superuser or user.is_staff:
        return {
            'role': 'admin',
            'user': UserSerializer(user).data
        }
    
    return {'role': 'guest', 'user': UserSerializer(user).data}

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    identifier = request.data.get('username', '').strip()
    password = request.data.get('password')
    
    # Try authentication with identifier as username (case-insensitive)
    user = authenticate(username=identifier, password=password)
    
    # If failed, try finding user by email (case-insensitive)
    if not user:
        try:
            user_obj = User.objects.get(email__iexact=identifier)
            user = authenticate(username=user_obj.username, password=password)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            pass
            
    # If still failed, try finding user by username (case-insensitive) for some reason
    if not user:
        try:
            user_obj = User.objects.get(username__iexact=identifier)
            user = authenticate(username=user_obj.username, password=password)
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            pass

    if user:
        login(request, user)
        data = get_profile_data(user)
        return Response(data)
    
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out'})

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token_view(request):
    return Response({'detail': 'CSRF cookie set'})

@method_decorator(ensure_csrf_cookie, name='dispatch')
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = get_profile_data(request.user)
        if data.get('role') == 'guest' and not (request.user.is_staff or request.user.is_superuser):
             return Response({'error': 'Profile not found'}, status=404)
        return Response(data)

    def post(self, request):
        # Handle Change Password
        action = request.data.get('action')
        if action == 'change_password':
            user = request.user
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')
            
            if not user.check_password(old_password):
                return Response({'error': 'Incorrect current password'}, status=400)
            
            user.set_password(new_password)
            user.save()
            
            # If teacher, clear needs_password_change
            if hasattr(user, 'teacher_profile'):
                teacher = user.teacher_profile
                teacher.needs_password_change = False
                teacher.save()
                
            login(request, user) # Keep user logged in
            return Response({'message': 'Password changed successfully'})
            
        return Response({'error': 'Invalid action'}, status=400)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'plan_status', 'grade', 'subjects']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'student_id', 'parent_contact']

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['POST'])
    def reset_password(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Only admins can reset passwords'}, status=403)
        
        teacher = self.get_object()
        new_password = request.data.get('password')
        if not new_password:
            return Response({'error': 'Password is required'}, status=400)
            
        teacher.user.set_password(new_password)
        teacher.user.save()
        
        teacher.needs_password_change = True
        teacher.save()
        
        return Response({'message': f'Password for {teacher.user.get_full_name()} has been reset.'})

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Count, Q

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        resource = serializer.save()
        # Auto-create NoteAssignment records for all students in the target grade
        if resource.target_grade:
            students = Student.objects.filter(grade=resource.target_grade, status='active')
            for student in students:
                NoteAssignment.objects.get_or_create(
                    note=resource,
                    student=student,
                    defaults={'status': 'pending'}
                )

    def perform_update(self, serializer):
        resource = serializer.save()
        # If target_grade changed, create assignments for new students
        if resource.target_grade:
            students = Student.objects.filter(grade=resource.target_grade, status='active')
            for student in students:
                NoteAssignment.objects.get_or_create(
                    note=resource,
                    student=student,
                    defaults={'status': 'pending'}
                )

    @action(detail=True, methods=['GET'])
    def standard_stats(self, request, pk=None):
        """Get per-standard completion stats for a specific resource."""
        resource = self.get_object()
        assignments = NoteAssignment.objects.filter(note=resource)
        
        # Group by student grade
        stats = []
        grades = assignments.values_list('student__grade', flat=True).distinct()
        for grade in grades:
            grade_qs = assignments.filter(student__grade=grade)
            total = grade_qs.count()
            completed = grade_qs.filter(status='completed').count()
            pending = total - completed
            progress = round((completed / total) * 100, 1) if total > 0 else 0
            stats.append({
                'standard': grade,
                'total': total,
                'completed': completed,
                'pending': pending,
                'progress': progress,
            })
        
        # Overall stats
        total_all = assignments.count()
        completed_all = assignments.filter(status='completed').count()
        overall_progress = round((completed_all / total_all) * 100, 1) if total_all > 0 else 0
        
        return Response({
            'resource_id': resource.id,
            'resource_title': resource.title,
            'standards': stats,
            'overall': {
                'total': total_all,
                'completed': completed_all,
                'pending': total_all - completed_all,
                'progress': overall_progress,
            }
        })

    @action(detail=True, methods=['GET'])
    def student_list(self, request, pk=None):
        """Get the student-wise detail list for a resource, filterable by grade and status."""
        resource = self.get_object()
        assignments = NoteAssignment.objects.filter(note=resource).select_related('student', 'student__user')
        
        # Optional filters
        grade = request.query_params.get('grade')
        status_filter = request.query_params.get('status')
        if grade:
            assignments = assignments.filter(student__grade=grade)
        if status_filter:
            assignments = assignments.filter(status=status_filter)
        
        data = NoteAssignmentSerializer(assignments, many=True).data
        return Response(data)


class NoteAssignmentViewSet(viewsets.ModelViewSet):
    queryset = NoteAssignment.objects.all().select_related('student', 'student__user', 'note')
    serializer_class = NoteAssignmentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    filterset_fields = {
        'note': ['exact'],
        'student': ['exact'],
        'status': ['exact'],
        'student__grade': ['exact'],
    }

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Students only see their own assignments
        if hasattr(user, 'student_profile'):
            return qs.filter(student=user.student_profile)
        return qs

    @action(detail=True, methods=['POST'])
    def submit(self, request, pk=None):
        """Student submits a file to complete an assignment. Only students can do this."""
        user = request.user
        if not hasattr(user, 'student_profile'):
            return Response(
                {'error': 'Only students can submit assignments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        assignment = self.get_object()
        
        # Ensure this assignment belongs to the current student
        if assignment.student != user.student_profile:
            return Response(
                {'error': 'You can only submit your own assignments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        submission_file = request.FILES.get('submission_file')
        submission_text = request.data.get('submission_text', '')
        
        if not submission_file and not submission_text:
            return Response(
                {'error': 'You must upload a file or provide a text response.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the assignment
        if submission_file:
            assignment.submission_file = submission_file
        if submission_text:
            assignment.submission_text = submission_text
        assignment.status = 'completed'
        assignment.completed_at = timezone.now()
        assignment.save()
        
        return Response(NoteAssignmentSerializer(assignment).data)

    @action(detail=False, methods=['GET'])
    def my_assignments(self, request):
        """Get all assignments for current student."""
        user = request.user
        if not hasattr(user, 'student_profile'):
            return Response({'error': 'Not a student'}, status=status.HTTP_403_FORBIDDEN)
        
        qs = NoteAssignment.objects.filter(student=user.student_profile).select_related('note')
        note_id = request.query_params.get('note')
        if note_id:
            qs = qs.filter(note_id=note_id)
        
        return Response(NoteAssignmentSerializer(qs, many=True).data)

    def update(self, request, *args, **kwargs):
        """Block manual status updates — status can only change via submit action."""
        if 'status' in request.data:
            return Response(
                {'error': 'Status cannot be changed manually. Use the submit endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Block manual status updates on PATCH too."""
        if 'status' in request.data:
            return Response(
                {'error': 'Status cannot be changed manually. Use the submit endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

class ExamResultViewSet(viewsets.ModelViewSet):
    queryset = ExamResult.objects.all()
    serializer_class = ExamResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Students only see their own PUBLISHED results
        if hasattr(user, 'student_profile'):
            return qs.filter(student=user.student_profile, is_published=True)
        # Teachers and admins see all results
        return qs

    def perform_create(self, serializer):
        if not serializer.validated_data.get('student') and hasattr(self.request.user, 'student_profile'):
            serializer.save(student=self.request.user.student_profile)
        else:
            serializer.save()

    @action(detail=True, methods=['POST'])
    def evaluate(self, request, pk=None):
        result = self.get_object()
        evaluated_answers = request.data.get('answers', [])
        
        for ans_data in evaluated_answers:
            ans_id = ans_data.get('id')
            if ans_id:
                try:
                    ans_obj = StudentAnswer.objects.get(id=ans_id, result=result)
                    ans_obj.marks_obtained = int(ans_data.get('marks', 0))
                    is_correct_val = ans_data.get('is_correct')
                    if is_correct_val is not None:
                        ans_obj.is_correct = is_correct_val
                    ans_obj.save()
                except StudentAnswer.DoesNotExist:
                    pass

        answers = StudentAnswer.objects.filter(result=result).select_related('question')
        total_obtained = sum(ans.marks_obtained for ans in answers)
        total_possible = sum(ans.question.points for ans in answers)
        
        result.score = total_obtained
        if total_possible > 0:
            result.total_marks = float(total_possible)
            pct = (total_obtained / total_possible) * 100
            result.percentage = pct
            if pct >= 90: result.grade = 'A+'
            elif pct >= 80: result.grade = 'A'
            elif pct >= 70: result.grade = 'B'
            elif pct >= 60: result.grade = 'C'
            elif pct >= 50: result.grade = 'D'
            else: result.grade = 'Fail'
            
        result.status = 'evaluated'
        result.save()
        return Response(ExamResultSerializer(result).data)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = {
        'student': ['exact'],
        'date': ['exact', 'gte', 'lte'],
        'status': ['exact'],
        'teacher': ['exact'],
    }
    search_fields = ['student__user__first_name', 'student__user__last_name', 'student__student_id']
    ordering_fields = ['date', 'student__user__first_name']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if hasattr(user, 'teacher_profile') and not user.is_staff:
            return qs.filter(teacher=user.teacher_profile)
        return qs

    @action(detail=False, methods=['POST'])
    def bulk_mark(self, request):
        data = request.data
        date = data.get('date')
        teacher_id = data.get('teacher')
        records = data.get('records', [])
        
        if not date or not teacher_id:
            return Response({'error': 'Date and Teacher ID are required.'}, status=400)
            
        teacher = Teacher.objects.get(id=teacher_id)
        results = []
        for rec in records:
            student_id = rec.get('student_id')
            status = rec.get('status', 'present')
            notes = rec.get('notes', '')
            
            # Using update_or_create to handle re-marking
            obj, created = Attendance.objects.update_or_create(
                student_id=student_id,
                date=date,
                defaults={'teacher': teacher, 'status': status, 'notes': notes}
            )
            results.append(AttendanceSerializer(obj).data)
            
        return Response({'message': f'Marked {len(results)} records.', 'data': results})

import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(float(lat1)), math.radians(float(lat2))
    dphi = math.radians(float(lat2) - float(lat1))
    dlambda = math.radians(float(lon2) - float(lon1))
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

class SchoolSettingsViewSet(viewsets.ModelViewSet):
    queryset = SchoolSettings.objects.all()
    serializer_class = SchoolSettingsSerializer
    permission_classes = [IsAuthenticated]

class RegularizationRequestViewSet(viewsets.ModelViewSet):
    queryset = RegularizationRequest.objects.all().select_related('teacher', 'teacher__user')
    serializer_class = RegularizationRequestSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['teacher', 'status', 'attendance_date']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if hasattr(user, 'teacher_profile') and not user.is_staff:
            return qs.filter(teacher=user.teacher_profile)
        return qs

    @action(detail=True, methods=['POST'])
    def process_request(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Only admins can process requests.'}, status=403)
        
        reg_req = self.get_object()
        status_to_set = request.data.get('status')
        admin_note = request.data.get('admin_note', '')
        
        if status_to_set not in ['approved', 'rejected']:
            return Response({'error': 'Invalid status.'}, status=400)
            
        reg_req.status = status_to_set
        reg_req.admin_note = admin_note
        reg_req.save()
        
        # If approved, sync requested times and capture audit trail
        if status_to_set == 'approved':
            try:
                attendance, created = TeacherAttendance.objects.get_or_create(
                    teacher=reg_req.teacher, 
                    date=reg_req.attendance_date,
                    defaults={'status': 'present', 'attendance_source': 'admin'}
                )
                
                # Capture audit trail
                reg_req.original_check_in = attendance.check_in
                reg_req.original_check_out = attendance.check_out
                reg_req.original_status = attendance.status
                
                # Apply new correction data
                if reg_req.requested_check_in:
                    attendance.check_in = reg_req.requested_check_in
                if reg_req.requested_check_out:
                    attendance.check_out = reg_req.requested_check_out
                
                attendance.status = 'corrected'
                attendance.is_corrected = True
                attendance.corrected_by = request.user
                attendance.save()
                
                reg_req.approved_by = request.user
                reg_req.approved_at = timezone.now()
                reg_req.save()
            except Exception as e:
                return Response({'error': f'Attendance sync failed: {str(e)}'}, status=500)
        else:
            reg_req.save()
            
        return Response({'message': f'Request {status_to_set} successfully.'})

class HolidayViewSet(viewsets.ModelViewSet):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    permission_classes = [IsAuthenticated]

class TeacherAttendanceViewSet(viewsets.ModelViewSet):
    queryset = TeacherAttendance.objects.all().select_related('teacher', 'teacher__user', 'marked_by', 'corrected_by')
    serializer_class = TeacherAttendanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = {
        'teacher': ['exact'],
        'date': ['exact', 'gte', 'lte'],
        'status': ['exact'],
    }
    search_fields = ['teacher__user__first_name', 'teacher__user__last_name', 'teacher__employee_id']
    ordering_fields = ['date']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Regular teachers only see their own attendance
        if hasattr(user, 'teacher_profile') and not user.is_staff:
            return qs.filter(teacher=user.teacher_profile)
        return qs

    @action(detail=False, methods=['POST'])
    def mark_self(self, request):
        user = request.user
        if not hasattr(user, 'teacher_profile'):
            return Response({'error': 'Only teachers can self-mark.'}, status=403)
        
        teacher = user.teacher_profile
        date = timezone.now().date()
        time = timezone.now().time()
        
        lat = request.data.get('lat')
        lng = request.data.get('lng')
        selfie = request.FILES.get('selfie')
        action_type = request.data.get('type') # 'check_in' or 'check_out'
        
        if not lat or not lng or not selfie:
            return Response({'error': 'Location and selfie are mandatory.'}, status=400)
            
        # Verify geofence
        school = SchoolSettings.objects.first()
        if not school:
            # Fallback placeholder if no settings exist yet
            school_lat, school_lng, radius = 28.6139, 77.2090, 50
        else:
            school_lat, school_lng, radius = school.latitude, school.longitude, school.radius_meters
            
        dist = haversine(lat, lng, school_lat, school_lng)
        is_verified = dist <= radius
        
        if not is_verified:
            return Response({
                'error': 'Outside school radius.', 
                'distance': round(dist, 2),
                'allowed': radius
            }, status=400)
            
        attendance, created = TeacherAttendance.objects.get_or_create(
            teacher=teacher,
            date=date,
            defaults={'status': 'checked_in', 'attendance_source': 'self'}
        )
        
        attendance.distance_meters = int(dist)
        
        if action_type == 'check_in':
            if attendance.check_in:
                return Response({'error': 'Already checked in for today.'}, status=400)
            attendance.check_in = time
            attendance.check_in_selfie = selfie
            attendance.check_in_lat = lat
            attendance.check_in_lng = lng
            attendance.check_in_verified = True
            attendance.status = 'checked_in'
        else:
            if not attendance.check_in:
                return Response({'error': 'Please check-in first.'}, status=400)
            if attendance.check_out:
                return Response({'error': 'Already checked out for today.'}, status=400)
            attendance.check_out = time
            attendance.check_out_selfie = selfie
            attendance.check_out_lat = lat
            attendance.check_out_lng = lng
            attendance.check_out_verified = True
            attendance.status = 'checked_out'
            
        attendance.save()
        return Response(TeacherAttendanceSerializer(attendance).data)

    @action(detail=False, methods=['POST'])
    def bulk_mark(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Only admins can mark teacher attendance.'}, status=403)
        
        data = request.data
        date = data.get('date')
        records = data.get('records', [])
        
        if not date:
            return Response({'error': 'Date is required.'}, status=400)
            
        results = []
        for rec in records:
            teacher_id = rec.get('teacher_id')
            status = rec.get('status', 'present')
            check_in = rec.get('check_in')
            check_out = rec.get('check_out')
            notes = rec.get('notes', '')
            leave_reason = rec.get('leave_reason', '')
            
            # Using update_or_create to handle re-marking
            obj, created = TeacherAttendance.objects.update_or_create(
                teacher_id=teacher_id,
                date=date,
                defaults={
                    'status': status,
                    'check_in': check_in if check_in else None,
                    'check_out': check_out if check_out else None,
                    'notes': notes,
                    'leave_reason': leave_reason,
                    'marked_by': request.user,
                    'attendance_source': 'admin'
                }
            )
            results.append(TeacherAttendanceSerializer(obj).data)
            
        return Response({'message': f'Marked {len(results)} records.', 'data': results})

    @action(detail=False, methods=['GET'])
    def stats_summary(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            from datetime import date as d
            date_str = d.today().isoformat()
        
        qs = self.get_queryset().filter(date=date_str)
        
        total_teachers = Teacher.objects.filter(status='active').count()
        present = qs.filter(status='present').count()
        absent = qs.filter(status='absent').count()
        late = qs.filter(status='late').count()
        leave = qs.filter(status='leave').count()
        half_day = qs.filter(status='half_day').count()
        
        return Response({
            'total': total_teachers,
            'present': present,
            'absent': absent,
            'late': late,
            'leave': leave,
            'half_day': half_day,
            'not_marked': total_teachers - qs.count()
        })

class StudentPaymentViewSet(viewsets.ModelViewSet):
    queryset = StudentPayment.objects.all()
    serializer_class = StudentPaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['student', 'status', 'month']

class TeacherSalaryViewSet(viewsets.ModelViewSet):
    queryset = TeacherSalary.objects.all()
    serializer_class = TeacherSalarySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['GET'])
    def get_attendance_stats(self, request):
        teacher_id = request.query_params.get('teacher')
        month_str = request.query_params.get('month') # e.g. "March 2024"
        
        if not teacher_id or not month_str:
            return Response({'error': 'Teacher and Month are required'}, status=400)
            
        from datetime import datetime
        import calendar
        
        # Parse month_str "March 2024"
        try:
            date_obj = datetime.strptime(month_str, "%B %Y")
            month = date_obj.month
            year = date_obj.year
        except:
            return Response({'error': 'Invalid month format. Use "Month Year" e.g. "March 2024"'}, status=400)
            
        num_days = calendar.monthrange(year, month)[1]
        
        # Fetch attendance for this teacher in this month
        qs = TeacherAttendance.objects.filter(
            teacher_id=teacher_id,
            date__year=year,
            date__month=month
        )
        
        present = qs.filter(status='present').count()
        absent = qs.filter(status='absent').count()
        late = qs.filter(status='late').count()
        
        return Response({
            'total_days_in_month': num_days,
            'present': present,
            'absent': absent,
            'late': late,
            'working_days': present + late + absent # Or logic based on your institution
        })

    @action(detail=False, methods=['POST'])
    def generate_monthly(self, request):
        month = request.data.get('month')
        if not month:
            return Response({'error': 'Month is required'}, status=400)

        teachers = Teacher.objects.filter(status='active')
        created_count = 0
        for t in teachers:
            # Check if salary already exists for this month
            if TeacherSalary.objects.filter(teacher=t, month=month).exists():
                continue
            
            TeacherSalary.objects.create(
                teacher=t,
                month=month,
                basic_salary=t.monthly_salary,
                gross_salary=t.monthly_salary,
                net_salary=t.monthly_salary,
                status='unpaid'
            )
            created_count += 1
            
        return Response({'message': f'Generated {created_count} salary records for {month}.'})

class PasswordResetRequestViewSet(viewsets.ModelViewSet):
    queryset = PasswordResetRequest.objects.all().select_related('teacher', 'teacher__user')
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            return qs.filter(teacher__user=self.request.user)
        return qs

    @action(detail=True, methods=['POST'])
    def process(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Only admins can process requests'}, status=403)
        
        reset_req = self.get_object()
        action = request.data.get('action') # 'approve' or 'reject'
        admin_note = request.data.get('admin_note', '')
        temp_password = request.data.get('temp_password')

        if action == 'approve':
            if not temp_password:
                return Response({'error': 'Temporary password is required for approval'}, status=400)
            
            reset_req.status = 'approved'
            reset_req.admin_note = admin_note
            reset_req.resolved_at = timezone.now()
            reset_req.save()

            # Set the temporary password
            teacher = reset_req.teacher
            teacher.user.set_password(temp_password)
            teacher.user.save()
            teacher.needs_password_change = True
            teacher.save()

            return Response({'message': 'Request approved and temporary password set.'})
        
        elif action == 'reject':
            reset_req.status = 'rejected'
            reset_req.admin_note = admin_note
            reset_req.resolved_at = timezone.now()
            reset_req.save()
            return Response({'message': 'Request rejected.'})
            
        return Response({'error': 'Invalid action'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_request(request):
    identifier = request.data.get('identifier') # email, employee_id, or username
    if not identifier:
        return Response({'error': 'Identifier is required'}, status=400)
    
    teacher = None
    try:
        # Search by email
        teacher = Teacher.objects.get(user__email__iexact=identifier)
    except Teacher.DoesNotExist:
        try:
            # Search by employee_id
            teacher = Teacher.objects.get(employee_id__iexact=identifier)
        except Teacher.DoesNotExist:
            try:
                # Search by username
                teacher = Teacher.objects.get(user__username__iexact=identifier)
            except Teacher.DoesNotExist:
                pass
    
    if not teacher:
        return Response({'error': 'Teacher account not found'}, status=404)
    
    # Check if a pending request already exists
    if PasswordResetRequest.objects.filter(teacher=teacher, status='pending').exists():
        return Response({'message': 'A reset request is already pending for this account.'})
    
    PasswordResetRequest.objects.create(teacher=teacher)
    return Response({'message': 'Password reset request submitted successfully. Please contact admin for approval.'})

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

class FeeInstallmentViewSet(viewsets.ModelViewSet):
    queryset = FeeInstallment.objects.all()
    serializer_class = FeeInstallmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = {
        'student': ['exact'],
        'status': ['exact'],
        'due_date': ['exact', 'gte', 'lte'],
        'student__grade': ['exact'],
    }
    search_fields = ['student__user__first_name', 'student__user__last_name', 'student__student_id']

class FeeTierViewSet(viewsets.ModelViewSet):
    queryset = FeeTier.objects.all()
    serializer_class = FeeTierSerializer
    permission_classes = [IsAuthenticated]

class StudentDiscountViewSet(viewsets.ModelViewSet):
    queryset = StudentDiscount.objects.all()
    serializer_class = StudentDiscountSerializer
    permission_classes = [IsAuthenticated]

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['POST'])
    def generate_monthly(self, request):
        month = request.data.get('month')
        due_date = request.data.get('due_date')
        if not month or not due_date:
            return Response({'error': 'Month and Due Date required'}, status=400)

        students = Student.objects.all()
        created_count = 0
        for s in students:
            # Check if invoice already exists for this month
            if Invoice.objects.filter(student=s, month=month).exists():
                continue
            
            # Get base fee from FeeTier (matching by grade)
            tier = FeeTier.objects.filter(grade=s.grade).first()
            if not tier: continue
            
            base = tier.amount
            discount_pct = 0
            if hasattr(s, 'discount'):
                discount_pct = s.discount.percentage
            
            discount_amt = (base * discount_pct) / 100
            net = base - discount_amt
            
            Invoice.objects.create(
                student=s, month=month, base_amount=base,
                discount_amount=discount_amt, net_amount=net,
                status='unpaid', due_date=due_date
            )
            created_count += 1
            
        return Response({'message': f'Generated {created_count} invoices for {month}.'})

    @action(detail=False, methods=['GET'])
    def defaulters(self, request):
        # Defaulters are those with unpaid/overdue invoices
        queryset = self.queryset.filter(status__in=['unpaid', 'overdue'])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class AdminMeetingViewSet(viewsets.ModelViewSet):
    queryset = AdminMeeting.objects.all()
    serializer_class = AdminMeetingSerializer
    permission_classes = [IsAuthenticated]

class CreditAdvanceViewSet(viewsets.ModelViewSet):
    queryset = CreditAdvance.objects.all()
    serializer_class = CreditAdvanceSerializer
    permission_classes = [IsAuthenticated]

class FinancialTransactionViewSet(viewsets.ModelViewSet):
    queryset = FinancialTransaction.objects.all()
    serializer_class = FinancialTransactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class FinanceDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum
        from datetime import datetime, timedelta
        
        # Income: Fees Paid + Credit Repayments + Other Income
        fees_income = StudentPayment.objects.filter(status='paid').aggregate(Sum('amount'))['amount__sum'] or 0
        repayments_income = CreditAdvance.objects.aggregate(Sum('amount_paid_back'))['amount_paid_back__sum'] or 0
        other_income = Income.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        total_income = fees_income + repayments_income + other_income

        # Expenses: Normal Expenses + Salaries Paid + Credits Given (Full Amount)
        normal_expenses = Expense.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        salaries_paid = TeacherSalary.objects.filter(status='paid').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        credits_given = CreditAdvance.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = normal_expenses + salaries_paid + credits_given

        net_profit = total_income - total_expenses
        
        # Pending Calculations
        invoice_pending = Invoice.objects.filter(status__in=['unpaid', 'overdue']).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        installment_pending = FeeInstallment.objects.filter(status__in=['pending', 'overdue']).aggregate(Sum('amount'))['amount__sum'] or 0
        pending_fees = max(invoice_pending, installment_pending) # Use the higher one as a safety measure for now
        
        outstanding_salary = TeacherSalary.objects.filter(status__in=['unpaid', 'pending']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        active_credits = CreditAdvance.objects.filter(status='pending').aggregate(Sum('remaining_balance'))['remaining_balance__sum'] or 0
        
        # Monthly Chart Data (Last 6 Months)
        chart_data = []
        for i in range(5, -1, -1):
            date = datetime.now() - timedelta(days=i*30)
            month_name = date.strftime('%b')
            year = date.year
            month = date.month
            
            m_income_fees = StudentPayment.objects.filter(date__year=year, date__month=month, status='paid').aggregate(Sum('amount'))['amount__sum'] or 0
            m_income_other = Income.objects.filter(date__year=year, date__month=month).aggregate(Sum('amount'))['amount__sum'] or 0
            m_repayment = 0 # Future: tracking daily repayments
            
            m_normal_exp = Expense.objects.filter(date__year=year, date__month=month).aggregate(Sum('amount'))['amount__sum'] or 0
            m_salary = TeacherSalary.objects.filter(payment_date__year=year, payment_date__month=month, status='paid').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            m_credit = CreditAdvance.objects.filter(date__year=year, date__month=month).aggregate(Sum('amount'))['amount__sum'] or 0
            
            chart_data.append({
                'month': month_name,
                'income': float(m_income_fees + m_income_other + m_repayment),
                'expense': float(m_normal_exp + m_salary + m_credit)
            })
            
        # Category-wise Data
        expense_categories = Expense.objects.values('category').annotate(total=Sum('amount'))
        income_categories = Income.objects.values('category').annotate(total=Sum('amount'))
        
        return Response({
            'summary': {
                'total_income': float(total_income),
                'total_expenses': float(total_expenses),
                'net_profit': float(net_profit),
                'pending_fees': float(pending_fees),
                'outstanding_salary': float(outstanding_salary),
                'active_credits': float(active_credits),
                'total_fees_collected': float(fees_income),
                'total_other_income': float(other_income),
                'total_salaries_paid': float(salaries_paid)
            },
            'chart_data': chart_data,
            'expense_categories': list(expense_categories),
            'income_categories': list(income_categories)
        })


class OnlineClassViewSet(viewsets.ModelViewSet):
    queryset = OnlineClass.objects.all()
    serializer_class = OnlineClassSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['teacher', 'date']
    ordering_fields = ['date', 'start_time']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Students can only view; teacher sees all their own classes
        # Admin sees all
        if hasattr(user, 'teacher_profile') and not user.is_staff:
            return qs.filter(teacher=user.teacher_profile)
        return qs

    def perform_create(self, serializer):
        # Auto-assign teacher from logged-in user
        if hasattr(self.request.user, 'teacher_profile'):
            serializer.save(teacher=self.request.user.teacher_profile)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        # Only the owning teacher or admin can delete
        instance = self.get_object()
        user = request.user
        if hasattr(user, 'teacher_profile') and instance.teacher != user.teacher_profile:
            return Response({'error': 'You can only delete your own classes.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class TeacherMeetingViewSet(viewsets.ModelViewSet):
    """
    Teacher-created meetings visible to students.
    Completely separate from AdminMeeting (admin → teachers).
    """
    queryset = TeacherMeeting.objects.all()
    serializer_class = TeacherMeetingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Teachers see only their own meetings
        if hasattr(user, 'teacher_profile') and not user.is_staff:
            return qs.filter(teacher=user.teacher_profile)
        # Students see meetings targeting them (or all-student meetings)
        if hasattr(user, 'student_profile'):
            return qs.filter(
                Q(students=user.student_profile) | Q(students__isnull=True)
            ).distinct()
        return qs

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'teacher_profile'):
            serializer.save(teacher=self.request.user.teacher_profile)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if hasattr(user, 'teacher_profile') and instance.teacher != user.teacher_profile:
            return Response({'error': 'You can only delete your own meetings.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class PreviousYearPaperViewSet(viewsets.ModelViewSet):
    queryset = PreviousYearPaper.objects.all()
    serializer_class = PreviousYearPaperSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['course', 'subject', 'year', 'mode']
    search_fields = ['title', 'exam_name', 'tags']

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'teacher_profile'):
            serializer.save(uploaded_by=self.request.user.teacher_profile)
        else:
            serializer.save()

class PaperAttemptViewSet(viewsets.ModelViewSet):
    queryset = PaperAttempt.objects.all()
    serializer_class = PaperAttemptSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['student', 'paper', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if hasattr(user, 'student_profile'):
            return qs.filter(student=user.student_profile)
        return qs

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'student_profile'):
            serializer.save(student=self.request.user.student_profile)
        else:
            serializer.save()

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['post_type', 'audience', 'status', 'priority']
    search_fields = ['title', 'content']
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        # Super Admin sees everything
        if user.is_staff or user.is_superuser:
            return qs
            
        # Teacher see published posts meant for them or both
        if hasattr(user, 'teacher_profile'):
            return qs.filter(
                status='published',
                audience__in=['teachers', 'both']
            ).filter(
                Q(expiry_date__gt=timezone.now()) | Q(expiry_date__isnull=True)
            )
            
        # Student see published posts meant for them or both
        if hasattr(user, 'student_profile'):
            return qs.filter(
                status='published',
                audience__in=['students', 'both']
            ).filter(
                Q(expiry_date__gt=timezone.now()) | Q(expiry_date__isnull=True)
            )
            
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TeacherPermissionViewSet(viewsets.ModelViewSet):
    queryset = TeacherPermission.objects.all()
    serializer_class = TeacherPermissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TeacherPermission.objects.all()

    @action(detail=False, methods=['GET'])
    def current(self, request):
        perm_obj = TeacherPermission.objects.first()
        if not perm_obj:
            perm_obj = TeacherPermission.objects.create(permissions=TeacherPermission.get_default_permissions())
        serializer = self.get_serializer(perm_obj)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def update_permissions(self, request):
        if not request.user.is_superuser:
            return Response({"error": "Only Super Admins can update permissions"}, status=403)
        
        perm_obj = TeacherPermission.objects.first()
        if not perm_obj:
            perm_obj = TeacherPermission.objects.create(permissions=TeacherPermission.get_default_permissions())
        
        perm_obj.permissions = request.data.get('permissions', perm_obj.permissions)
        perm_obj.save()
        return Response({"message": "Permissions updated successfully", "permissions": perm_obj.permissions})

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(recipient=self.request.user)

    @action(detail=False, methods=['POST'])
    def mark_as_read(self, request):
        notification_ids = request.data.get('ids', [])
        if notification_ids:
            Notification.objects.filter(recipient=request.user, id__in=notification_ids).update(is_read=True)
            return Response({'status': 'success'})
        return Response({'status': 'error', 'message': 'No IDs provided'}, status=400)

    @action(detail=False, methods=['POST'])
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'success'})

    @action(detail=False, methods=['POST'])
    def clear_selected(self, request):
        notification_ids = request.data.get('ids', [])
        if notification_ids:
            Notification.objects.filter(recipient=request.user, id__in=notification_ids).delete()
            return Response({'status': 'success'})
        return Response({'status': 'error', 'message': 'No IDs provided'}, status=400)

    @action(detail=False, methods=['POST'])
    def clear_all(self, request):
        Notification.objects.filter(recipient=request.user).delete()
        return Response({'status': 'success'})

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if not self.request.user.is_staff:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only admins can modify leave types.")
        return super().get_permissions()

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().select_related('teacher__user', 'leave_type')
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if hasattr(user, 'teacher_profile') and not user.is_staff:
            return qs.filter(teacher=user.teacher_profile)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        
        # Validation: Check allocation limits
        leave_type = serializer.validated_data.get('leave_type')
        days = serializer.validated_data.get('days')
        if not days:
            from_date = serializer.validated_data.get('from_date')
            to_date = serializer.validated_data.get('to_date')
            days = float((to_date - from_date).days + 1) if from_date and to_date else 1.0

        if hasattr(user, 'teacher_profile') and not user.is_staff:
            teacher_profile = user.teacher_profile
        else:
            teacher_profile = serializer.validated_data.get('teacher')
            if not teacher_profile:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"error": "Teacher is required when assigning leave manually."})

        # Calculate used and pending leaves for this type
        from django.db.models import Sum
        existing_leaves = LeaveRequest.objects.filter(
            teacher=teacher_profile,
            leave_type=leave_type,
            status__in=['approved', 'pending']
        ).aggregate(total=Sum('days'))['total'] or 0

        allocation = TeacherLeaveAllocation.objects.filter(
            teacher=teacher_profile,
            leave_type=leave_type
        ).first()
        
        allocated_days = allocation.allocated_days if allocation else 0

        if existing_leaves + days > allocated_days:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": "Insufficient balance for the selected leave type."})

        if hasattr(user, 'teacher_profile') and not user.is_staff:
            leave = serializer.save(teacher=user.teacher_profile, status='pending')
            # Notify admins
            admin_users = User.objects.filter(is_staff=True)
            for admin in admin_users:
                Notification.objects.create(
                    recipient=admin,
                    title="New Leave Request",
                    message=f"Teacher {user.get_full_name()} has requested leave from {leave.from_date} to {leave.to_date}.",
                    notification_type="system"
                )
        else:
            leave = serializer.save(status='approved')
            self._sync_attendance(leave)

    def _sync_attendance(self, leave):
        from datetime import timedelta
        current_date = leave.from_date
        while current_date <= leave.to_date:
            # Skip weekends (5=Saturday, 6=Sunday)
            if current_date.weekday() < 5:
                # Check if it's not a holiday
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

    @action(detail=True, methods=['POST'])
    def approve(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        leave = self.get_object()
        if leave.status != 'pending':
            return Response({'error': 'Can only approve pending requests.'}, status=status.HTTP_400_BAD_REQUEST)
        leave.status = 'approved'
        leave.save()
        
        # Sync with attendance
        self._sync_attendance(leave)
        
        Notification.objects.create(
            recipient=leave.teacher.user,
            title="Leave Approved",
            message=f"Your leave request from {leave.from_date} to {leave.to_date} has been approved.",
            notification_type="system"
        )
        return Response({'status': 'Leave approved'})

    @action(detail=True, methods=['POST'])
    def reject(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        leave = self.get_object()
        if leave.status != 'pending':
            return Response({'error': 'Can only reject pending requests.'}, status=status.HTTP_400_BAD_REQUEST)
        
        remarks = request.data.get('remarks', '').strip()
        if not remarks:
            return Response({'error': 'Remarks are mandatory for rejection.'}, status=status.HTTP_400_BAD_REQUEST)
        
        leave.status = 'rejected'
        leave.admin_remarks = remarks
        leave.save()
        
        Notification.objects.create(
            recipient=leave.teacher.user,
            title="Leave Rejected",
            message=f"Your leave request from {leave.from_date} to {leave.to_date} was rejected. Remarks: {remarks}",
            notification_type="system"
        )
        return Response({'status': 'Leave rejected'})
        
    @action(detail=True, methods=['POST'])
    def cancel(self, request, pk=None):
        leave = self.get_object()
        user = request.user
        if hasattr(user, 'teacher_profile'):
            if leave.teacher != user.teacher_profile:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        if leave.status != 'pending':
            return Response({'error': 'Can only cancel pending requests.'}, status=status.HTTP_400_BAD_REQUEST)
        leave.delete()
        return Response({'status': 'Leave request cancelled'})

    @action(detail=False, methods=['GET'])
    def analytics(self, request):
        user = request.user
        from django.db.models import Sum
        
        # Determine teachers to fetch stats for
        if user.is_staff:
            teachers = Teacher.objects.all().select_related('user')
        elif hasattr(user, 'teacher_profile'):
            teachers = Teacher.objects.filter(id=user.teacher_profile.id).select_related('user')
        else:
            return Response({'error': 'Unauthorized'}, status=403)
            
        leave_types = LeaveType.objects.filter(is_active=True)
        stats = []
        
        for t in teachers:
            breakdown = []
            teacher_total_allocated = 0
            teacher_total_used = 0
            teacher_total_pending = 0
            
            for lt in leave_types:
                # Get allocation
                allocation = TeacherLeaveAllocation.objects.filter(teacher=t, leave_type=lt).first()
                allocated = allocation.allocated_days if allocation else 0
                
                # Used leaves
                used_qs = LeaveRequest.objects.filter(teacher=t, leave_type=lt, status='approved')
                used = used_qs.aggregate(total=Sum('days'))['total'] or 0
                
                # Pending leaves
                pending_qs = LeaveRequest.objects.filter(teacher=t, leave_type=lt, status='pending')
                pending = pending_qs.aggregate(total=Sum('days'))['total'] or 0
                
                balance = max(0, allocated - (used + pending))
                
                breakdown.append({
                    'leave_type_id': lt.id,
                    'leave_type_name': lt.name,
                    'is_paid': lt.is_paid,
                    'allocated': allocated,
                    'used': used,
                    'pending': pending,
                    'balance': balance
                })
                
                teacher_total_allocated += allocated
                teacher_total_used += used
                teacher_total_pending += pending
            
            # Overall approved/rejected counts
            approved_count = LeaveRequest.objects.filter(teacher=t, status='approved').count()
            rejected_count = LeaveRequest.objects.filter(teacher=t, status='rejected').count()
                
            stats.append({
                'teacher_id': t.id,
                'teacher_name': t.user.get_full_name(),
                'total_allocated': teacher_total_allocated,
                'used_leaves': teacher_total_used,
                'pending_leaves': teacher_total_pending,
                'balance': max(0, teacher_total_allocated - (teacher_total_used + teacher_total_pending)),
                'approved_count': approved_count,
                'rejected_count': rejected_count,
                'breakdown': breakdown
            })
            
        return Response(stats)

    @action(detail=False, methods=['POST'])
    def check_conflicts(self, request):
        teacher_id = request.data.get('teacher_id')
        from_date = request.data.get('from_date')
        to_date = request.data.get('to_date')
        
        if not teacher_id or not from_date or not to_date:
            return Response({'error': 'Missing parameters'}, status=400)
            
        # Check OnlineClass
        online_conflicts = OnlineClass.objects.filter(
            teacher_id=teacher_id,
            date__range=[from_date, to_date]
        ).exists()
        
        # Check TeacherMeeting
        meeting_conflicts = TeacherMeeting.objects.filter(
            teacher_id=teacher_id,
            date_time__date__range=[from_date, to_date]
        ).exists()
        
        has_conflict = online_conflicts or meeting_conflicts
        
        return Response({
            'has_conflict': has_conflict,
            'message': 'You have scheduled classes or meetings during this period.' if has_conflict else 'No conflicts'
        })

class TeacherLeaveAllocationViewSet(viewsets.ModelViewSet):
    queryset = TeacherLeaveAllocation.objects.all().select_related('teacher__user', 'leave_type')
    serializer_class = TeacherLeaveAllocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if hasattr(user, 'teacher_profile') and not user.is_staff:
            return qs.filter(teacher=user.teacher_profile)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if not self.request.user.is_staff:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only admins can manage leave allocations.")
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        teacher_id = request.data.get('teacher')
        leave_type_id = request.data.get('leave_type')
        allocated_days = request.data.get('allocated_days', 0)
        notes = request.data.get('notes', '')

        if not teacher_id or not leave_type_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'Teacher and Leave Type are required.'})

        allocation, created = TeacherLeaveAllocation.objects.update_or_create(
            teacher_id=teacher_id,
            leave_type_id=leave_type_id,
            defaults={
                'allocated_days': allocated_days,
                'notes': notes
            }
        )
        serializer = self.get_serializer(allocation)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
