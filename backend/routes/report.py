from flask import Blueprint, request, jsonify
from models import db, Student, Course, StaffCourse, Assignment, Submission, Evaluation, MCQ, MCQAttempt, Result
from sqlalchemy import func
from datetime import datetime

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/api/reports/staff/<int:staff_id>', methods=['GET'])
def get_staff_reports(staff_id):
    course_id = request.args.get('course_id')
    
    try:
        # Get courses assigned to staff
        query = StaffCourse.query.filter_by(staff_id=staff_id)
        if course_id:
            query = query.filter_by(course_id=int(course_id))
            
        staff_courses = query.all()
        course_ids = [sc.course_id for sc in staff_courses]
        
        if not course_ids:
            return jsonify([]), 200

        # Get students enrolled in these courses
        # We need to manually join StudentCourse because it's M2M via a model
        # Assuming Student has 'enrolled_courses' relationship
        
        # Determine total assignments and MCQs per course
        course_metrics = {}
        for cid in course_ids:
            total_assignments = Assignment.query.filter_by(course_id=cid).count()
            total_mcqs = MCQ.query.filter_by(course_id=cid).count()
            max_assignment_marks = db.session.query(func.sum(Assignment.max_marks)).filter(Assignment.course_id == cid).scalar() or 0
            # Assuming 1 mark per MCQ for simplicity if not specified, or sum marks
            max_mcq_marks = db.session.query(func.sum(MCQ.marks)).filter(MCQ.course_id == cid).scalar() or 0
            
            course_metrics[cid] = {
                'total_items': total_assignments + total_mcqs, # Simplified item count
                'total_assignments': total_assignments,
                'total_mcqs': total_mcqs,
                'max_score': float(max_assignment_marks) + float(max_mcq_marks)
            }

        student_reports = []
        
        # Get all relevant students
        # Join StudentCourse to filter by course_ids
        from models import StudentCourse
        enrollments = StudentCourse.query.filter(StudentCourse.course_id.in_(course_ids), StudentCourse.status == 'active').all()
        
        # Process each enrollment (Student + Course Context)
        for enrollment in enrollments:
            sid = enrollment.student_id
            cid = enrollment.course_id
            student = enrollment.student
            course = enrollment.course
            metrics = course_metrics.get(cid, {})
            
            # --- Completion Progress ---
            # Submitted Assignments
            submitted_assigns = Submission.query.join(Assignment).filter(
                Assignment.course_id == cid, 
                Submission.student_id == sid
            ).count()
            
            # Attempted MCQs (Unique MCQs attempted)
            attempted_mcqs = MCQAttempt.query.join(MCQ).filter(
                MCQ.course_id == cid,
                MCQAttempt.student_id == sid
            ).distinct(MCQAttempt.mcq_id).count() 
            
            completed_items = submitted_assigns + attempted_mcqs
            total_items = metrics.get('total_items', 1) # Avoid div by 0
            if total_items == 0: total_items = 1
            
            percent_completed = min(100, round((completed_items / total_items) * 100, 1))
            
            # --- Missed Deadlines ---
            # Assignments with due_date < now AND no submission
            missed_assignments = Assignment.query.outerjoin(
                Submission, 
                (Submission.assignment_id == Assignment.id) & (Submission.student_id == sid)
            ).filter(
                Assignment.course_id == cid,
                Assignment.due_date < datetime.utcnow(),
                Submission.id == None # No submission found
            ).count()
            
            # --- Marks / Performance ---
            # Get Student's result for this course if exists, or calculate on fly
            # Calculating raw marks for now
            
            # Assignment Marks
            assign_marks = db.session.query(func.sum(Evaluation.marks_obtained)).join(Submission).join(Assignment).filter(
                Assignment.course_id == cid,
                Submission.student_id == sid
            ).scalar() or 0
            
            # MCQ Marks
            # Sum marks of correct attempts (assuming best attempt or latest? Taking sum of unique correct per question simplistically)
            # A more robust logic might be needed for multiple attempts, but for now:
            # Get distinct correct attempts
            correct_mcqs = MCQAttempt.query.join(MCQ).filter(
                MCQ.course_id == cid,
                MCQAttempt.student_id == sid,
                MCQAttempt.is_correct == True
            ).distinct(MCQAttempt.mcq_id).all()
            
            mcq_marks = sum([attempt.mcq.marks for attempt in correct_mcqs])
            
            total_obtained = float(assign_marks) + float(mcq_marks)
            max_possible = metrics.get('max_score', 0)
            
            if max_possible > 0:
                percent_marks = round((total_obtained / max_possible) * 100, 1)
            else:
                percent_marks = 0
                
            student_reports.append({
                'student_id': sid,
                'student_name': student.full_name,
                'student_code': student.student_code,
                'course_id': cid,
                'course_name': course.course_name,
                'course_code': course.course_code,
                'percent_completed': percent_completed,
                'percent_left': 100 - percent_completed,
                'missed_deadlines': missed_assignments,
                'marks_obtained': total_obtained,
                'max_marks': max_possible,
                'percent_marks': percent_marks
            })

        return jsonify(student_reports), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
