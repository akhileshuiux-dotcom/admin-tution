import random
from datetime import date, timedelta
from core.models import Session, Plan, SubPlan, Tutor, Student

def populate_demo_sessions():
    plans = Plan.objects.all()
    if not plans.exists():
        print("No plans found. Please populate students, tutors, and plans first.")
        return

    subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"]
    topics = {
        "Mathematics": ["Algebra Basics", "Calculus I", "Geometry", "Trigonometry"],
        "Physics": ["Newtonian Mechanics", "Thermodynamics", "Optics"],
        "Chemistry": ["Organic Chemistry", "Periodic Table", "Chemical Bonding"],
        "Biology": ["Cell Structure", "Genetics", "Human Anatomy"],
        "English": ["Grammar", "Creative Writing", "Literature Analysis"],
        "History": ["World War II", "Ancient Civilizations", "The Renaissance"]
    }
    statuses = ["Scheduled", "Completed", "Cancelled", "Rescheduled"]
    
    # Use today as base for demo data
    today = date(2026, 3, 10) # Fixed base date to match user context

    for i in range(10):
        plan = random.choice(plans)
        subject = random.choice(subjects)
        topic = random.choice(topics.get(subject, ["General Study"]))
        
        # Spread sessions around the current date
        offset = random.randint(-5, 5)
        scheduled_date = today + timedelta(days=offset)
        
        hour = random.randint(8, 20)
        minute = random.choice([0, 30])
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
            google_meet_link="https://meet.google.com/demo-session" if status == "Scheduled" else None
        )
        # Add student from plan
        sess.student_refs.add(plan.student)
        
        print(f"Created demo session {i+1}: {subject} for {plan.student.full_name} on {scheduled_date}")

if __name__ == "__main__":
    populate_demo_sessions()
