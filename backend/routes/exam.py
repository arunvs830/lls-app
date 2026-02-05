from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models import db, StudentExam, StudentCourse, Student, Course, StaffCourse
import os

exam_bp = Blueprint('exam', __name__)

UPLOAD_FOLDER = 'uploads/exams'

def ensure_upload_folder():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

@exam_bp.route('/api/exams/course/<int:course_id>/students', methods=['GET'])
def get_course_students_with_exams(course_id):
    """
    Get all students enrolled in a course with their exam data (CCA1/CCA2).
    Falls back to students with matching program_id and semester_id if no enrollments.
    """
    staff_id = request.args.get('staff_id', type=int)
    print(f"DEBUG: fetching students for course {course_id}")
    
    # Get course info
    course = Course.query.get_or_404(course_id)
    
    # First try: Get students enrolled via StudentCourse
    enrollments = StudentCourse.query.filter_by(course_id=course_id, status='active').all()
    
    if enrollments:
        # Use enrolled students
        student_ids = [e.student_id for e in enrollments]
        students = Student.query.filter(Student.id.in_(student_ids)).all()
    else:
        # Fallback: Get students with matching program_id and semester_id
        students = Student.query.filter(
            Student.program_id == course.program_id,
            Student.semester_id == course.semester_id
        ).all()
    
    students_data = []
    for student in students:
        
        # Get exam record if exists
        exam = StudentExam.query.filter_by(
            student_id=student.id,
            course_id=course_id
        ).first()
        
        students_data.append({
            'id': student.id,
            'student_code': student.student_code,
            'full_name': student.full_name,
            'email': student.email,
            'exam': {
                'id': exam.id if exam else None,
                'cca1_marks': float(exam.cca1_marks) if exam and exam.cca1_marks else None,
                'cca1_file_path': exam.cca1_file_path if exam else None,
                'cca2_marks': float(exam.cca2_marks) if exam and exam.cca2_marks else None,
                'cca2_file_path': exam.cca2_file_path if exam else None,
            } if exam else None
        })
    
    return jsonify(students_data)

@exam_bp.route('/api/exams/student/<int:student_id>/course/<int:course_id>', methods=['GET'])
def get_student_exam(student_id, course_id):
    """
    Get a single student's exam record for a course.
    """
    exam = StudentExam.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
    
    student = Student.query.get_or_404(student_id)
    course = Course.query.get_or_404(course_id)
    
    return jsonify({
        'student': {
            'id': student.id,
            'student_code': student.student_code,
            'full_name': student.full_name,
            'email': student.email
        },
        'course': {
            'id': course.id,
            'course_code': course.course_code,
            'course_name': course.course_name
        },
        'exam': {
            'id': exam.id if exam else None,
            'cca1_marks': float(exam.cca1_marks) if exam and exam.cca1_marks else None,
            'cca1_file_path': exam.cca1_file_path if exam else None,
            'cca2_marks': float(exam.cca2_marks) if exam and exam.cca2_marks else None,
            'cca2_file_path': exam.cca2_file_path if exam else None,
        } if exam else None
    })

@exam_bp.route('/api/exams', methods=['POST'])
def save_exam():
    """
    Create or update exam record with CCA1/CCA2 files and marks.
    Expects form data with:
    - student_id
    - course_id
    - staff_id
    - cca1_marks (optional)
    - cca2_marks (optional)
    - cca1_file (optional file)
    - cca2_file (optional file)
    """
    ensure_upload_folder()
    
    student_id = request.form.get('student_id', type=int)
    course_id = request.form.get('course_id', type=int)
    staff_id = request.form.get('staff_id', type=int)
    cca1_marks = request.form.get('cca1_marks', type=float)
    cca2_marks = request.form.get('cca2_marks', type=float)
    
    if not student_id or not course_id:
        return jsonify({'error': 'student_id and course_id are required'}), 400
    
    # Find or create exam record
    exam = StudentExam.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()
    
    if not exam:
        exam = StudentExam(
            student_id=student_id,
            course_id=course_id,
            staff_id=staff_id
        )
        db.session.add(exam)
    else:
        if staff_id:
            exam.staff_id = staff_id
    
    # Update marks
    if cca1_marks is not None:
        exam.cca1_marks = cca1_marks
    if cca2_marks is not None:
        exam.cca2_marks = cca2_marks
    
    # Handle file uploads
    if 'cca1_file' in request.files:
        file = request.files['cca1_file']
        if file and file.filename:
            filename = secure_filename(f"cca1_{student_id}_{course_id}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            exam.cca1_file_path = filepath
    
    if 'cca2_file' in request.files:
        file = request.files['cca2_file']
        if file and file.filename:
            filename = secure_filename(f"cca2_{student_id}_{course_id}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            exam.cca2_file_path = filepath
    
    try:
        db.session.commit()
        return jsonify({
            'id': exam.id,
            'message': 'Exam record saved successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@exam_bp.route('/api/exams/<int:exam_id>', methods=['DELETE'])
def delete_exam(exam_id):
    """Delete an exam record."""
    exam = StudentExam.query.get_or_404(exam_id)
    
    # Delete associated files
    if exam.cca1_file_path and os.path.exists(exam.cca1_file_path):
        os.remove(exam.cca1_file_path)
    if exam.cca2_file_path and os.path.exists(exam.cca2_file_path):
        os.remove(exam.cca2_file_path)
    
    db.session.delete(exam)
    db.session.commit()
    
    return jsonify({'message': 'Exam record deleted successfully'})
