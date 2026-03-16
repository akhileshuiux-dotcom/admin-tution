import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_add_session():
    # 1. Get a student ID
    students = requests.get(f"{BASE_URL}/students/").json()
    if not students:
        print("No students found to test with.")
        return
    
    student_id = students[0]['id']
    
    # 2. Get a tutor ID
    tutors = requests.get(f"{BASE_URL}/tutors/").json()
    if not tutors:
        print("No tutors found to test with.")
        return
    
    tutor_id = tutors[0]['id']
    
    payload = {
        "studentId": student_id,
        "tutorId": tutor_id,
        "date": "2026-03-30",
        "time": "14:00",
        "topic": "Maths - Calculus",
        "subject": "Maths"
    }
    
    res = requests.post(f"{BASE_URL}/sessions/", json=payload)
    print(f"Session Status: {res.status_code}")
    print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    test_add_session()
