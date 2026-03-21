from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .models import (
    Student, Teacher, Subject, Course, Lesson, Resource, 
    Exam, Question, ExamResult, Attendance, AdminMeeting,
    StudentPayment, TeacherSalary, Expense, Income, TeacherAttendance,
    FeeTier, StudentDiscount, Invoice
)
from .serializers import (
    StudentSerializer, TeacherSerializer, SubjectSerializer, 
    CourseSerializer, LessonSerializer, ResourceSerializer, 
    ExamSerializer, QuestionSerializer, ExamResultSerializer, 
    UserSerializer, AttendanceSerializer, AdminMeetingSerializer,
    StudentPaymentSerializer, TeacherSalarySerializer, ExpenseSerializer, 
    IncomeSerializer, TeacherAttendanceSerializer,
    FeeTierSerializer, StudentDiscountSerializer, InvoiceSerializer
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
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        # Return full profile data immediately
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

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

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

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

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

class TeacherSalaryViewSet(viewsets.ModelViewSet):
    queryset = TeacherSalary.objects.all()
    serializer_class = TeacherSalarySerializer
    permission_classes = [IsAuthenticated]

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

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
