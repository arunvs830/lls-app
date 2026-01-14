from flask import Blueprint, request, jsonify
from models import db, MCQ, MCQAttempt, Course, Student
from datetime import datetime

mcq_bp = Blueprint('mcq', __name__)

def serialize_mcq(m, include_answer=True):
    """Serialize MCQ - optionally hide correct answer for students"""
    data = {
        'id': m.id,
        'question_text': m.question_text,
        'option_a': m.option_a,
        'option_b': m.option_b,
        'option_c': m.option_c,
        'option_d': m.option_d,
        'marks': float(m.marks) if m.marks else 1.0,
        'course_id': m.course_id,
        'course_name': m.course.course_name if m.course else None,
        'staff_id': m.staff_id,
        'study_material_id': m.study_material_id,
        'created_at': m.created_at.isoformat() if m.created_at else None
    }
    if include_answer:
        data['correct_answer'] = m.correct_answer
    return data

# ----------------------
# Staff CRUD Operations
# ----------------------

@mcq_bp.route('/api/mcqs', methods=['GET'])
def get_all():
    """Get all MCQs with optional filters"""
    course_id = request.args.get('course_id')
    staff_id = request.args.get('staff_id')
    
    query = MCQ.query
    if course_id:
        query = query.filter_by(course_id=course_id)
    if staff_id:
        query = query.filter_by(staff_id=staff_id)
    
    mcqs = query.order_by(MCQ.created_at.desc()).all()
    return jsonify([serialize_mcq(m) for m in mcqs])

@mcq_bp.route('/api/mcqs/<int:mcq_id>', methods=['GET'])
def get_one(mcq_id):
    """Get single MCQ by ID"""
    mcq = MCQ.query.get_or_404(mcq_id)
    return jsonify(serialize_mcq(mcq))

@mcq_bp.route('/api/mcqs', methods=['POST'])
def create():
    """Create a new MCQ question"""
    data = request.get_json()
    
    mcq = MCQ(
        question_text=data['question_text'],
        option_a=data['option_a'],
        option_b=data['option_b'],
        option_c=data.get('option_c'),
        option_d=data.get('option_d'),
        correct_answer=data['correct_answer'].upper(),
        marks=data.get('marks', 1.0),
        course_id=data['course_id'],
        staff_id=data.get('staff_id'),
        study_material_id=data.get('study_material_id')
    )
    
    db.session.add(mcq)
    db.session.commit()
    return jsonify({'id': mcq.id, 'message': 'MCQ created successfully'}), 201

@mcq_bp.route('/api/mcqs/<int:mcq_id>', methods=['PUT'])
def update(mcq_id):
    """Update an existing MCQ"""
    mcq = MCQ.query.get_or_404(mcq_id)
    data = request.get_json()
    
    mcq.question_text = data.get('question_text', mcq.question_text)
    mcq.option_a = data.get('option_a', mcq.option_a)
    mcq.option_b = data.get('option_b', mcq.option_b)
    mcq.option_c = data.get('option_c', mcq.option_c)
    mcq.option_d = data.get('option_d', mcq.option_d)
    mcq.correct_answer = data.get('correct_answer', mcq.correct_answer).upper()
    mcq.marks = data.get('marks', mcq.marks)
    mcq.course_id = data.get('course_id', mcq.course_id)
    mcq.study_material_id = data.get('study_material_id', mcq.study_material_id)
    
    db.session.commit()
    return jsonify({'message': 'MCQ updated successfully'})

@mcq_bp.route('/api/mcqs/<int:mcq_id>', methods=['DELETE'])
def delete(mcq_id):
    """Delete an MCQ"""
    mcq = MCQ.query.get_or_404(mcq_id)
    db.session.delete(mcq)
    db.session.commit()
    return jsonify({'message': 'MCQ deleted successfully'})

# ----------------------
# Student Quiz Operations
# ----------------------

