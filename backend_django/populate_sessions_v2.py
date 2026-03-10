import random
from datetime import date, timedelta
from core.models import Session, Plan, SubPlan, Tutor, Student

def populate_additional_sessions():
    plans = Plan.objects.all()
    if not plans.exists():
        print("No plans found. Please populate students, tutors, and plans first.")
        return

    subjects = ["Advanced Mathematics", "Quantum Physics", "Organic Chemistry", "Genetics", "World History", "English Literature"]
    # Focus on 'Scheduled' and 'Ongoing' to show upcoming/active sessions
    statuses = ["Scheduled", "Scheduled", "Ongoing", "Scheduled", "Completed"]
    
    today = date(2026, 3, 10)

    for i in range(10):
        plan = random.choice(plans)
        subject = random.choice(subjects)
        
        # Spread sessions over the next 10 days
        offset = random.randint(0, 10)
        scheduled_date = today + timedelta(days=offset)
        
        hour = random.randint(8, 21)
        minute = random.choice([0, 15, 30, 45])
        scheduled_time = f"{hour:02d}:{minute:02d}"
        
        status = random.choice(statuses)
        
        # Create session
        sess = Session.objects.create(
            plan=plan,
            sub_plan=plan.sub_plans.first(),
            tutor=plan.tutor,
            subject=subject,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
            duration_hours=random.choice([1.0, 1.5, 2.0]),
            status=status,
            google_meet_link=f"https://meet.google.com/demo-{random.randint(100,999)}" if status in ["Scheduled", "Ongoing"] else None
        )
        # Add student from plan
        sess.student_refs.add(plan.student)
        
        print(f"Created additional session {i+1}: {subject} for {plan.student.full_name} on {scheduled_date}")

if __name__ == "__main__":
    populate_additional_sessions()
