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
    PreviousYearPaper, PaperQuestion, PaperAttempt, PaperAnswer, PaperPurchase
)
from .serializers import (
    StudentSerializer, TeacherSerializer, SubjectSerializer, 
    CourseSerializer, LessonSerializer, ResourceSerializer, 
    ExamSerializer, QuestionSerializer, ExamResultSerializer, 
    UserSerializer, AttendanceSerializer, AdminMeetingSerializer,
    StudentPaymentSerializer, TeacherSalarySerializer, ExpenseSerializer, 
    IncomeSerializer, TeacherAttendanceSerializer,
    FeeTierSerializer, StudentDiscountSerializer, InvoiceSerializer,
    CreditAdvanceSerializer, FinancialTransactionSerializer, UserSerializer,
    FeeInstallmentSerializer, NoteAssignmentSerializer, OnlineClassSerializer, TeacherMeetingSerializer,
    PreviousYearPaperSerializer, PaperQuestionSerializer, PaperAttemptSerializer, PaperAnswerSerializer, PaperPurchaseSerializer
)

from rest_framework.views import APIView

def get_profile_data(user):
    # 1. Check for Teacher
    if hasattr(user, 'teacher_profile'):
        teacher = user.teacher_profile
        serializer = TeacherSerializer(teacher)
        data = serializer.data
        data['role'] = 'teacher'
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

class TeacherAttendanceViewSet(viewsets.ModelViewSet):
    queryset = TeacherAttendance.objects.all()
    serializer_class = TeacherAttendanceSerializer
    permission_classes = [IsAuthenticated]

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

