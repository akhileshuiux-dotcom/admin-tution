from rest_framework import serializers
from .models import Enquiry, DemoRequest, FollowUp

class DemoRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemoRequest
        fields = '__all__'

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
        # We can map some keys manually if needed, or use a tool like djangorestframework-camel-case
        # For simplicity in this demo, we'll map a few common ones
        return_data = {
            'id': data.get('id'),
            '_id': data.get('id'), # To help with Mongoose '_id' expectations on frontend
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
            'demoRequests': data.get('demoRequests', []),
            'followUps': data.get('followUps', []),
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }
        return return_data
