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
        'semester_id': c.semester_id
    } for c in courses])

@course_bp.route('/api/courses', methods=['POST'])
def create():
    data = request.get_json()
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
