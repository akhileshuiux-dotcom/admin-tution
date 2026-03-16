from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    login_view, logout_view, StudentProfileView, 
    TeacherViewSet, SubjectViewSet, CourseViewSet, 
    LessonViewSet, ResourceViewSet, ExamViewSet, 
    QuestionViewSet, ExamResultViewSet
)

router = DefaultRouter()
router.register(r'teachers', TeacherViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'exam-results', ExamResultViewSet)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', StudentProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]
