from rest_framework import serializers
from .models import Student, Tutor, Plan, SubPlan, Session, Payment, Income, Expense, TutorPayroll, ExamSchedule, ExamQuestion

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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'name': instance.user.name,
            'email': instance.user.email,
            'contactNumber': data.get('contact_number'),
            'address': data.get('address'),
            'dateOfBirth': data.get('date_of_birth'),
            'gender': data.get('gender'),
            'educationalQualifications': data.get('educational_qualifications'),
            'teachingExperienceMonths': data.get('teaching_experience_months'),
            'subjectExpertise': data.get('subject_expertise'),
            'classesCanTeach': data.get('classes_can_teach'),
            'syllabusExpertise': data.get('syllabus_expertise'),
            'languagesSpoken': data.get('languages_spoken'),
            'googleMeetLink': data.get('google_meet_link'),
            'networkConnectivity': data.get('network_connectivity'),
            'device': data.get('device'),
            'boardType': data.get('board_type'),
            'bankDetails': data.get('bank_details'),
            'availability': data.get('availability'),
            'status': data.get('status'),
            'remarks': data.get('remarks'),
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }

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
        
    def students_list(self, obj):
        return ", ".join([s.full_name for s in obj.student_refs.all()])

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Handle batched student names
        student_names = ", ".join([s.full_name for s in instance.student_refs.all()])
        
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'planRef': data.get('plan'),
            'tutorRef': data.get('tutor'),
            'studentName': student_names,
            'tutorName': instance.tutor.user.name if instance.tutor else "Unassigned",
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'planRef': data.get('plan'),
            'subPlanRef': data.get('sub_plan'),
            'studentRef': data.get('student'),
            'amountDue': data.get('amount_due'),
            'amountReceived': data.get('amount_received'),
            'bankAccountCredited': data.get('bank_account_credited'),
            'paymentDate': data.get('payment_date'),
            'status': data.get('status'),
            'verifiedBy': data.get('verified_by'),
            'remarks': data.get('remarks'),
            'paymentMethod': data.get('payment_method'),
            'receiptId': data.get('receipt_id'),
            'isOneTimeFeeIncluded': data.get('is_one_time_fee_included'),
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'studentName': data.get('student_name'),
            'planType': data.get('plan_type'),
            'amountReceived': data.get('amount_received'),
            'paymentMode': data.get('payment_mode'),
            'serviceProvided': data.get('service_provided'),
            'verificationStatus': data.get('verification_status'),
            'verifiedBy': data.get('verified_by'),
            'verifiedAt': data.get('verified_at'),
            'remarks': data.get('remarks'),
            'receiptId': data.get('receipt_id'),
            'auditLog': data.get('audit_log'),
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'category': data.get('category'),
            'payeeName': data.get('payee_name'),
            'amount': data.get('amount'),
            'paymentDate': data.get('payment_date'),
            'receiptAttachmentUrl': data.get('receipt_attachment_url'),
            'notes': data.get('notes'),
            'payrollRef': data.get('payroll_ref'),
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }

class TutorPayrollSerializer(serializers.ModelSerializer):
    calculated_pay = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TutorPayroll
        fields = '__all__'

    def get_calculated_pay(self, obj):
        return obj.calculated_pay

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'id': data.get('id'),
            '_id': data.get('id'),
            'tutorName': data.get('tutor_name'),
            'month': data.get('month'),
            'baseSalary': data.get('base_salary'),
            'hourlyRate': data.get('hourly_rate'),
            'hoursLogged': data.get('hours_logged'),
            'calculatedPay': data.get('calculated_pay'),
            'paymentStatus': data.get('payment_status'),
            'paidAt': data.get('paid_at'),
            'paidBy': data.get('paid_by'),
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }

class ExamQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamQuestion
        fields = '__all__'

class ExamScheduleSerializer(serializers.ModelSerializer):
    questions = ExamQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = ExamSchedule
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Handle camelCase mapping for new fields
        representation['durationMinutes'] = representation.pop('duration', 60)
        representation['bufferTime'] = representation.pop('buffer_time', 0)
        representation['autoSubmit'] = representation.pop('auto_submit', True)
        representation['timerExpiryAction'] = representation.pop('timer_expiry_action', 'AUTO_SUBMIT')
        representation['mixedMode'] = representation.pop('mixed_mode', False)
        
        # Existing mappings, converted to pop for consistency
        exam_id = representation.pop('id')
        return {
            'id': exam_id,
            '_id': exam_id,
            'examName': representation.pop('name', ''), # Renamed from 'name' to 'examName'
            'category': representation.pop('category'),
            'date': representation.pop('date'),
            'time': representation.pop('time'),
            'studentRef': representation.pop('student'),
            'planRef': representation.pop('plan'),
            'syllabus': representation.pop('syllabus'),
            'tutorRef': representation.pop('tutor'),
            'status': representation.pop('status'),
            'marksObtained': representation.pop('marks_obtained'),
            'totalMarks': representation.pop('total_marks'),
            'feedback': representation.pop('feedback'),
            'createdAt': representation.pop('created_at'),
            'updatedAt': representation.pop('updated_at'),
            'durationMinutes': representation.pop('durationMinutes'), # New field
            'bufferTime': representation.pop('bufferTime'), # New field
            'autoSubmit': representation.pop('autoSubmit'), # New field
            'timerExpiryAction': representation.pop('timerExpiryAction'), # New field
            'mixedMode': representation.pop('mixedMode'), # New field
            'questions': representation.pop('questions', []), # Nested questions
        }
