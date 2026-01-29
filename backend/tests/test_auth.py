import unittest
from werkzeug.security import generate_password_hash
from models import Student, db
from tests.base_test import BaseTestCase

class TestAuth(BaseTestCase):
    def test_admin_login(self):
        """Test that admin can login with correct credentials."""
        response = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123',
            'role': 'admin'
        })
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['user']['username'], 'admin')

    def test_admin_login_fail(self):
        """Test that admin login fails with incorrect password."""
        response = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'wrongpassword',
            'role': 'admin'
        })
        
        self.assertEqual(response.status_code, 401)
        self.assertFalse(response.get_json()['success'])

    def test_student_login(self):
        """Test student login."""
        student = Student(
            student_code='ST001',
            username='student1',
            email='student1@test.com',
            password_hash=generate_password_hash('studentpass'),
            full_name='Test Student',
            program_id=self.program.id,
            semester_id=self.semester.id
        )
        db.session.add(student)
        db.session.commit()

        response = self.client.post('/api/auth/login', json={
            'email': 'student1@test.com',
            'password': 'studentpass',
            'role': 'student'
        })
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['user']['username'], 'student1')

    def test_invalid_role(self):
        """Test login with invalid role."""
        response = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123',
            'role': 'hacker'
        })
        
        self.assertEqual(response.status_code, 400)