import pytest
import sys
import os

# Add the backend directory to the path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from models import db, Admin, Student, Program, Semester

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    # Use a separate config for testing
    class TestConfig:
        TESTING = True
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
        SQLALCHEMY_TRACK_MODIFICATIONS = False
        SECRET_KEY = 'test-key'

    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test runner for the app's CLI commands."""
    return app.test_cli_runner()

@pytest.fixture
def admin_user(app):
    """Create a test admin user."""
    from werkzeug.security import generate_password_hash
    with app.app_context():
        admin = Admin(
            username='admin',
            email='admin@test.com',
            password_hash=generate_password_hash('password123'),
            full_name='Admin User'
        )
        db.session.add(admin)
        db.session.commit()
        return admin

@pytest.fixture
def sample_program_semester(app):
    """Create sample program and semester for foreign keys."""
    with app.app_context():
        program = Program(program_name="Computer Science", program_code="CS")
        semester = Semester(semester_name="Semester 1", semester_number=1)
        db.session.add(program)
        db.session.add(semester)
        db.session.commit()
        return program.id, semester.id
