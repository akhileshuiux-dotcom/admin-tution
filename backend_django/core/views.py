from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Student, Tutor, Plan, Session, Payment, Income, Expense, TutorPayroll
from .serializers import (
    StudentSerializer, TutorSerializer, PlanSerializer,
    SessionSerializer, PaymentSerializer,
    IncomeSerializer, ExpenseSerializer, TutorPayrollSerializer
)

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

# ─── Financial Management ViewSets ───────────────────────────

class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.all().order_by('-created_at')
    serializer_class = IncomeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        mode = self.request.query_params.get('mode')
        vstatus = self.request.query_params.get('status')
        if mode:
            qs = qs.filter(payment_mode=mode)
        if vstatus:
            qs = qs.filter(verification_status=vstatus)
        return qs

    @action(detail=False, methods=['get'], url_path='financial-summary')
    def financial_summary(self, request):
        """GET /api/income/financial-summary — aggregated KPIs"""
        from django.db.models import Sum

        verified_income = Income.objects.filter(
            verification_status='Verified'
        ).aggregate(total=Sum('amount_received'))['total'] or 0

        cash_on_hand = Income.objects.filter(
            verification_status='Verified', payment_mode='Cash'
        ).aggregate(total=Sum('amount_received'))['total'] or 0

        total_expenses = Expense.objects.aggregate(total=Sum('amount'))['total'] or 0

        pending_payroll = TutorPayroll.objects.filter(payment_status='Pending')
        pending_salaries = sum(p.calculated_pay for p in pending_payroll)

        return Response({
            'totalIncome': float(verified_income),
            'totalExpenses': float(total_expenses),
            'netBalance': float(verified_income) - float(total_expenses),
            'cashOnHand': float(cash_on_hand),
            'pendingSalaries': float(pending_salaries),
        })

    @action(detail=False, methods=['post'], url_path='cash-transaction')
    def record_cash_transaction(self, request):
        """POST /api/income/cash-transaction — record immediate cash payment"""
        import time
        data = request.data.copy()
        data['payment_mode'] = 'Cash'
        data['verification_status'] = 'Verified'
        data['verified_at'] = timezone.now().isoformat()
        data['receipt_id'] = f"RCP-{str(int(time.time()))[-6:]}"
        data['audit_log'] = [{'action': 'CASH_RECORDED', 'newStatus': 'Verified', 'timestamp': timezone.now().isoformat()}]
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='verify')
    def verify_income(self, request, pk=None):
        """PATCH /api/income/:id/verify — verify or reject with audit log"""
        instance = self.get_object()
        new_status = request.data.get('status', 'Verified')
        old_status = instance.verification_status
        instance.verification_status = new_status
        instance.verified_at = timezone.now()
        log_entry = {
            'action': 'STATUS_CHANGE',
            'oldStatus': old_status,
            'newStatus': new_status,
            'timestamp': timezone.now().isoformat()
        }
        instance.audit_log = list(instance.audit_log) + [log_entry]
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-payment_date')
    serializer_class = ExpenseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs


class TutorPayrollViewSet(viewsets.ModelViewSet):
    queryset = TutorPayroll.objects.all().order_by('-created_at')
    serializer_class = TutorPayrollSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        """POST /api/tutor-payroll/:id/mark-paid — pays tutor + auto-creates expense entry"""
        from datetime import date
        instance = self.get_object()
        if instance.payment_status == 'Paid':
            return Response({'message': 'Already marked as paid.'}, status=status.HTTP_400_BAD_REQUEST)

        calculated = instance.calculated_pay

        # Auto-create expense
        expense = Expense.objects.create(
            category='Tutor Salary',
            payee_name=instance.tutor_name,
            amount=calculated,
            payment_date=date.today(),
            notes=f'Salary for {instance.month}',
            payroll_ref=instance,
        )

        # Update payroll status
        instance.payment_status = 'Paid'
        instance.paid_at = timezone.now()
        instance.save()

        return Response({
            'payroll': TutorPayrollSerializer(instance).data,
            'expense': ExpenseSerializer(expense).data,
            'message': f'Salary of {calculated} paid and logged to expenses.'
        })
