from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Student, Tutor, Plan, Session, Payment
from .serializers import StudentSerializer, TutorSerializer, PlanSerializer, SessionSerializer, PaymentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('-created_at')
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

    def _map_fields(self, data):
        mapped = data.copy()
        mapping = {
            'fullName': 'full_name',
            'academicYear': 'academic_year',
            'mediumOfCommunication': 'medium_of_communication',
            'contactMethod': 'contact_method',
            'parentRemarks': 'parent_remarks',
            'phoneNumber': 'phone_number',
            'whatsappGroup': 'whatsapp_group',
            'contactVia': 'contact_via',
            'parentName': 'parent_name',
            'enquiryRef': 'enquiry_ref'
        }
        for camel, snake in mapping.items():
            if camel in mapped:
                mapped[snake] = mapped.pop(camel)
        return mapped

    def create(self, request, *args, **kwargs):
        mapped_data = self._map_fields(request.data)
        serializer = self.get_serializer(data=mapped_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        mapped_data = self._map_fields(request.data)
        serializer = self.get_serializer(instance, data=mapped_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class TutorViewSet(viewsets.ModelViewSet):
    queryset = Tutor.objects.all().order_by('-created_at')
    serializer_class = TutorSerializer
    permission_classes = [AllowAny]

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all().order_by('-created_at')
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all().order_by('-scheduled_date')
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        plan_id = self.request.query_params.get('planId', None)
        if plan_id:
            queryset = queryset.filter(plan_id=plan_id)
        return queryset

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-payment_date')
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]
