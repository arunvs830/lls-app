from flask import Blueprint, jsonify
from models import db, Student, Course, StudentCourse, StaffCourse, StudyMaterial, Assignment, Submission, Result, MCQ
from datetime import datetime, timezone

student_dashboard_bp = Blueprint('student_dashboard', __name__)

def serialize_material(m):
    """Serialize a study material for the API response"""
    # Count MCQs linked to this material
    mcq_count = MCQ.query.filter_by(study_material_id=m.id).count()
    
    return {
        'id': m.id,
        'title': m.title,
        'description': m.description,
        'file_path': m.file_path,
        'file_type': m.file_type,
        'thumbnail_path': m.thumbnail_path,
        'upload_date': m.upload_date.isoformat() if m.upload_date else None,
        'mcq_count': mcq_count,
        'children': [serialize_material(c) for c in m.children]
    }


@student_dashboard_bp.route('/api/student/<int:student_id>/dashboard', methods=['GET'])
def get_dashboard(student_id):
    """Get dashboard statistics for a student"""
    student = Student.query.get_or_404(student_id)
    
    # Get courses for student's program and semester
    # Get enrolled courses
    courses = Course.query.join(StudentCourse).filter(
        StudentCourse.student_id == student_id,
        StudentCourse.status == 'active'
    ).all()
    
    # Get all assignments for these courses
    course_ids = [c.id for c in courses]
    assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all()
    
    # Get student's submissions
    submissions = Submission.query.filter_by(student_id=student_id).all()
    submitted_assignment_ids = [s.assignment_id for s in submissions]
    
    # Calculate pending vs completed
    pending = [a for a in assignments if a.id not in submitted_assignment_ids and a.due_date]
    
    # Sort pending by due_date
    pending.sort(key=lambda x: x.due_date)

    # Filter for strictly upcoming assignments (future due date)
    now = datetime.utcnow()
    upcoming_pending = [a for a in pending if a.due_date and a.due_date.replace(tzinfo=None) > now]
    
    # Serialize upcoming assignments (next 5)
    upcoming_data = []
    for a in upcoming_pending[:5]:
        upcoming_data.append({
            'id': a.id,
            'title': a.title,
            'due_date': a.due_date.isoformat() if a.due_date else None,
            'course_name': a.course.course_name if a.course else 'Unknown Course',
            'course_id': a.course_id
        })

    return jsonify({
        'student': {
            'id': student.id,
            'full_name': student.full_name,
            'student_code': student.student_code,
            'program': student.program.program_name if student.program else None,
            'semester': student.semester.semester_name if student.semester else None
        },
        'stats': {
            'enrolled_courses': len(courses),
            'pending_assignments': len(upcoming_pending),
            'completed_assignments': len(submissions),
            'total_assignments': len(assignments)
        },
        'upcoming_assignments': upcoming_data
    })

@student_dashboard_bp.route('/api/student/<int:student_id>/courses', methods=['GET'])
def get_courses(student_id):
    """Get enrolled courses for a student based on their program and semester"""
    student = Student.query.get_or_404(student_id)
    
    # Get courses for student's program and semester
    # Get enrolled courses
    courses = Course.query.join(StudentCourse).filter(
        StudentCourse.student_id == student_id,
        StudentCourse.status == 'active'
    ).all()
    
    result = []
    for course in courses:
        # Get staff course to access materials
        staff_course = StaffCourse.query.filter_by(course_id=course.id).first()
        materials_count = 0
        if staff_course:
            materials_count = StudyMaterial.query.filter_by(
                staff_course_id=staff_course.id,
                parent_id=None
            ).count()
        
        # Get assignments count
        assignments_count = Assignment.query.filter_by(course_id=course.id).count()
        
        result.append({
            'id': course.id,
            'course_code': course.course_code,
            'course_name': course.course_name,
            'materials_count': materials_count,
            'assignments_count': assignments_count,
            'staff_course_id': staff_course.id if staff_course else None
        })
    
    return jsonify(result)

@student_dashboard_bp.route('/api/student/<int:student_id>/courses/<int:course_id>/materials', methods=['GET'])
def get_course_materials(student_id, course_id):
    """Get study materials for a specific course"""
    student = Student.query.get_or_404(student_id)
    course = Course.query.get_or_404(course_id)
    
    # Verify student has access to this course
    if course.program_id != student.program_id or course.semester_id != student.semester_id:
        return jsonify({'error': 'Access denied to this course'}), 403
    
    # Get staff course
    staff_course = StaffCourse.query.filter_by(course_id=course_id).first()
    if not staff_course:
        return jsonify([])
    
    # Get root-level materials (no parent)
    materials = StudyMaterial.query.filter_by(
        staff_course_id=staff_course.id,
        parent_id=None
    ).order_by(StudyMaterial.upload_date.desc()).all()
    
    return jsonify({
        'course': {
            'id': course.id,
            'course_code': course.course_code,
            'course_name': course.course_name
        },
        'materials': [serialize_material(m) for m in materials]
    })

@student_dashboard_bp.route('/api/student/<int:student_id>/results', methods=['GET'])
def get_results(student_id):
    """Get all results for a student"""
    student = Student.query.get_or_404(student_id)
    
    results = Result.query.filter_by(student_id=student_id).all()
    
    result_list = []
    for r in results:
        result_list.append({
            'id': r.id,
            'course': {
                'id': r.course.id,
                'course_code': r.course.course_code,
                'course_name': r.course.course_name
            } if r.course else None,
            'semester': {
                'id': r.semester.id,
                'semester_name': r.semester.semester_name
            } if r.semester else None,
            'assignment_marks': float(r.assignment_marks) if r.assignment_marks else None,
            'mcq_marks': float(r.mcq_marks) if r.mcq_marks else None,
            'total_marks': float(r.total_marks) if r.total_marks else None,
            'grade': r.grade
        })
    
    return jsonify({
        'student': {
            'id': student.id,
            'full_name': student.full_name,
            'student_code': student.student_code
        },
        'results': result_list
    })
