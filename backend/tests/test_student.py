import unittest
from models import Student, db
from tests.base_test import BaseTestCase

class TestStudent(BaseTestCase):
    def test_get_students_empty(self):
        """Test getting students when list is empty."""
        response = self.client.get('/api/students')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), [])

    def test_create_student(self):
        """Test creating a new student."""
        student_data = {
            'student_code': 'ST002',
            'username': 'newstudent',
            'email': 'new@test.com',
            'full_name': 'New Student',
            'password': 'password123',
            'program_id': self.program.id,
            'semester_id': self.semester.id,
            'enrollment_date': '2023-01-01'
        }
        
        response = self.client.post('/api/students', json=student_data)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()['message'], 'Created successfully')
        
        # Verify persistence
        response = self.client.get('/api/students')
        data = response.get_json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['student_code'], 'ST002')

    def test_delete_student(self):
        """Test deleting a student."""
        # Create a student directly in DB
        student = Student(
            student_code='DEL001',
            username='delete_me',
            email='del@test.com',
            password_hash='hash',
            full_name='Delete Me',
            program_id=self.program.id,
            semester_id=self.semester.id
        )
        db.session.add(student)
        db.session.commit()
        student_id = student.id

        # Delete via API
        response = self.client.delete(f'/api/students/{student_id}')
        self.assertEqual(response.status_code, 200)
        
        # Verify gone
        response = self.client.get('/api/students')
        self.assertEqual(len(response.get_json()), 0)

    def test_security_vulnerability_access_without_auth(self):
        """
        DOCUMENTING VULNERABILITY:
        This test passes, which proves that sensitive student data 
        can be accessed without any authentication headers.
        """
        response = self.client.get('/api/students')
        self.assertEqual(response.status_code, 200)