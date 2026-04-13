from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    login_view, logout_view, ProfileView, get_csrf_token_view, 
    StudentViewSet, TeacherViewSet, SubjectViewSet, CourseViewSet, 
    LessonViewSet, ResourceViewSet, ExamViewSet, 
    QuestionViewSet, ExamResultViewSet, 
    AttendanceViewSet, AdminMeetingViewSet, TeacherAttendanceViewSet,
    StudentPaymentViewSet, TeacherSalaryViewSet, ExpenseViewSet, IncomeViewSet,
    FeeTierViewSet, StudentDiscountViewSet, InvoiceViewSet,
    CreditAdvanceViewSet, FinancialTransactionViewSet, FeeInstallmentViewSet, FinanceDashboardView,
    NoteAssignmentViewSet, OnlineClassViewSet, TeacherMeetingViewSet, PreviousYearPaperViewSet,
    PaperAttemptViewSet
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'exam-results', ExamResultViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'teacher-attendance', TeacherAttendanceViewSet)
router.register(r'admin-meetings', AdminMeetingViewSet)
router.register(r'payments', StudentPaymentViewSet)
router.register(r'salaries', TeacherSalaryViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'income', IncomeViewSet)
router.register(r'fee-tiers', FeeTierViewSet)
router.register(r'discounts', StudentDiscountViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'credits', CreditAdvanceViewSet)
router.register(r'transactions', FinancialTransactionViewSet)
router.register(r'installments', FeeInstallmentViewSet)
router.register(r'note-assignments', NoteAssignmentViewSet)
router.register(r'online-classes', OnlineClassViewSet)
router.register(r'teacher-meetings', TeacherMeetingViewSet)
router.register(r'previous-papers', PreviousYearPaperViewSet)
router.register(r'paper-attempts', PaperAttemptViewSet)

urlpatterns = [
    path('csrf/', get_csrf_token_view, name='get_csrf'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('finance-dashboard/', FinanceDashboardView.as_view(), name='finance_dashboard'),
    path('', include(router.urls)),
]
