from flask import Blueprint, request, jsonify
from models import db, StaffCourse
from datetime import datetime

staff_course_bp = Blueprint('staff_course', __name__)

def parse_date(date_str):
    if not date_str:
        return None
    return datetime.strptime(date_str, '%Y-%m-%d').date()

@staff_course_bp.route('/api/staff-courses', methods=['GET'])
def get_all():
    allocations = StaffCourse.query.all()
    return jsonify([{
        'id': a.id,
        'staff_id': a.staff_id,
        'course_id': a.course_id,
        'academic_year_id': a.academic_year_id,
        'assigned_date': a.assigned_date.isoformat() if a.assigned_date else None
    } for a in allocations])

@staff_course_bp.route('/api/staff-courses', methods=['POST'])
def create():
    data = request.get_json()
    allocation = StaffCourse(
        staff_id=data['staff_id'],
        course_id=data['course_id'],
        academic_year_id=data.get('academic_year_id'),
        assigned_date=parse_date(data.get('assigned_date'))
    )
    db.session.add(allocation)
    db.session.commit()
    return jsonify({'id': allocation.id, 'message': 'Created successfully'}), 201

@staff_course_bp.route('/api/staff-courses/<int:id>', methods=['DELETE'])
def delete(id):
    allocation = StaffCourse.query.get_or_404(id)
    db.session.delete(allocation)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
