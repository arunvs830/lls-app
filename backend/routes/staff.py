from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import db, Staff

staff_bp = Blueprint('staff', __name__)

def generate_staff_code():
    """Generate a unique staff code like ST001, ST002, etc."""
    last_staff = Staff.query.order_by(Staff.id.desc()).first()
    if last_staff and last_staff.staff_code:
        try:
            # Extract number from last staff code (e.g., ST001 -> 1)
            last_num = int(last_staff.staff_code.replace('ST', ''))
            return f"ST{str(last_num + 1).zfill(3)}"
        except:
            pass
    return f"ST{str(Staff.query.count() + 1).zfill(3)}"

@staff_bp.route('/api/staff', methods=['GET'])
def get_all():
    staff_list = Staff.query.all()
    return jsonify([{
        'id': s.id,
        'staff_code': s.staff_code,
        'email': s.email,
        'full_name': s.full_name
    } for s in staff_list])

@staff_bp.route('/api/staff', methods=['POST'])
def create():
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('email') or not data.get('full_name') or not data.get('password'):
        return jsonify({'error': 'Email, full name, and password are required'}), 400
    
    # Use email as username
    email = data['email']
    username = email  # Use email as username
    
    # Check if email already exists
    if Staff.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    staff = Staff(
        staff_code=generate_staff_code(),  # Auto-generate staff code
        username=username,
        email=email,
        full_name=data['full_name'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(staff)
    db.session.commit()
    return jsonify({'id': staff.id, 'staff_code': staff.staff_code, 'message': 'Created successfully'}), 201

@staff_bp.route('/api/staff/<int:id>', methods=['DELETE'])
def delete(id):
    staff = Staff.query.get_or_404(id)
    db.session.delete(staff)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
