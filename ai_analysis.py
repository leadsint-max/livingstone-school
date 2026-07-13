import json
import random

def analyze_performance(student_data):
    insights = []
    for student in student_data:
        avg = sum(student['grades'].values()) / len(student['grades'])
        
        # Predictive Analysis Logic
        if avg < 50:
            status = "High Risk"
            recommendation = "Immediate parental meeting and 1-on-1 tutoring required."
        elif avg < 65:
            status = "At Risk"
            recommendation = "Recommend extra help in " + min(student['grades'], key=student['grades'].get)
        elif avg > 90:
            status = "Excellence"
            recommendation = "Consider for advanced placement or scholarship."
        else:
            status = "Steady"
            recommendation = "Continue current study plan."
            
        insights.append({
            "name": student['name'],
            "average": round(avg, 1),
            "status": status,
            "recommendation": recommendation,
            "weakest_subject": min(student['grades'], key=student['grades'].get)
        })
    return insights

# Mock Data
students = [
    {"name": "Samuel Okon", "grades": {"Math": 88, "Physics": 75, "Chemistry": 92}},
    {"name": "Jane Doe", "grades": {"Math": 42, "Physics": 48, "Chemistry": 45}},
    {"name": "David Adeleke", "grades": {"Math": 95, "Physics": 98, "Chemistry": 91}},
    {"name": "Mary Johnson", "grades": {"Math": 60, "Physics": 55, "Chemistry": 58}}
]

analysis_results = analyze_performance(students)
print(json.dumps(analysis_results, indent=2))
