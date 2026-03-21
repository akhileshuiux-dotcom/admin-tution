from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Student, Teacher, Subject, Course, Lesson, Resource, 
    Exam, Question, ExamResult, Attendance, AdminMeeting,
    StudentPayment, TeacherSalary, Expense, Income, TeacherAttendance,
    FeeTier, StudentDiscount, Invoice
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Teacher
        fields = ['id', 'user', 'employee_id', 'bio', 'specialization']

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

    class Meta:
        model = Student
        fields = ['id', 'user', 'student_id', 'grade', 'enrolled_date', 'bio', 'points', 'parent_contact', 'medical_info']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['username'] = user_data.get('email', user_data.get('username'))
        user = User.objects.create_user(**user_data)
        student = Student.objects.create(user=user, **validated_data)
        return student

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

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    class Meta:
        model = Course
        fields = '__all__'

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
    class Meta:
        model = AdminMeeting
        fields = '__all__'

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
