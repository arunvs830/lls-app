from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, Staff

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/api/staff', methods=['GET'])
def get_all():
    staff_list = Staff.query.all()
    return jsonify([{
        'id': s.id,
        'staff_code': s.staff_code,
        'username': s.username,
        'email': s.email,
        'full_name': s.full_name
    } for s in staff_list])

@staff_bp.route('/api/staff', methods=['POST'])
def create():
    data = request.get_json()
    staff = Staff(
        staff_code=data['staff_code'],
        username=data['username'],
        email=data['email'],
        full_name=data['full_name'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(staff)
    db.session.commit()
    return jsonify({'id': staff.id, 'message': 'Created successfully'}), 201

@staff_bp.route('/api/staff/<int:id>', methods=['DELETE'])
def delete(id):
    staff = Staff.query.get_or_404(id)
    db.session.delete(staff)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
