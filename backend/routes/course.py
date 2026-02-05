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

    try:
        course = Course(
            course_code=data['course_code'],
            course_name=data['course_name'],
            program_id=data.get('program_id'),
            semester_id=data.get('semester_id')
        )
        db.session.add(course)
        db.session.flush() # Get ID without committing

        # If staff_id is provided, auto-assign
        staff_id = data.get('staff_id')
        academic_year_id = data.get('academic_year_id')
        
        if staff_id:
            if not academic_year_id:
                db.session.rollback()
                return jsonify({'error': 'academic_year_id is required when creating as staff'}), 400
                
            from models import StaffCourse
            from datetime import datetime
            
            staff_course = StaffCourse(
                staff_id=staff_id,
                course_id=course.id,
                academic_year_id=academic_year_id,
                assigned_date=datetime.now().date()
            )
            db.session.add(staff_course)
            
        db.session.commit()
        return jsonify({'id': course.id, 'message': 'Created successfully'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@course_bp.route('/api/courses/<int:id>', methods=['DELETE'])
def delete(id):
    course = Course.query.get_or_404(id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
