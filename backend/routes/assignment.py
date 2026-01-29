import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models import db, Assignment, Student, Course, StudentCourse
from services.notification_service import NotificationService
from datetime import datetime, timezone

assignment_bp = Blueprint('assignment', __name__)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'ppt', 'pptx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_datetime(dt_str):
    if not dt_str:
        return None
    try:
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        # Convert to UTC and remove tzinfo to make it naive (compatible with datetime.utcnow())
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    except:
        return datetime.strptime(dt_str, '%Y-%m-%dT%H:%M')

@assignment_bp.route('/api/assignments', methods=['GET'])
def get_all():
    course_id = request.args.get('course_id')
    staff_id = request.args.get('staff_id')
    study_material_id = request.args.get('study_material_id')
    
    query = Assignment.query
    if course_id:
        query = query.filter_by(course_id=int(course_id))
    if staff_id:
        query = query.filter_by(staff_id=int(staff_id))
    if study_material_id:
        query = query.filter_by(study_material_id=int(study_material_id))

    student_id = request.args.get('student_id')
    if student_id:
        # Filter assignments for courses the student is explicitly enrolled in
        enrollments = StudentCourse.query.filter_by(student_id=int(student_id), status='active').all()
        enrolled_course_ids = [e.course_id for e in enrollments]
        
        if enrolled_course_ids:
            query = query.filter(Assignment.course_id.in_(enrolled_course_ids))
        else:
            # No active enrollments, so no assignments
            return jsonify([])
    
    assignments = query.all()
    return jsonify([{
        'id': a.id,
        'title': a.title,
        'description': a.description,
        'course_id': a.course_id,
        'staff_id': a.staff_id,
        'study_material_id': a.study_material_id,
        'due_date': a.due_date.isoformat() if a.due_date else None,
        'max_marks': float(a.max_marks) if a.max_marks else None,
        'file_path': a.file_path,
        'created_at': a.created_at.isoformat() if a.created_at else None
    } for a in assignments])

@assignment_bp.route('/api/assignments', methods=['POST'])
def create():
    # Handle multipart form data
    title = request.form.get('title')
    description = request.form.get('description')
    course_id = request.form.get('course_id')
    staff_id = request.form.get('staff_id')
    study_material_id = request.form.get('study_material_id')
    due_date = parse_datetime(request.form.get('due_date'))
    max_marks = request.form.get('max_marks')
    
    file_path = None
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"assignment_{datetime.now().timestamp()}_{file.filename}")
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            file_path = f"/api/assignments/download/{filename}"
    
    assignment = Assignment(
        title=title,
        description=description,
        course_id=course_id,
        staff_id=staff_id,
        study_material_id=study_material_id,
        due_date=due_date,
        max_marks=max_marks,
        file_path=file_path
    )
    db.session.add(assignment)
    db.session.commit()
    
    # Notify students about new assignment
    try:
        NotificationService.notify_new_assignment(assignment)
    except Exception as e:
        current_app.logger.error(f"Failed to send assignment notifications: {str(e)}")
        
    return jsonify({'id': assignment.id, 'message': 'Created successfully'}), 201

@assignment_bp.route('/api/assignments/<int:id>', methods=['GET'])
def get_one(id):
    assignment = Assignment.query.get_or_404(id)
    return jsonify({
        'id': assignment.id,
        'title': assignment.title,
        'description': assignment.description,
        'course_id': assignment.course_id,
        'staff_id': assignment.staff_id,
        'due_date': assignment.due_date.isoformat() if assignment.due_date else None,
        'max_marks': float(assignment.max_marks) if assignment.max_marks else None,
        'file_path': assignment.file_path
    })

@assignment_bp.route('/api/assignments/download/<filename>')
def download_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@assignment_bp.route('/api/assignments/<int:id>', methods=['PUT'])
def update(id):
    assignment = Assignment.query.get_or_404(id)
    
    # Handle potential multipart or JSON
    if request.content_type.startswith('multipart/form-data'):
        assignment.title = request.form.get('title', assignment.title)
        assignment.description = request.form.get('description', assignment.description)
        if request.form.get('due_date'):
            assignment.due_date = parse_datetime(request.form.get('due_date'))
        assignment.max_marks = request.form.get('max_marks', assignment.max_marks)
        
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_file(file.filename):
                filename = secure_filename(f"assignment_{datetime.now().timestamp()}_{file.filename}")
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                assignment.file_path = f"/api/assignments/download/{filename}"
    else:
        data = request.get_json()
        assignment.title = data.get('title', assignment.title)
        assignment.description = data.get('description', assignment.description)
        if data.get('due_date'):
            assignment.due_date = parse_datetime(data.get('due_date'))
        assignment.max_marks = data.get('max_marks', assignment.max_marks)
    
    db.session.commit()
    return jsonify({'message': 'Updated successfully'})

@assignment_bp.route('/api/assignments/<int:id>', methods=['DELETE'])
def delete(id):
    assignment = Assignment.query.get_or_404(id)
    db.session.delete(assignment)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
