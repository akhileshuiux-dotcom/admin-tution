import random
from datetime import date, timedelta
from core.models import ExamSchedule, ExamQuestion, Student, Tutor, Plan

def populate_demo_exams():
    students = Student.objects.all()
    tutors = Tutor.objects.all()
    
    if not students.exists() or not tutors.exists():
        print("Please populate students and tutors first.")
        return

    exam_names = [
        "Mid-Term Mathematics", "Physics Mock Exam", "Chemistry Quiz 2",
        "Biology Board Prep", "English Literature Assessment", 
        "History Monthly Test", "Algebra Foundations", "Calculus Basics",
        "Modern History Final", "Quantum Physics Seminar"
    ]
    categories = ["Internal", "Mock", "School/Board"]
    statuses = ["Scheduled", "Ongoing", "Completed", "Evaluated", "Postponed"]
    question_types = ["MCQ", "SHORT", "LONG", "YES_NO"]
    
    today = date(2026, 3, 10)

    for i in range(10):
        student = random.choice(students)
        tutor = random.choice(tutors)
        
        # Try to find a plan for the student to link it if possible
        plan = Plan.objects.filter(student=student).first()
        
        offset = random.randint(-15, 15)
        exam_date = today + timedelta(days=offset)
        
        hour = random.randint(8, 18)
        minute = random.choice([0, 15, 30, 45])
        time_str = f"{hour:02d}:{minute:02d}"
        
        status = random.choice(statuses)
        
        exam = ExamSchedule.objects.create(
            name=exam_names[i],
            category=random.choice(categories),
            date=exam_date,
            time=time_str,
            student=student,
            tutor=tutor,
            plan=plan,
            syllabus=f"Detailed syllabus for {exam_names[i]} covering Chapters 1-5.",
            duration=random.choice([30, 60, 90, 120]),
            buffer_time=random.randint(0, 15),
            status=status,
            marks_obtained=random.randint(40, 90) if status in ["Completed", "Evaluated"] else None,
            total_marks=100 if status in ["Completed", "Evaluated"] else None,
            feedback="Good performance!" if status == "Evaluated" else ""
        )
        
        # Add 3-5 questions for each exam
        for q_idx in range(random.randint(3, 5)):
            q_type = random.choice(question_types)
            payload = {}
            if q_type == "MCQ":
                payload = {
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": random.randint(0, 3)
                }
            elif q_type == "YES_NO":
                payload = {"correct_answer": random.choice(["Yes", "No"])}
                
            ExamQuestion.objects.create(
                exam=exam,
                question_type=q_type,
                text=f"Sample {q_type} question text for {exam.name} - Q{q_idx+1}",
                marks=random.randint(1, 10),
                order=q_idx,
                payload=payload
            )

        print(f"Created demo exam {i+1}: {exam.name} for {student.full_name} on {exam_date}")

if __name__ == "__main__":
    populate_demo_exams()
