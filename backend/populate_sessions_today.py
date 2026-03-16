import random
from datetime import date
from core.models import Session, Plan

def populate_todays_sessions():
    plans = Plan.objects.all()
    if not plans.exists():
        print("No plans found.")
        return

    subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "History", "Computer Science"]
    statuses = ["Scheduled", "Ongoing", "Completed"]
    
    # Target exactly March 10, 2026 to guarantee visibility on the default page load
    target_date = date(2026, 3, 10)

    # Specific times throughout the day
    times = [
        "09:00", "09:30", "10:15", "11:00", "13:00", 
        "14:30", "15:00", "16:45", "18:00", "19:30"
    ]

    for i in range(10):
        plan = random.choice(plans)
        subject = random.choice(subjects)
        scheduled_time = times[i]
        status = random.choice(statuses)
        
        # Create session
        sess = Session.objects.create(
            plan=plan,
            sub_plan=plan.sub_plans.first(),
            tutor=plan.tutor,
            subject=subject,
            scheduled_date=target_date,
            scheduled_time=scheduled_time,
            duration_hours=random.choice([1.0, 1.5, 2.0]),
            status=status,
            google_meet_link=f"https://meet.google.com/demo-{random.randint(100,999)}" if status in ["Scheduled", "Ongoing"] else None
        )
        # Add student from plan
        sess.student_refs.add(plan.student)
        
        print(f"Created today's session {i+1}: {subject} at {scheduled_time} for {plan.student.full_name}")

if __name__ == "__main__":
    populate_todays_sessions()
