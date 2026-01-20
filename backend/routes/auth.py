from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from models import db, Admin, Staff, Student

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint for admin, staff, and student
    Expects: { "email": "...", "password": "...", "role": "admin|staff|student" }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', '').lower()
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    if not role:
        return jsonify({"error": "Role is required (admin, staff, or student)"}), 400
    
    user = None
    user_data = None
    
    if role == 'admin':
        user = Admin.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": "admin"
            }
    
    elif role == 'staff':
        user = Staff.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            user_data = {
                "id": user.id,
                "staff_code": user.staff_code,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": "staff"
            }
    
    elif role == 'student':
        user = Student.query.filter_by(email=email).first()
        # Ensure student is found AND password matches correctly
        if user and check_password_hash(user.password_hash, password):
            user_data = {
                "id": user.id,
                "student_code": user.student_code,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "program_id": user.program_id,
                "semester_id": user.semester_id,
                "role": "student"
            }
    
    else:
        return jsonify({"error": "Invalid role. Must be admin, staff, or student"}), 400
    
    if user_data:
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": user_data
        }), 200
    else:
        return jsonify({
            "success": False,
            "error": "Invalid email or password"
        }), 401
