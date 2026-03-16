from rest_framework import serializers
from .models import Enquiry, DemoRequest, FollowUp

class DemoRequestSerializer(serializers.ModelSerializer):
    studentName = serializers.CharField(source='enquiry.student_name', read_only=True)
    grade = serializers.CharField(source='enquiry.grade', read_only=True)

    class Meta:
        model = DemoRequest
        fields = [
            'id', 'enquiry', 'subject', 'topic', 'preferred_date', 
            'preferred_time', 'status', 'final_tutor', 'studentName', 'grade'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Map date/time to what the frontend expects for the activity-time display
        return {
            'id': data.get('id'),
            'studentName': data.get('studentName'),
            'grade': data.get('grade'),
            'subject': data.get('subject'),
            'date': data.get('preferred_date'),
            'time': data.get('preferred_time'),
            'topic': data.get('topic'),
            'status': data.get('status')
        }

class FollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = '__all__'

class EnquirySerializer(serializers.ModelSerializer):
    demoRequests = DemoRequestSerializer(source='demo_requests', many=True, read_only=True)
    followUps = FollowUpSerializer(source='follow_ups', many=True, read_only=True)

    class Meta:
        model = Enquiry
        fields = '__all__'

    def to_representation(self, instance):
        # To match the JS CamelCase keys exactly what the frontend anticipates
        data = super().to_representation(instance)
        
        # We handle the related fields manually because they might not be in 'data'
        # if not explicitly added to Meta.fields or if they are read-only
        demo_requests = DemoRequestSerializer(instance.demo_requests.all(), many=True).data
        follow_ups = FollowUpSerializer(instance.follow_ups.all(), many=True).data

        return_data = {
            'id': data.get('id'),
            '_id': data.get('id'),
            'studentName': data.get('student_name'),
            'grade': data.get('grade'),
            'contactNumber': data.get('contact_number'),
            'email': data.get('email'),
            'preferredChannel': data.get('preferred_channel'),
            'syllabus': data.get('syllabus'),
            'publication': data.get('publication'),
            'location': data.get('location'),
            'country': data.get('country'),
            'timezone': data.get('timezone'),
            'admissionFee': data.get('admission_fee'),
            'studentPricing': data.get('student_pricing'),
            'contactVia': data.get('contact_via'),
            'remarks': data.get('remarks'),
            'status': data.get('status'),
            'failureReason': data.get('failure_reason'),
            'demoRequests': demo_requests,
            'followUps': follow_ups,
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }
        return return_data
