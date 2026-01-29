import os
import sys
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models import db, Submission, Assignment, Evaluation, Student
from datetime import datetime
from sqlalchemy.orm import joinedload

# Add parent directory to path to import services
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.notification_service import NotificationService

submission_bp = Blueprint('submission', __name__)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@submission_bp.route('/api/submissions', methods=['POST'])
def create():
    # Handle multipart form data
    assignment_id = request.form.get('assignment_id')
    student_id = request.form.get('student_id')
    submission_text = request.form.get('submission_text')
    
    if not assignment_id or not student_id:
        return jsonify({'error': 'Missing assignment_id or student_id'}), 400
        
    # Check if assignment exists and is not overdue
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
        
    if assignment.due_date and datetime.utcnow() > assignment.due_date:
        return jsonify({'error': 'Assignment is overdue. Late submissions are not accepted.'}), 400
        
    # Check if already submitted
    existing = Submission.query.filter_by(assignment_id=assignment_id, student_id=student_id).first()
    if existing:
        return jsonify({'error': 'Assignment already submitted'}), 400

    file_path = None
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"submission_{assignment_id}_{student_id}_{datetime.now().timestamp()}_{file.filename}")
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            file_path = f"/api/submissions/download/{filename}"
    
    submission = Submission(
        assignment_id=assignment_id,
        student_id=student_id,
        submission_text=submission_text,
        file_path=file_path,
        status='submitted'
    )
    db.session.add(submission)
    db.session.commit()
    
    # Send notification for successful submission
    try:
        NotificationService.notify_assignment_submitted(submission)
    except Exception as e:
        print(f"Error sending submission notification: {e}")
    
    return jsonify({'id': submission.id, 'message': 'Submitted successfully'}), 201

@submission_bp.route('/api/submissions', methods=['GET'])
def get_all():
    assignment_id = request.args.get('assignment_id')
    student_id = request.args.get('student_id')
    staff_id = request.args.get('staff_id')
    course_id = request.args.get('course_id')
    
    query = Submission.query.options(
        joinedload(Submission.evaluation),
        joinedload(Submission.assignment).joinedload(Assignment.course),
        joinedload(Submission.student),
    )
    if assignment_id:
        query = query.filter_by(assignment_id=assignment_id)
    if student_id:
        query = query.filter_by(student_id=student_id)

    # Optional staff/course filtering (used by staff UI)
    if staff_id or course_id:
        query = query.join(Assignment, Submission.assignment_id == Assignment.id)
        if staff_id:
            query = query.filter(Assignment.staff_id == int(staff_id))
        if course_id:
            query = query.filter(Assignment.course_id == int(course_id))
        
    submissions = query.all()
    return jsonify([{
        'id': s.id,
        'assignment_id': s.assignment_id,
        'student_id': s.student_id,
        'student': {
            'id': s.student.id,
            'student_code': s.student.student_code,
            'full_name': s.student.full_name,
            'username': s.student.username,
        } if getattr(s, 'student', None) else None,
        'assignment': {
            'id': s.assignment.id,
            'title': s.assignment.title,
            'course_id': s.assignment.course_id,
        } if getattr(s, 'assignment', None) else None,
        'course': {
            'id': s.assignment.course.id,
            'course_code': s.assignment.course.course_code,
            'course_name': s.assignment.course.course_name,
        } if getattr(s, 'assignment', None) and getattr(s.assignment, 'course', None) else None,
        'submission_text': s.submission_text,
        'file_path': s.file_path,
        'submitted_at': s.submitted_at.isoformat(),
        'status': s.status,
        'evaluation': {
            'marks_obtained': float(s.evaluation.marks_obtained) if s.evaluation and s.evaluation.marks_obtained else None,
            'feedback': s.evaluation.feedback if s.evaluation else None
        } if s.evaluation else None
    } for s in submissions])

@submission_bp.route('/api/submissions/download/<filename>')
def download_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@submission_bp.route('/api/submissions/<int:id>/evaluate', methods=['POST'])
def evaluate(id):
    submission = Submission.query.get_or_404(id)
    data = request.get_json()
    
    evaluation = Evaluation.query.filter_by(submission_id=id).first()
    if not evaluation:
        evaluation = Evaluation(submission_id=id)
        db.session.add(evaluation)
        
    evaluation.staff_id = data.get('staff_id')
    evaluation.marks_obtained = data.get('marks_obtained')
    evaluation.feedback = data.get('feedback')
    evaluation.evaluated_at = datetime.utcnow()
    
    submission.status = 'evaluated'
    db.session.commit()
    
    # Send notification for graded assignment
    try:
        NotificationService.notify_assignment_graded(evaluation)
    except Exception as e:
        print(f"Error sending evaluation notification: {e}")
    
    return jsonify({'message': 'Evaluated successfully'})

@submission_bp.route('/api/submissions/pending-count/<int:staff_id>', methods=['GET'])
def get_pending_count(staff_id):
    """Get count of pending submissions for a staff member"""
    try:
        count = Submission.query.join(Assignment).filter(
            Assignment.staff_id == staff_id,
            Submission.status != 'evaluated'
        ).count()
        return jsonify({'pending_count': count}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
