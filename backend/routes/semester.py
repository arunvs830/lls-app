from flask import Blueprint, request, jsonify
from models import db, Semester

semester_bp = Blueprint('semester', __name__)

@semester_bp.route('/api/semesters', methods=['GET'])
def get_all():
    semesters = Semester.query.all()
    return jsonify([{
        'id': s.id,
        'semester_name': s.semester_name,
        'semester_number': s.semester_number
    } for s in semesters])

@semester_bp.route('/api/semesters', methods=['POST'])
def create():
    data = request.get_json()
    semester = Semester(
        semester_name=data['semester_name'],
        semester_number=data['semester_number']
    )
    db.session.add(semester)
    db.session.commit()
    return jsonify({'id': semester.id, 'message': 'Created successfully'}), 201

@semester_bp.route('/api/semesters/<int:id>', methods=['DELETE'])
def delete(id):
    semester = Semester.query.get_or_404(id)
    db.session.delete(semester)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
