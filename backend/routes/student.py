from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, Student
from datetime import datetime

student_bp = Blueprint('student', __name__)

def parse_date(date_str):
    if not date_str:
        return None
    return datetime.strptime(date_str, '%Y-%m-%d').date()

@student_bp.route('/api/students', methods=['GET'])
def get_all():
    students = Student.query.all()
    return jsonify([{
        'id': s.id,
        'student_code': s.student_code,
        'username': s.username,
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
        username=data['username'],
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

@student_bp.route('/api/students/<int:id>', methods=['DELETE'])
def delete(id):
    student = Student.query.get_or_404(id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
