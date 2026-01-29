
import unittest
import sys
import os
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from config import Config
from models import db, Student, Course, Assignment, Program, Semester, Staff, StudentCourse

class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    TESTING = True

class TestAssignment(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Setup basic data
        self.program = Program(program_name="Test Prog", program_code="TP")
        self.semester = Semester(semester_name="Sem 1", semester_number=1)
        self.staff = Staff(staff_code="S1", username="staff1", email="s1@test.com", password_hash="x", full_name="Staff 1")
        
        db.session.add(self.program)
        db.session.add(self.semester)
        db.session.add(self.staff)
        db.session.commit()
        
        self.course = Course(course_code="C1", course_name="Course 1", program_id=self.program.id, semester_id=self.semester.id)
        db.session.add(self.course)
        db.session.commit()
        
        self.student = Student(
            student_code="STU1", username="stu1", email="stu1@test.com", 
            password_hash="x", full_name="Student 1", 
            program_id=self.program.id, semester_id=self.semester.id
        )
        db.session.add(self.student)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_assignment_filtering(self):
        """Test that student ONLY sees assignments for explicitly enrolled courses"""
        
        # Create assignment for Course 1
        assign1 = Assignment(title="A1", course_id=self.course.id, staff_id=self.staff.id)
        db.session.add(assign1)
        db.session.commit()
        
        # Case 1: Student NOT enrolled (even though program/semester match)
        # Expected: No assignments
        res = self.client.get(f'/api/assignments?student_id={self.student.id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data), 0, "Should be 0 because not explicitly enrolled")
        
        # Case 2: Student Explicitly Enrolled
        enrollment = StudentCourse(student_id=self.student.id, course_id=self.course.id, status='active')
        db.session.add(enrollment)
        db.session.commit()
        
        res = self.client.get(f'/api/assignments?student_id={self.student.id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data), 1, "Should be 1 after enrollment")
        self.assertEqual(data[0]['id'], assign1.id)

    def test_overdue_submission(self):
        """Test that overdue assignments cannot be submitted"""
        
        # Enroll student
        enrollment = StudentCourse(student_id=self.student.id, course_id=self.course.id, status='active')
        db.session.add(enrollment)
        
        # Create Past Assignment
        past_date = datetime.utcnow() - timedelta(days=1)
        assign_past = Assignment(title="Past", course_id=self.course.id, staff_id=self.staff.id, due_date=past_date)
        db.session.add(assign_past)
        
        # Create Future Assignment
        future_date = datetime.utcnow() + timedelta(days=1)
        assign_future = Assignment(title="Future", course_id=self.course.id, staff_id=self.staff.id, due_date=future_date)
        db.session.add(assign_future)
        
        db.session.commit()
        
        # Try submitting to Past Assignment
        res = self.client.post('/api/submissions', data={
            'assignment_id': assign_past.id,
            'student_id': self.student.id,
            'submission_text': 'Late work'
        })
        
        self.assertEqual(res.status_code, 400, "Should fail for overdue assignment")
        self.assertIn("overdue", res.get_json()['error'])
        
        # Try submitting to Future Assignment
        res = self.client.post('/api/submissions', data={
            'assignment_id': assign_future.id,
            'student_id': self.student.id,
            'submission_text': 'On time work'
        })
        
        self.assertEqual(res.status_code, 201, "Should succeed for future assignment")
