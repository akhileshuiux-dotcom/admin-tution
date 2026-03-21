from django.contrib import admin
from .models import (
    Student, Teacher, Subject, Course, Lesson, Resource, 
    Exam, Question, ExamResult, Attendance, AdminMeeting
)

admin.site.register(Student)
admin.site.register(Teacher)
admin.site.register(Subject)
admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Resource)
admin.site.register(Exam)
admin.site.register(Question)
admin.site.register(ExamResult)
admin.site.register(Attendance)
admin.site.register(AdminMeeting)
