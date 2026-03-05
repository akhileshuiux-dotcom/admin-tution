from rest_framework import serializers
from .models import Student, Tutor, Plan, SubPlan, Session, Payment, Income, Expense, TutorPayroll

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # CamelCase mapping for frontend
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'fullName': data.get('full_name'),
            'grade': data.get('grade'),
            'syllabus': data.get('syllabus'),
            'academicYear': data.get('academic_year'),
            'mediumOfCommunication': data.get('medium_of_communication'),
            'publication': data.get('publication'),
            'contactMethod': data.get('contact_method'),
            'location': data.get('location'),
            'school': data.get('school'),
            'parentRemarks': data.get('parent_remarks'),
            'phoneNumber': data.get('phone_number'),
            'email': data.get('email'),
            'timezone': data.get('timezone'),
            'country': data.get('country'),
            'whatsappGroup': data.get('whatsapp_group'),
            'contactVia': data.get('contact_via'),
            'parentName': data.get('parent_name'),
            'tutor': data.get('tutor'),
            'status': data.get('status'),
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }

class TutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutor
        fields = '__all__'

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'
    
    def to_representation(self, instance):
        # basic camelCase
        data = super().to_representation(instance)
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'studentRef': data.get('student'),
            'tutorRef': data.get('tutor'),
            'subject': data.get('subject'),
            'planType': data.get('plan_type'),
            'sessionsPerWeek': data.get('sessions_per_week'),
            'sessionDuration': data.get('session_duration'),
            'schedulePattern': data.get('schedule_pattern'),
            'status': data.get('status'),
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'planRef': data.get('plan'),
            'tutorRef': data.get('tutor'),
            'subject': data.get('subject'),
            'scheduledDate': data.get('scheduled_date'),
            'scheduledTime': data.get('scheduled_time'),
            'durationHours': data.get('duration_hours'),
            'googleMeetLink': data.get('google_meet_link'),
            'status': data.get('status'),
            'attendance': data.get('attendance'),
            'homeworkGiven': data.get('homework_given'),
            'homeworkNotes': data.get('homework_notes'),
            'managersRemarks': data.get('managers_remarks'),
        }

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class TutorPayrollSerializer(serializers.ModelSerializer):
    calculated_pay = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TutorPayroll
        fields = '__all__'

    def get_calculated_pay(self, obj):
        return obj.calculated_pay
