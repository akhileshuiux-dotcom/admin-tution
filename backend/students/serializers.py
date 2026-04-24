from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Student, Teacher, Subject, Course, Lesson, Resource, 
    Exam, Question, ExamResult, Attendance, AdminMeeting,
    StudentPayment, TeacherSalary, Expense, Income, TeacherAttendance,
    FeeTier, StudentDiscount, Invoice, StudentAnswer, SubjectMark,
    CreditAdvance, FinancialTransaction, FeeInstallment, NoteAssignment, OnlineClass, TeacherMeeting,
    PreviousYearPaper, PaperQuestion, PaperAttempt, PaperAnswer, PaperPurchase, Post, TeacherPermission,
    Holiday, SchoolSettings, RegularizationRequest, Notification, PasswordResetRequest,
    LeaveType, LeaveRequest, TeacherLeaveAllocation
)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']
        extra_kwargs = {
            'username': {'required': False, 'validators': []}
        }

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'employee_id', 'phone_number', 'gender', 'dob',
            'specialization', 'qualification', 'experience_years', 'joining_date',
            'assigned_classes', 'bio', 'current_address', 'permanent_address',
            'monthly_salary', 'profile_photo', 'status', 'needs_password_change'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        # Use email as username for consistency
        user_data['username'] = user_data.get('email', user_data.get('username'))
        user = User.objects.create_user(**user_data)
        teacher = Teacher.objects.create(user=user, **validated_data)
        return teacher

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                if attr == 'password':
                    user.set_password(value)
                else:
                    setattr(user, attr, value)
            user.save()
        return super().update(instance, validated_data)

class StudentPaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    class Meta:
        model = StudentPayment
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    subjects = SubjectSerializer(many=True, read_only=True)
    subject_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subjects', many=True, write_only=True, required=False
    )

    payments = StudentPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'student_id', 'grade', 'enrolled_date', 'bio', 'points', 'parent_name', 'parent_contact', 'medical_info',
            'subjects', 'subject_ids', 'plan_type', 'syllabus', 'sessions_per_week', 'location', 
            'learning_goals', 'special_requirements', 'status', 'plan_status', 'payments', 'monthly_fee',
            'assigned_teacher', 'lead_source', 'reference_by', 'batch', 'permanent_address'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        subjects_data = validated_data.pop('subjects', [])
        user_data['username'] = user_data.get('email', user_data.get('username'))
        user = User.objects.create_user(**user_data)
        student = Student.objects.create(user=user, **validated_data)
        if subjects_data:
            student.subjects.set(subjects_data)
        return student

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        subjects_data = validated_data.pop('subjects', None)
        
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                if attr == 'password':
                    if value: # Only set if provided
                        user.set_password(value)
                else:
                    setattr(user, attr, value)
            user.save()
            
        if subjects_data is not None:
            instance.subjects.set(subjects_data)
            
        return super().update(instance, validated_data)

class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source='teacher', write_only=True
    )
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=True
    )
    class Meta:
        model = Course
        fields = ['id', 'name', 'grade_level', 'description', 'teacher', 'subject', 'teacher_id', 'subject_id']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class ResourceSerializer(serializers.ModelSerializer):
    course_name = serializers.ReadOnlyField(source='course.name')
    class Meta:
        model = Resource
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        extra_kwargs = {'exam': {'required': False}}

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    course_name = serializers.ReadOnlyField(source='course.name')
    
    class Meta:
        model = Exam
        fields = [
            'id', 'course', 'course_name', 'title', 'duration_minutes', 'is_active', 
            'enable_focus_mode', 'scheduled_date', 'exam_mode', 
            'location', 'preparation_instructions', 'questions'
        ]

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        exam = Exam.objects.create(**validated_data)
        for q_data in questions_data:
            Question.objects.create(exam=exam, **q_data)
        return exam

class StudentAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.ReadOnlyField(source='question.text')
    question_points = serializers.ReadOnlyField(source='question.points')
    correct_option = serializers.ReadOnlyField(source='question.correct_option')
    q_type = serializers.ReadOnlyField(source='question.q_type')
    option_a = serializers.ReadOnlyField(source='question.option_a')
    option_b = serializers.ReadOnlyField(source='question.option_b')
    option_c = serializers.ReadOnlyField(source='question.option_c')
    option_d = serializers.ReadOnlyField(source='question.option_d')

    class Meta:
        model = StudentAnswer
        fields = [
            'id', 'result', 'question', 'question_text', 'answer_text', 
            'is_correct', 'marks_obtained', 'question_points', 'correct_option',
            'q_type', 'option_a', 'option_b', 'option_c', 'option_d'
        ]

class SubjectMarkSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    class Meta:
        model = SubjectMark
        fields = ['id', 'subject', 'subject_name', 'marks_obtained', 'max_marks']

class ExamResultSerializer(serializers.ModelSerializer):
    answers = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    student_answers = StudentAnswerSerializer(many=True, read_only=True, source='answers')
    subject_performance = SubjectMarkSerializer(many=True, required=False)
    exam_title = serializers.ReadOnlyField(source='exam.title')
    
    class Meta:
        model = ExamResult
        fields = [
            'id', 'student', 'exam', 'exam_title', 'score', 'total_marks', 'percentage', 'grade', 'status',
            'tab_switch_count', 'submitted_at', 'teacher_feedback', 
            'is_published', 'answers', 'student_answers', 'subject_performance'
        ]

    def create(self, validated_data):
        performance_data = validated_data.pop('subject_performance', [])
        answers_data = validated_data.pop('answers', [])
        
        # Calculate totals from performance data if provided
        if performance_data:
            total_obtained = sum(item['marks_obtained'] for item in performance_data)
            total_max = sum(item['max_marks'] for item in performance_data)
            validated_data['score'] = int(total_obtained)
            validated_data['total_marks'] = float(total_max)
            if total_max > 0:
                pct = (total_obtained / total_max) * 100
                validated_data['percentage'] = pct
                # Simple Grade System
                if pct >= 90: validated_data['grade'] = 'A+'
                elif pct >= 80: validated_data['grade'] = 'A'
                elif pct >= 70: validated_data['grade'] = 'B'
                elif pct >= 60: validated_data['grade'] = 'C'
                elif pct >= 50: validated_data['grade'] = 'D'
                else: validated_data['grade'] = 'Fail'

        result = ExamResult.objects.create(**validated_data)
        
        for perf in performance_data:
            SubjectMark.objects.create(result=result, **perf)
            
        for ans in answers_data:
            StudentAnswer.objects.create(
                result=result,
                question_id=ans.get('question'),
                answer_text=ans.get('answer_text', '')
            )
        return result

    def update(self, instance, validated_data):
        performance_data = validated_data.pop('subject_performance', None)
        
        # Update nested performance if provided
        if performance_data is not None:
            instance.subject_performance.all().delete()
            for perf in performance_data:
                SubjectMark.objects.create(result=instance, **perf)
            
            total_obtained = sum(item['marks_obtained'] for item in performance_data)
            total_max = sum(item['max_marks'] for item in performance_data)
            instance.score = int(total_obtained)
            instance.total_marks = float(total_max)
            if total_max > 0:
                pct = (total_obtained / total_max) * 100
                instance.percentage = pct
                if pct >= 90: instance.grade = 'A+'
                elif pct >= 80: instance.grade = 'A'
                elif pct >= 70: instance.grade = 'B'
                elif pct >= 60: instance.grade = 'C'
                elif pct >= 50: instance.grade = 'D'
                else: instance.grade = 'Fail'

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    class Meta:
        model = Attendance
        fields = '__all__'

class AdminMeetingSerializer(serializers.ModelSerializer):
    date = serializers.DateField(write_only=True)
    time = serializers.TimeField(write_only=True)

    class Meta:
        model = AdminMeeting
        fields = ['id', 'title', 'description', 'date_time', 'date', 'time', 'end_time', 'location', 'meeting_type', 'meeting_link', 'mandatory_for_all', 'attendees']
        read_only_fields = ['date_time']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.date_time:
            ret['date'] = instance.date_time.date().isoformat()
            ret['time'] = instance.date_time.time().strftime('%H:%M')
        if instance.end_time:
            ret['end_time'] = instance.end_time.strftime('%H:%M')
        return ret

    def create(self, validated_data):
        date = validated_data.pop('date')
        time = validated_data.pop('time')
        from datetime import datetime
        validated_data['date_time'] = datetime.combine(date, time)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        date = validated_data.pop('date', None)
        time = validated_data.pop('time', None)
        if date and time:
            from datetime import datetime
            validated_data['date_time'] = datetime.combine(date, time)
        elif date:
            from datetime import datetime
            validated_data['date_time'] = datetime.combine(date, instance.date_time.time())
        elif time:
            from datetime import datetime
            validated_data['date_time'] = datetime.combine(instance.date_time.date(), time)
        return super().update(instance, validated_data)


class TeacherSalarySerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    teacher_emp_id = serializers.CharField(source='teacher.employee_id', read_only=True)
    net_salary = serializers.DecimalField(source='total_amount', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = TeacherSalary
        fields = [
            'id', 'teacher', 'teacher_name', 'teacher_emp_id', 'month', 
            'total_working_days', 'paid_days', 'leave_days',
            'basic_salary', 'extra_amount', 'deduction',
            'gross_salary', 'total_deductions', 'total_amount', 'net_salary',
            'earnings_json', 'deductions_json', 'status', 'payment_mode',
            'payment_date', 'transaction_id', 'notes'
        ]
        read_only_fields = ['total_amount', 'net_salary']

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'

class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        fields = '__all__'

class RegularizationRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    current_attendance_data = serializers.SerializerMethodField()
    
    class Meta:
        model = RegularizationRequest
        fields = '__all__'
        
    def get_current_attendance_data(self, obj):
        from .models import TeacherAttendance
        try:
            att = TeacherAttendance.objects.get(teacher=obj.teacher, date=obj.attendance_date)
            return {
                'check_in': att.check_in,
                'check_out': att.check_out,
                'status': att.status
            }
        except:
            return None

class TeacherAttendanceSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    teacher_id_code = serializers.CharField(source='teacher.employee_id', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True)
    corrected_by_name = serializers.CharField(source='corrected_by.get_full_name', read_only=True)
    
    class Meta:
        model = TeacherAttendance
        fields = '__all__'

class FeeTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeTier
        fields = '__all__'

class StudentDiscountSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    class Meta:
        model = StudentDiscount
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    class Meta:
        model = Invoice
        fields = '__all__'

class CreditAdvanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditAdvance
        fields = '__all__'

class FinancialTransactionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    class Meta:
        model = FinancialTransaction
        fields = '__all__'

class FeeInstallmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_grade = serializers.CharField(source='student.grade', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    
    class Meta:
        model = FeeInstallment
        fields = '__all__'


class NoteAssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_grade = serializers.CharField(source='student.grade', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    note_title = serializers.CharField(source='note.title', read_only=True)

    class Meta:
        model = NoteAssignment
        fields = [
            'id', 'note', 'student', 'student_name', 'student_grade',
            'student_id_code', 'note_title', 'status', 'submission_file',
            'submission_text', 'completed_at', 'created_at'
        ]
        read_only_fields = ['status', 'completed_at', 'created_at']


class OnlineClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)

    class Meta:
        model = OnlineClass
        fields = [
            'id', 'teacher', 'teacher_name', 'title', 'category',
            'date', 'start_time', 'end_time', 'link', 'description', 'created_at'
        ]
        read_only_fields = ['created_at', 'teacher']


class TeacherMeetingSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    student_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Student.objects.all(), source='students', required=False
    )

    class Meta:
        model = TeacherMeeting
        fields = [
            'id', 'teacher', 'teacher_name', 'title', 'description',
            'date_time', 'meeting_link', 'student_ids', 'created_at'
        ]
        read_only_fields = ['created_at', 'teacher', 'teacher_name']

class PaperQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperQuestion
        fields = '__all__'

class PreviousYearPaperSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    questions = PaperQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = PreviousYearPaper
        fields = '__all__'

class PaperAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperAnswer
        fields = '__all__'

class PaperAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    paper_title = serializers.CharField(source='paper.title', read_only=True)
    answers = PaperAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = PaperAttempt
        fields = '__all__'
        read_only_fields = ['started_at']

class PaperPurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperPurchase
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class TeacherPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherPermission
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    created_date = serializers.SerializerMethodField()
    created_time = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'title', 'message', 'notification_type', 
            'is_read', 'created_at', 'created_date', 'created_time'
        ]

    def get_created_date(self, obj):
        return obj.created_at.strftime('%d %b %Y')

    def get_created_time(self, obj):
        return obj.created_at.strftime('%I:%M %p')

class PasswordResetRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    teacher_emp_id = serializers.CharField(source='teacher.employee_id', read_only=True)
    teacher_email = serializers.CharField(source='teacher.user.email', read_only=True)
class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'

class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        fields = '__all__'

class RegularizationRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    current_attendance_data = serializers.SerializerMethodField()
    
    class Meta:
        model = RegularizationRequest
        fields = '__all__'
        
    def get_current_attendance_data(self, obj):
        from .models import TeacherAttendance
        try:
            att = TeacherAttendance.objects.get(teacher=obj.teacher, date=obj.attendance_date)
            return {
                'check_in': att.check_in,
                'check_out': att.check_out,
                'status': att.status
            }
        except:
            return None

class TeacherAttendanceSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    teacher_id_code = serializers.CharField(source='teacher.employee_id', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True)
    corrected_by_name = serializers.CharField(source='corrected_by.get_full_name', read_only=True)
    
    class Meta:
        model = TeacherAttendance
        fields = '__all__'

class FeeTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeTier
        fields = '__all__'

class StudentDiscountSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    class Meta:
        model = StudentDiscount
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    class Meta:
        model = Invoice
        fields = '__all__'

class CreditAdvanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditAdvance
        fields = '__all__'

class FinancialTransactionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    class Meta:
        model = FinancialTransaction
        fields = '__all__'

class FeeInstallmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_grade = serializers.CharField(source='student.grade', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    
    class Meta:
        model = FeeInstallment
        fields = '__all__'


class NoteAssignmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_grade = serializers.CharField(source='student.grade', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    note_title = serializers.CharField(source='note.title', read_only=True)

    class Meta:
        model = NoteAssignment
        fields = [
            'id', 'note', 'student', 'student_name', 'student_grade',
            'student_id_code', 'note_title', 'status', 'submission_file',
            'submission_text', 'completed_at', 'created_at'
        ]
        read_only_fields = ['status', 'completed_at', 'created_at']


class OnlineClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)

    class Meta:
        model = OnlineClass
        fields = [
            'id', 'teacher', 'teacher_name', 'title', 'category',
            'date', 'start_time', 'end_time', 'link', 'description', 'created_at'
        ]
        read_only_fields = ['created_at', 'teacher']


class TeacherMeetingSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    student_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Student.objects.all(), source='students', required=False
    )

    class Meta:
        model = TeacherMeeting
        fields = [
            'id', 'teacher', 'teacher_name', 'title', 'description',
            'date_time', 'meeting_link', 'student_ids', 'created_at'
        ]
        read_only_fields = ['created_at', 'teacher', 'teacher_name']

class PaperQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperQuestion
        fields = '__all__'

class PreviousYearPaperSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    questions = PaperQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = PreviousYearPaper
        fields = '__all__'

class PaperAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperAnswer
        fields = '__all__'

class PaperAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    paper_title = serializers.CharField(source='paper.title', read_only=True)
    answers = PaperAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = PaperAttempt
        fields = '__all__'
        read_only_fields = ['started_at']

class PaperPurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperPurchase
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class TeacherPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherPermission
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    created_date = serializers.SerializerMethodField()
    created_time = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'title', 'message', 'notification_type', 
            'is_read', 'created_at', 'created_date', 'created_time'
        ]

    def get_created_date(self, obj):
        return obj.created_at.strftime('%d %b %Y')

    def get_created_time(self, obj):
        return obj.created_at.strftime('%I:%M %p')

class PasswordResetRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    teacher_emp_id = serializers.CharField(source='teacher.employee_id', read_only=True)
    teacher_email = serializers.CharField(source='teacher.user.email', read_only=True)

    class Meta:
        model = PasswordResetRequest
        fields = '__all__'

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ['days', 'created_at', 'updated_at', 'teacher_name', 'leave_type_name']
        extra_kwargs = {
            'teacher': {'required': False}
        }

class TeacherLeaveAllocationSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)

    class Meta:
        model = TeacherLeaveAllocation
        fields = '__all__'
