import unittest
import sys
import os
from werkzeug.security import generate_password_hash

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from models import db, Admin, Program, Semester

class BaseTestCase(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures."""
        class TestConfig:
            TESTING = True
            SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
            SQLALCHEMY_TRACK_MODIFICATIONS = False
            SECRET_KEY = 'test-key'

        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()

        # Create common fixtures
        self.create_fixtures()

    def tearDown(self):
        """Tear down test fixtures."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def create_fixtures(self):
        """Create admin user and sample program."""
        # Admin
        self.admin = Admin(
            username='admin',
            email='admin@test.com',
            password_hash=generate_password_hash('password123'),
            full_name='Admin User'
        )
        db.session.add(self.admin)

        # Program & Semester
        self.program = Program(program_name="Computer Science", program_code="CS")
        self.semester = Semester(semester_name="Semester 1", semester_number=1)
        db.session.add(self.program)
        db.session.add(self.semester)
        
        db.session.commit()
