from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Enquiry
from .serializers import EnquirySerializer

class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all().order_by('-created_at')
    serializer_class = EnquirySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def _map_fields(self, data):
        # We need to map camelCase JS objects to snake_case Django fields
        mapped = data.copy()
        mapping = {
            'studentName': 'student_name',
            'contactNumber': 'contact_number',
            'preferredChannel': 'preferred_channel',
            'admissionFee': 'admission_fee',
            'studentPricing': 'student_pricing',
            'contactVia': 'contact_via',
            'failureReason': 'failure_reason',
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
        # Force partial updates (PATCH behavior) on PUT requests matching Express default behavior
        partial = True
        instance = self.get_object()
        mapped_data = self._map_fields(request.data)
        serializer = self.get_serializer(instance, data=mapped_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