@mcq_bp.route('/api/courses/<int:course_id>/quiz', methods=['GET'])
def get_course_quiz(course_id):
    """Get all MCQs for a course (for students taking quiz - no answers)"""
    student_id = request.args.get('student_id')
    
    mcqs = MCQ.query.filter_by(course_id=course_id).all()
    
    # Get student's existing attempts for this course
    attempted_mcq_ids = []
    if student_id:
        attempts = MCQAttempt.query.filter_by(student_id=student_id).all()
        attempted_mcq_ids = [a.mcq_id for a in attempts]
    
    result = []
    for m in mcqs:
        mcq_data = serialize_mcq(m, include_answer=False)
        mcq_data['attempted'] = m.id in attempted_mcq_ids
        result.append(mcq_data)
    
    return jsonify({
        'course_id': course_id,
        'total_questions': len(mcqs),
        'attempted_count': len([m for m in mcqs if m.id in attempted_mcq_ids]),
        'questions': result
    })

@mcq_bp.route('/api/materials/<int:material_id>/quiz', methods=['GET'])
def get_material_quiz(material_id):
    """Get all MCQs for a specific study material (for students taking quiz)"""
    student_id = request.args.get('student_id')
    
    mcqs = MCQ.query.filter_by(study_material_id=material_id).all()
    
    # Get student's existing attempts
    attempted_mcq_ids = []
    if student_id:
        attempts = MCQAttempt.query.filter_by(student_id=student_id).all()
        attempted_mcq_ids = [a.mcq_id for a in attempts]
    
    result = []
    for m in mcqs:
        mcq_data = serialize_mcq(m, include_answer=False)
        mcq_data['attempted'] = m.id in attempted_mcq_ids
        result.append(mcq_data)
    
    return jsonify({
        'material_id': material_id,
        'total_questions': len(mcqs),
        'attempted_count': len([m for m in mcqs if m.id in attempted_mcq_ids]),
        'questions': result
    })


@mcq_bp.route('/api/mcqs/<int:mcq_id>/attempt', methods=['POST'])
def submit_attempt(mcq_id):
    """Submit a student's answer for an MCQ"""
    mcq = MCQ.query.get_or_404(mcq_id)
    data = request.get_json()
    
    student_id = data['student_id']
    selected_answer = data['selected_answer'].upper()
    
    # Check if already attempted
    existing = MCQAttempt.query.filter_by(
        student_id=student_id, 
        mcq_id=mcq_id
    ).first()
    
    if existing:
        return jsonify({'error': 'Already attempted this question'}), 400
    
    # Check if correct
    is_correct = (selected_answer == mcq.correct_answer)
    
    attempt = MCQAttempt(
        student_id=student_id,
        mcq_id=mcq_id,
        selected_answer=selected_answer,
        is_correct=is_correct
    )
    
    db.session.add(attempt)
    db.session.commit()
    
    return jsonify({
        'id': attempt.id,
        'is_correct': is_correct,
        'correct_answer': mcq.correct_answer,
        'marks_earned': float(mcq.marks) if is_correct else 0
    })

@mcq_bp.route('/api/student/<int:student_id>/quiz-results', methods=['GET'])
def get_student_results(student_id):
    """Get all quiz results for a student"""
    student = Student.query.get_or_404(student_id)
    
    # Get attempts grouped by course
    attempts = MCQAttempt.query.filter_by(student_id=student_id).all()
    
    # Organize by course
    course_stats = {}
    for attempt in attempts:
        mcq = attempt.mcq
        course_id = mcq.course_id
        
        if course_id not in course_stats:
            course = Course.query.get(course_id)
            course_stats[course_id] = {
                'course_id': course_id,
                'course_name': course.course_name if course else None,
                'course_code': course.course_code if course else None,
                'total_attempted': 0,
                'correct_count': 0,
                'total_marks': 0,
                'earned_marks': 0
            }
        
        course_stats[course_id]['total_attempted'] += 1
        course_stats[course_id]['total_marks'] += float(mcq.marks) if mcq.marks else 1
        if attempt.is_correct:
            course_stats[course_id]['correct_count'] += 1
            course_stats[course_id]['earned_marks'] += float(mcq.marks) if mcq.marks else 1
    
    # Calculate percentages
    for stats in course_stats.values():
        if stats['total_marks'] > 0:
            stats['percentage'] = round((stats['earned_marks'] / stats['total_marks']) * 100, 1)
        else:
            stats['percentage'] = 0
    
    return jsonify({
        'student_id': student_id,
        'student_name': student.full_name,
        'total_attempts': len(attempts),
        'total_correct': sum(1 for a in attempts if a.is_correct),
        'course_results': list(course_stats.values())
    })
