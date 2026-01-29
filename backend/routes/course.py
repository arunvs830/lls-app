from flask import Blueprint, request, jsonify
from models import db, Course

course_bp = Blueprint('course', __name__)

@course_bp.route('/api/courses', methods=['GET'])
def get_all():
    courses = Course.query.all()
    return jsonify([{
        'id': c.id,
        'course_code': c.course_code,
        'course_name': c.course_name,
        'program_id': c.program_id,
        'program_name': c.program.program_name if c.program else None,
        'program_code': c.program.program_code if c.program else None,
        'semester_id': c.semester_id,
        'semester_name': c.semester.semester_name if c.semester else None
    } for c in courses])

@course_bp.route('/api/courses', methods=['POST'])
def create():
    data = request.get_json()
    
    if not data or not data.get('course_code') or not data.get('course_name'):
        return jsonify({'error': 'Course code and name are required'}), 400
        
    if Course.query.filter_by(course_code=data['course_code']).first():
        return jsonify({'error': 'Course code already exists'}), 400

    course = Course(
        course_code=data['course_code'],
        course_name=data['course_name'],
        program_id=data.get('program_id'),
        semester_id=data.get('semester_id')
    )
    db.session.add(course)
    db.session.commit()
    return jsonify({'id': course.id, 'message': 'Created successfully'}), 201

@course_bp.route('/api/courses/<int:id>', methods=['DELETE'])
def delete(id):
    course = Course.query.get_or_404(id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
