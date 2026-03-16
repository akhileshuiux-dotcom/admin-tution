import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_log_income():
    payload = {
        "studentName": "Test Student",
        "amountReceived": 100,
        "paymentMode": "Cash",
        "planType": "One-Time",
        "serviceProvided": "Mock Test",
        "date": "2026-03-12"
    }
    res = requests.post(f"{BASE_URL}/income/", json=payload)
    print(f"Income Status: {res.status_code}")
    print(res.json())

def test_log_expense():
    payload = {
        "payeeName": "Mock Landlord",
        "amount": 500,
        "category": "Rent",
        "paymentDate": "2026-03-12",
        "notes": "Test Expense"
    }
    res = requests.post(f"{BASE_URL}/expenses/", json=payload)
    print(f"Expense Status: {res.status_code}")
    print(res.json())

if __name__ == "__main__":
    test_log_income()
    test_log_expense()
