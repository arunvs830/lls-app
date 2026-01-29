from flask import Blueprint, jsonify
from models import db, Staff, StaffCourse, Course, Assignment, Submission, Evaluation, StudentCourse, StudyMaterial

admin_report_bp = Blueprint('admin_report', __name__, url_prefix='/api/admin')

@admin_report_bp.route('/staff-report', methods=['GET'])
def get_staff_report():
    """Get report of all staff members with course and grading statistics"""
    staff_list = Staff.query.all()
    
    report = []
    for staff in staff_list:
        # Get courses assigned to this staff
        staff_courses = StaffCourse.query.filter_by(staff_id=staff.id).all()
        course_ids = [sc.course_id for sc in staff_courses]
        courses = Course.query.filter(Course.id.in_(course_ids)).all() if course_ids else []
        
        # Get all assignments for staff's courses
        assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all() if course_ids else []
        assignment_ids = [a.id for a in assignments]
        
        # Get total submissions for these assignments
        total_submissions = Submission.query.filter(Submission.assignment_id.in_(assignment_ids)).count() if assignment_ids else 0
        
        # Get graded submissions (those with evaluations)
        graded_submissions = db.session.query(Submission).join(Evaluation).filter(
            Submission.assignment_id.in_(assignment_ids),
            Evaluation.staff_id == staff.id
        ).count() if assignment_ids else 0
        
        report.append({
            'id': staff.id,
            'staff_code': staff.staff_code,
            'full_name': staff.full_name,
            'email': staff.email,
            'courses_count': len(courses),
            'courses': [{'id': c.id, 'name': c.course_name, 'code': c.course_code} for c in courses],
            'assignments_count': len(assignments),
            'total_submissions': total_submissions,
            'graded_submissions': graded_submissions,
            'pending_submissions': total_submissions - graded_submissions
        })
    
    return jsonify(report)


@admin_report_bp.route('/course-report', methods=['GET'])
def get_course_report():
    """Get report of all courses with enrollment and submission statistics"""
    from flask import request
    from models import AcademicYear
    
    academic_year_id = request.args.get('academic_year_id', type=int)
    program_id = request.args.get('program_id', type=int)
    semester_id = request.args.get('semester_id', type=int)
    
    # Build course query with filters
    course_query = Course.query
    if program_id:
        course_query = course_query.filter_by(program_id=program_id)
    if semester_id:
        course_query = course_query.filter_by(semester_id=semester_id)
    courses = course_query.all()
    
    report = []
    for course in courses:
        # Get enrolled students count
        enrolled_students = StudentCourse.query.filter_by(course_id=course.id, status='active').count()
        
        # Get staff assigned (filter by academic year if provided)
        staff_query = StaffCourse.query.filter_by(course_id=course.id)
        if academic_year_id:
            staff_query = staff_query.filter_by(academic_year_id=academic_year_id)
        staff_courses = staff_query.all()
        
        # Skip courses with no staff assigned if filtering by academic year
        if academic_year_id and not staff_courses:
            continue
            
        staff_ids = [sc.staff_id for sc in staff_courses]
        staff_list = Staff.query.filter(Staff.id.in_(staff_ids)).all() if staff_ids else []
        
        # Get study materials count (via staff_course)
        staff_course_ids = [sc.id for sc in staff_courses]
        materials_count = StudyMaterial.query.filter(StudyMaterial.staff_course_id.in_(staff_course_ids)).count() if staff_course_ids else 0
        
        # Get assignments
        assignments = Assignment.query.filter_by(course_id=course.id).all()
        assignment_ids = [a.id for a in assignments]
        
        # Get submissions stats
        total_submissions = Submission.query.filter(Submission.assignment_id.in_(assignment_ids)).count() if assignment_ids else 0
        graded_submissions = db.session.query(Submission).join(Evaluation).filter(
            Submission.assignment_id.in_(assignment_ids)
        ).count() if assignment_ids else 0
        
        # Build staff details with their academic years
        staff_details = []
        for sc in staff_courses:
            staff = Staff.query.get(sc.staff_id)
            ay = AcademicYear.query.get(sc.academic_year_id) if sc.academic_year_id else None
            if staff:
                staff_details.append({
                    'id': staff.id,
                    'name': staff.full_name,
                    'academic_year': ay.year_name if ay else 'N/A'
                })
        
        report.append({
            'id': course.id,
            'course_code': course.course_code,
            'course_name': course.course_name,
            'program': course.program.program_name if course.program else 'N/A',
            'semester': course.semester.semester_name if course.semester else 'N/A',
            'enrolled_students': enrolled_students,
            'staff': staff_details,
            'staff_count': len(staff_list),
            'materials_count': materials_count,
            'assignments_count': len(assignments),
            'total_submissions': total_submissions,
            'graded_submissions': graded_submissions,
            'pending_submissions': total_submissions - graded_submissions
        })
    
    return jsonify(report)

