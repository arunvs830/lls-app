import unittest
from werkzeug.security import generate_password_hash
from models import Admin, Student, db
from tests.base_test import BaseTestCase
import time

class TestSecurity(BaseTestCase):
    
    # ---------------------------------------------------------
    # 1. SQL Injection Tests
    # ---------------------------------------------------------
    def test_sql_injection_login(self):
        """
        Test resilience against SQL Injection in login.
        SQLAlchemy ORM should prevent this, so we expect this to FAIL to login (401),
        not crash (500) or bypass auth (200).
        """
        payloads = [
            "' OR '1'='1",
            "admin' --",
            "admin' #",
            "' UNION SELECT 1, 'admin', 'password' --"
        ]
        
        for payload in payloads:
            response = self.client.post('/api/auth/login', json={
                'email': payload,
                'password': 'password123',
                'role': 'admin'
            })
            
            # Should fail authentication
            self.assertNotEqual(response.status_code, 200, f"SQL Injection succeeded with payload: {payload}")
            self.assertNotEqual(response.status_code, 500, f"SQL Injection caused server error with payload: {payload}")
            self.assertEqual(response.status_code, 401)

    # ---------------------------------------------------------
    # 2. XSS (Cross-Site Scripting) Tests
    # ---------------------------------------------------------
    def test_xss_payload_handling(self):
        """
        Test that XSS payloads are not executed or stored dangerously.
        Since this is a JSON API, the risk is lower, but we ensure the API handles it gracefully.
        """
        xss_payload = "<script>alert('xss')</script>"
        
        # Try to register a student with XSS username (using direct DB insertion to simulate)
        # In a real scenario, we'd use a registration endpoint if it existed.
        student = Student(
            student_code='XSS001',
            username=xss_payload,
            email='xss@test.com',
            full_name=xss_payload,
            password_hash='hash',
            program_id=self.program.id,
            semester_id=self.semester.id
        )
        db.session.add(student)
        db.session.commit()
        
        # Fetch the student
        response = self.client.get('/api/students')
        data = response.get_json()
        
        found = False
        for s in data:
            if s['student_code'] == 'XSS001':
                found = True
                # The API simply returns the string. 
                # A robust frontend (React) escapes this by default, 
                # but the API itself should ideally sanitize or at least return it as is (which it does).
                self.assertEqual(s['username'], xss_payload)
        self.assertTrue(found)

    # ---------------------------------------------------------
    # 3. Brute Force / Rate Limiting Tests
    # ---------------------------------------------------------
    def test_brute_force_vulnerability(self):
        """
        SECURITY AUDIT: Test for lack of Rate Limiting.
        We expect this to SUCCEED in performing many requests rapidly,
        proving the vulnerability exists.
        """
        # Try 10 rapid failed login attempts
        for _ in range(10):
            response = self.client.post('/api/auth/login', json={
                'email': 'admin@test.com',
                'password': 'wrongpassword',
                'role': 'admin'
            })
            self.assertEqual(response.status_code, 401)
        
        # The 11th attempt with CORRECT password should still work
        # (If rate limiting existed, this might fail or be delayed)
        response = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123',
            'role': 'admin'
        })
        
        # If this asserts true, it proves NO LOCKOUT mechanism exists (Vulnerable)
        self.assertEqual(response.status_code, 200, "Brute force vulnerability confirmed: No account lockout after multiple failures")

    # ---------------------------------------------------------
    # 4. Broken Authentication / Session Management
    # ---------------------------------------------------------
    def test_missing_auth_token(self):
        """
        SECURITY AUDIT: Verify that login does NOT return a secure token.
        This confirms the system relies on client-side state only (Vulnerable).
        """
        response = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123',
            'role': 'admin'
        })
        
        data = response.get_json()
        headers = response.headers
        
        # Check for standard token fields
        has_token = 'token' in data or 'access_token' in data or 'jwt' in data
        
        # Check for Set-Cookie header
        has_cookie = 'Set-Cookie' in headers
        
        # We expect this to be FALSE in the current vulnerable implementation
        if not has_token and not has_cookie:
            print("\n[AUDIT] Confirmed: Login endpoint does not issue JWT or Session Cookie.")
        else:
            self.fail("Unexpected security feature found: Token or Cookie was issued!")

    # ---------------------------------------------------------
    # 5. Role-Based Access Control (RBAC) Gaps
    # ---------------------------------------------------------
    def test_rbac_bypass_vulnerability(self):
        """
        SECURITY AUDIT: Verify that a generic request (simulating a student or anon)
        can access Admin-only resources.
        """
        # Try to delete a certificate layout (Administrative action)
        # We don't log in, or we pretend to be a student (but since there's no auth check, it's the same)
        
        # Create a layout to delete
        from models import CertificateLayout
        layout = CertificateLayout(
            layout_name="Sensitive Layout",
            program_id=self.program.id
        )
        db.session.add(layout)
        db.session.commit()
        layout_id = layout.id
        
        # Attempt delete without auth headers
        response = self.client.delete(f'/api/certificate-layouts/{layout_id}')
        
        # In a secure system, this should be 401 or 403.
        # In the current system, we expect 200 (Success), proving the vulnerability.
        self.assertEqual(response.status_code, 200, "RBAC Vulnerability confirmed: Unauthenticated user can delete resources")

    # ---------------------------------------------------------
    # 6. Password Reset Flow
    # ---------------------------------------------------------
    def test_missing_password_reset_api(self):
        """
        Verify that no API endpoint exists for password reset.
        """
        response = self.client.post('/api/auth/reset-password', json={
            'email': 'admin@test.com'
        })
        
        # Should be 404 Not Found
        self.assertEqual(response.status_code, 404, "Password reset endpoint unexpectedly exists")

    # ---------------------------------------------------------
    # 7. Sensitive Data Exposure
    # ---------------------------------------------------------
    def test_password_hash_exposure(self):
        """
        Ensure API does not leak password hashes in user responses.
        """
        # Login
        response = self.client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'password123',
            'role': 'admin'
        })
        
        data = response.get_json()
        user_obj = data.get('user', {})
        
        self.assertNotIn('password', user_obj)
        self.assertNotIn('password_hash', user_obj)
        self.assertNotIn('hash', user_obj)

if __name__ == '__main__':
    unittest.main()
