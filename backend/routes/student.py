from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, Student, StudentCourse, Course, Program, Semester
from datetime import datetime

student_bp = Blueprint('student', __name__)

def parse_date(date_str):
    if not date_str:
        return None
    return datetime.strptime(date_str, '%Y-%m-%d').date()

def generate_student_code():
    """Generate a unique student code"""
    last_student = Student.query.order_by(Student.id.desc()).first()
    if last_student:
        # Try to extract number from last student code
        try:
            last_num = int(last_student.student_code.replace('STU', ''))
            return f"STU{str(last_num + 1).zfill(4)}"
        except:
            pass
    return f"STU{str(Student.query.count() + 1).zfill(4)}"

@student_bp.route('/api/students', methods=['GET'])
def get_all():
    students = Student.query.all()
    return jsonify([{
        'id': s.id,
        'student_code': s.student_code,
        'email': s.email,
        'full_name': s.full_name,
        'program_id': s.program_id,
        'semester_id': s.semester_id,
        'enrollment_date': s.enrollment_date.isoformat() if s.enrollment_date else None
    } for s in students])

@student_bp.route('/api/students', methods=['POST'])
def create():
    data = request.get_json()
    student = Student(
        student_code=data['student_code'],
        email=data['email'],
        full_name=data['full_name'],
        password_hash=generate_password_hash(data['password']),
        program_id=data.get('program_id'),
        semester_id=data.get('semester_id'),
        enrollment_date=parse_date(data.get('enrollment_date'))
    )
    db.session.add(student)
    db.session.commit()
    return jsonify({'id': student.id, 'message': 'Created successfully'}), 201


# -----------------------------------------------------
# Student Registration Endpoint
# -----------------------------------------------------

@student_bp.route('/api/auth/register', methods=['POST'])
def register_student():
    """
    Public endpoint for student self-registration.
    Expects: { full_name, email, password, program_id, semester_id, course_ids: [] }
    """
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['full_name', 'email', 'password', 'program_id', 'semester_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if email already exists
    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Use email as username
    username = data['email']
    
    # Check if username (email) already exists
    if Student.query.filter_by(username=username).first():
        return jsonify({'error': 'Account with this email already exists'}), 400
    
    try:
        # Create student
        student = Student(
            student_code=generate_student_code(),
            username=username,
            email=data['email'],
            full_name=data['full_name'],
            password_hash=generate_password_hash(data['password']),
            program_id=data['program_id'],
            semester_id=data['semester_id'],
            enrollment_date=datetime.utcnow().date()
        )
        db.session.add(student)
        db.session.flush()  # Get the student ID
        
        # Enroll in selected courses
        course_ids = data.get('course_ids', [])
        for course_id in course_ids:
            # Verify course exists and belongs to the selected program/semester
            course = Course.query.get(course_id)
            if course:
                enrollment = StudentCourse(
                    student_id=student.id,
                    course_id=course_id,
                    status='active'
                )
                db.session.add(enrollment)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'student': {
                'id': student.id,
                'student_code': student.student_code,
                'username': student.username,
                'email': student.email,
                'full_name': student.full_name,
                'program_id': student.program_id,
                'semester_id': student.semester_id
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# -----------------------------------------------------
# Course Enrollment Endpoints
# -----------------------------------------------------

@student_bp.route('/api/students/<int:student_id>/courses', methods=['GET'])
def get_enrolled_courses(student_id):
    """Get all courses a student is enrolled in"""
    enrollments = StudentCourse.query.filter_by(student_id=student_id).all()
    return jsonify([{
        'id': e.id,
        'course_id': e.course_id,
        'course_code': e.course.course_code,
        'course_name': e.course.course_name,
        'enrolled_at': e.enrolled_at.isoformat() if e.enrolled_at else None,
        'status': e.status
    } for e in enrollments])


@student_bp.route('/api/students/<int:student_id>/courses/available', methods=['GET'])
def get_available_courses(student_id):
    """Get courses available for enrollment (not already enrolled)"""
    student = Student.query.get_or_404(student_id)
    
    # Get already enrolled course IDs
    enrolled_ids = [e.course_id for e in StudentCourse.query.filter_by(student_id=student_id).all()]
    
    # Get courses matching student's program and semester that are not enrolled
    courses = Course.query.filter(
        Course.program_id == student.program_id,
        Course.semester_id == student.semester_id,
        ~Course.id.in_(enrolled_ids) if enrolled_ids else True
    ).all()
    
    return jsonify([{
        'id': c.id,
        'course_code': c.course_code,
        'course_name': c.course_name,
        'program_id': c.program_id,
        'semester_id': c.semester_id
    } for c in courses])


@student_bp.route('/api/students/<int:student_id>/courses/enroll', methods=['POST'])
def enroll_in_course(student_id):
    """Enroll student in one or more courses"""
    data = request.get_json()
    course_ids = data.get('course_ids', [])
    
    if not course_ids:
        return jsonify({'error': 'No courses specified'}), 400
    
    student = Student.query.get_or_404(student_id)
    enrolled = []
    already_enrolled = []
    
    for course_id in course_ids:
        # Check if already enrolled
        existing = StudentCourse.query.filter_by(
            student_id=student_id, 
            course_id=course_id
        ).first()
        
        if existing:
            already_enrolled.append(course_id)
            continue
        
        # Enroll
        enrollment = StudentCourse(
            student_id=student_id,
            course_id=course_id,
            status='active'
        )
        db.session.add(enrollment)
        enrolled.append(course_id)
    
    db.session.commit()
    
    return jsonify({
        'message': f'Enrolled in {len(enrolled)} course(s)',
        'enrolled': enrolled,
        'already_enrolled': already_enrolled
    })


@student_bp.route('/api/students/<int:student_id>/courses/<int:course_id>', methods=['DELETE'])
def drop_course(student_id, course_id):
    """Drop a course (set status to dropped)"""
    enrollment = StudentCourse.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
    
    if not enrollment:
        return jsonify({'error': 'Enrollment not found'}), 404
    
    enrollment.status = 'dropped'
    db.session.commit()
    
    return jsonify({'message': 'Course dropped successfully'})

@student_bp.route('/api/students/<int:id>', methods=['DELETE'])
def delete(id):
    student = Student.query.get_or_404(id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
