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
    staff_id = request.args.get('staff_id')
    include_course = request.args.get('include_course') == 'true'
    
    query = StaffCourse.query
    if staff_id:
        query = query.filter_by(staff_id=int(staff_id))
    
    allocations = query.all()
    
    response = []
    for a in allocations:
        data = {
            'id': a.id,
            'staff_id': a.staff_id,
            'course_id': a.course_id,
            'academic_year_id': a.academic_year_id,
            'assigned_date': a.assigned_date.isoformat() if a.assigned_date else None
        }
        
        if include_course and a.course:
            data['course_name'] = a.course.course_name
            data['course_code'] = a.course.course_code
            
        response.append(data)
        
    return jsonify(response)

@staff_course_bp.route('/api/staff-courses', methods=['POST'])
def create():
    data = request.get_json()
    
    if not data or not data.get('staff_id') or not data.get('course_id'):
        return jsonify({'error': 'Staff ID and Course ID are required'}), 400
        
    # Check for duplicate allocation
    existing = StaffCourse.query.filter_by(
        staff_id=data['staff_id'],
        course_id=data['course_id'],
        academic_year_id=data.get('academic_year_id')
    ).first()
    
    if existing:
        return jsonify({'error': 'This course is already assigned to this staff member for the selected academic year'}), 400

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
