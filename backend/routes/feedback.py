from flask import Blueprint, request, jsonify
from models import db, Feedback, Student, Course, Staff
from datetime import datetime

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit course/staff feedback"""
    try:
        data = request.json
        
        # Validate required fields
        if 'student_id' not in data or 'feedback_text' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Must provide either course_id or staff_id
        if 'course_id' not in data and 'staff_id' not in data:
            return jsonify({'error': 'Must provide course_id or staff_id'}), 400
        
        # Validate rating if provided (1-5 scale)
        if 'rating' in data and (data['rating'] < 1 or data['rating'] > 5):
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        feedback = Feedback(
            student_id=data['student_id'],
            course_id=data.get('course_id'),
            staff_id=data.get('staff_id'),
            rating=data.get('rating'),
            feedback_text=data['feedback_text'],
            is_anonymous=data.get('is_anonymous', False)
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'id': feedback.id,
            'message': 'Feedback submitted successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/api/feedback', methods=['GET'])
def get_all_feedback():
    """Get all feedback (admin only)"""
    try:
        feedbacks = Feedback.query.order_by(Feedback.submitted_at.desc()).all()
        
        result = []
        for fb in feedbacks:
            # Get related data
            student = Student.query.get(fb.student_id) if fb.student_id else None
            course = Course.query.get(fb.course_id) if fb.course_id else None
            staff = Staff.query.get(fb.staff_id) if fb.staff_id else None
            
            result.append({
                'id': fb.id,
                'student_id': fb.student_id,
                'student_name': student.full_name if student and not fb.is_anonymous else 'Anonymous',
                'course_id': fb.course_id,
                'course_name': course.course_name if course else None,
                'staff_id': fb.staff_id,
                'staff_name': staff.full_name if staff else None,
                'rating': fb.rating,
                'feedback_text': fb.feedback_text,
                'is_anonymous': fb.is_anonymous,
                'submitted_at': fb.submitted_at.isoformat() if fb.submitted_at else None
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/api/feedback/course/<int:course_id>', methods=['GET'])
def get_course_feedback(course_id):
    """Get feedback for a specific course"""
    try:
        feedbacks = Feedback.query.filter_by(course_id=course_id)\
            .order_by(Feedback.submitted_at.desc()).all()
        
        result = []
        for fb in feedbacks:
            student = Student.query.get(fb.student_id) if fb.student_id else None
            
            result.append({
                'id': fb.id,
                'student_id': fb.student_id if not fb.is_anonymous else None,
                'student_name': student.full_name if student and not fb.is_anonymous else 'Anonymous',
                'rating': fb.rating,
                'feedback_text': fb.feedback_text,
                'submitted_at': fb.submitted_at.isoformat() if fb.submitted_at else None
            })
        
        # Calculate average rating
        ratings = [fb.rating for fb in feedbacks if fb.rating]
        average_rating = sum(ratings) / len(ratings) if ratings else 0
        
        return jsonify({
            'feedbacks': result,
            'total_count': len(feedbacks),
            'average_rating': round(average_rating, 2)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/api/feedback/staff/<int:staff_id>', methods=['GET'])
def get_staff_feedback(staff_id):
    """Get feedback for a specific staff member"""
    try:
        feedbacks = Feedback.query.filter_by(staff_id=staff_id)\
            .order_by(Feedback.submitted_at.desc()).all()
        
        result = []
        for fb in feedbacks:
            student = Student.query.get(fb.student_id) if fb.student_id else None
            course = Course.query.get(fb.course_id) if fb.course_id else None
            
            result.append({
                'id': fb.id,
                'student_id': fb.student_id if not fb.is_anonymous else None,
                'student_name': student.full_name if student and not fb.is_anonymous else 'Anonymous',
                'course_id': fb.course_id,
                'course_name': course.course_name if course else None,
                'rating': fb.rating,
                'feedback_text': fb.feedback_text,
                'submitted_at': fb.submitted_at.isoformat() if fb.submitted_at else None
            })
        
        # Calculate average rating
        ratings = [fb.rating for fb in feedbacks if fb.rating]
        average_rating = sum(ratings) / len(ratings) if ratings else 0
        
        return jsonify({
            'feedbacks': result,
            'total_count': len(feedbacks),
            'average_rating': round(average_rating, 2)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/api/feedback/student/<int:student_id>', methods=['GET'])
def get_student_feedback(student_id):
    """Get feedback submitted by a specific student"""
    try:
        feedbacks = Feedback.query.filter_by(student_id=student_id)\
            .order_by(Feedback.submitted_at.desc()).all()
        
        result = []
        for fb in feedbacks:
            course = Course.query.get(fb.course_id) if fb.course_id else None
            staff = Staff.query.get(fb.staff_id) if fb.staff_id else None
            
            result.append({
                'id': fb.id,
                'course_id': fb.course_id,
                'course_name': course.course_name if course else None,
                'staff_id': fb.staff_id,
                'staff_name': staff.full_name if staff else None,
                'rating': fb.rating,
                'feedback_text': fb.feedback_text,
                'is_anonymous': fb.is_anonymous,
                'submitted_at': fb.submitted_at.isoformat() if fb.submitted_at else None
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/api/feedback/<int:feedback_id>', methods=['GET'])
def get_feedback(feedback_id):
    """Get specific feedback"""
    try:
        fb = Feedback.query.get_or_404(feedback_id)
        
        student = Student.query.get(fb.student_id) if fb.student_id else None
        course = Course.query.get(fb.course_id) if fb.course_id else None
        staff = Staff.query.get(fb.staff_id) if fb.staff_id else None
        
        return jsonify({
            'id': fb.id,
            'student_id': fb.student_id if not fb.is_anonymous else None,
            'student_name': student.full_name if student and not fb.is_anonymous else 'Anonymous',
            'course_id': fb.course_id,
            'course_name': course.course_name if course else None,
            'staff_id': fb.staff_id,
            'staff_name': staff.full_name if staff else None,
            'rating': fb.rating,
            'feedback_text': fb.feedback_text,
            'is_anonymous': fb.is_anonymous,
            'submitted_at': fb.submitted_at.isoformat() if fb.submitted_at else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/api/feedback/<int:feedback_id>', methods=['PUT'])
def update_feedback(feedback_id):
    """Update feedback (student can update their own)"""
    try:
        fb = Feedback.query.get_or_404(feedback_id)
        data = request.json
        
        if 'rating' in data:
            if data['rating'] < 1 or data['rating'] > 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
            fb.rating = data['rating']
        
        if 'feedback_text' in data:
            fb.feedback_text = data['feedback_text']
        
        if 'is_anonymous' in data:
            fb.is_anonymous = data['is_anonymous']
        
        db.session.commit()
        
        return jsonify({'message': 'Feedback updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feedback_bp.route('/api/feedback/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    """Delete feedback"""
    try:
        fb = Feedback.query.get_or_404(feedback_id)
        db.session.delete(fb)
        db.session.commit()
        
        return jsonify({'message': 'Feedback deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
