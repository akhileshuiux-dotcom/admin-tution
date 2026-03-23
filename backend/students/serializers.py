from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Student, Teacher, Subject, Course, Lesson, Resource, 
    Exam, Question, ExamResult, Attendance, AdminMeeting,
    StudentPayment, TeacherSalary, Expense, Income, TeacherAttendance,
    FeeTier, StudentDiscount, Invoice
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
        fields = ['id', 'user', 'employee_id', 'bio', 'specialization', 'status']

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

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    subjects = SubjectSerializer(many=True, read_only=True)
    subject_ids = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subjects', many=True, write_only=True, required=False
    )

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'student_id', 'grade', 'enrolled_date', 'bio', 'points', 'parent_name', 'parent_contact', 'medical_info',
            'subjects', 'subject_ids', 'plan_type', 'syllabus', 'sessions_per_week', 'location', 
            'learning_goals', 'special_requirements', 'status', 'plan_status'
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
    class Meta:
        model = Resource
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ExamResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamResult
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class AdminMeetingSerializer(serializers.ModelSerializer):
    date = serializers.DateField(write_only=True)
    time = serializers.TimeField(write_only=True)

    class Meta:
        model = AdminMeeting
        fields = ['id', 'title', 'description', 'date_time', 'date', 'time', 'location', 'mandatory_for_all', 'attendees']
        read_only_fields = ['date_time']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.date_time:
            ret['date'] = instance.date_time.date().isoformat()
            ret['time'] = instance.date_time.time().strftime('%H:%M')
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

class StudentPaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    class Meta:
        model = StudentPayment
        fields = '__all__'

class TeacherSalarySerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    class Meta:
        model = TeacherSalary
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'

class TeacherAttendanceSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
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
