from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify
from sqlalchemy.orm import joinedload

from models import (
    Assignment,
    Course,
    MCQ,
    MCQAttempt,
    Student,
    Submission,
)


result_bp = Blueprint('result', __name__)


def _to_float(value, default: float = 0.0) -> float:
    if value is None:
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _iso(dt):
    if not dt:
        return None
    try:
        return dt.isoformat()
    except Exception:
        return None


def _compute_course_result(student_id: int, course_id: int):
    now = datetime.utcnow()

    course = Course.query.get_or_404(course_id)

    assignments = Assignment.query.filter_by(course_id=course_id).all()
    assignment_ids = [a.id for a in assignments]

    submissions = []
    if assignment_ids:
        submissions = (
            Submission.query.options(joinedload(Submission.evaluation))
            .filter(Submission.student_id == student_id, Submission.assignment_id.in_(assignment_ids))
            .all()
        )

    submission_by_assignment_id = {s.assignment_id: s for s in submissions}

    assignment_total = sum(_to_float(a.max_marks, 0.0) for a in assignments)
    assignment_earned = 0.0
    submitted_count = 0
    graded_count = 0

    last_due_date = None
    assignment_details = []
    for a in assignments:
        if a.due_date and (last_due_date is None or a.due_date > last_due_date):
            last_due_date = a.due_date

        submission = submission_by_assignment_id.get(a.id)
        submitted = submission is not None
        if submitted:
            submitted_count += 1

        marks_obtained = None
        is_graded = False
        if submission and submission.evaluation and submission.evaluation.marks_obtained is not None:
            marks_obtained = _to_float(submission.evaluation.marks_obtained, 0.0)
            assignment_earned += marks_obtained
            is_graded = True
            graded_count += 1

        assignment_details.append(
            {
                'id': a.id,
                'title': a.title,
                'max_marks': _to_float(a.max_marks, 0.0),
                'due_date': _iso(a.due_date),
                'submitted': submitted,
                'graded': is_graded,
                'marks_obtained': marks_obtained,
            }
        )

    all_assignments_submitted = (len(assignments) == 0) or (submitted_count == len(assignments))
    due_passed = bool(last_due_date and now > last_due_date)
    final_released = all_assignments_submitted or due_passed

    # Quiz totals are based on all MCQs in the course (not just attempted)
    mcqs = MCQ.query.filter_by(course_id=course_id).all()
    mcq_ids = [m.id for m in mcqs]

    attempts = []
    if mcq_ids:
        attempts = (
            MCQAttempt.query.filter(MCQAttempt.student_id == student_id, MCQAttempt.mcq_id.in_(mcq_ids)).all()
        )

    attempt_by_mcq_id = {a.mcq_id: a for a in attempts}

    quiz_total = sum(_to_float(m.marks, 1.0) for m in mcqs)
    quiz_earned = 0.0
    correct_count = 0

    for m in mcqs:
        attempt = attempt_by_mcq_id.get(m.id)
        if attempt and attempt.is_correct:
            correct_count += 1
            quiz_earned += _to_float(m.marks, 1.0)

    total_possible = assignment_total + quiz_total
    total_earned = assignment_earned + quiz_earned

    progress_percentage = round((total_earned / total_possible) * 100, 1) if total_possible > 0 else 0.0

    payload = {
        'course': {
            'id': course.id,
            'course_code': course.course_code,
            'course_name': course.course_name,
        },
        'assignments': {
            'total_count': len(assignments),
            'submitted_count': submitted_count,
            'graded_count': graded_count,
            'earned_marks': round(assignment_earned, 2),
            'total_marks': round(assignment_total, 2),
            'last_due_date': _iso(last_due_date),
            'details': assignment_details,
        },
        'quiz': {
            'total_questions': len(mcqs),
            'attempted_count': len(attempts),
            'correct_count': correct_count,
            'earned_marks': round(quiz_earned, 2),
            'total_marks': round(quiz_total, 2),
        },
        'progress': {
            'earned_marks': round(total_earned, 2),
            'total_marks': round(total_possible, 2),
            'percentage': progress_percentage,
        },
        'final': {
            'released': final_released,
            'reason': (
                'all_assignments_submitted' if all_assignments_submitted else ('past_last_assignment_due_date' if due_passed else 'not_completed')
            ),
            'percentage': progress_percentage if final_released else None,
        },
    }

    return payload


@result_bp.route('/api/student/<int:student_id>/course-results', methods=['GET'])
def get_student_course_results(student_id: int):
    """Summary results per enrolled course.

    Final percentage is only returned when the course is considered complete:
    - student submitted all assignments for the course, OR
    - current time is past the last assignment due_date.
    """

    student = Student.query.get_or_404(student_id)

    if student.program_id is None or student.semester_id is None:
        return jsonify(
            {
                'student': {
                    'id': student.id,
                    'full_name': student.full_name,
                    'student_code': student.student_code,
                },
                'courses': [],
                'message': 'Student is not assigned to a program/semester; no enrolled courses found.'
            }
        )

    courses = Course.query.filter_by(program_id=student.program_id, semester_id=student.semester_id).all()

    course_results = [_compute_course_result(student_id, c.id) for c in courses]

    return jsonify(
        {
            'student': {
                'id': student.id,
                'full_name': student.full_name,
                'student_code': student.student_code,
            },
            'courses': course_results,
        }
    )


@result_bp.route('/api/student/<int:student_id>/courses/<int:course_id>/result-breakdown', methods=['GET'])
def get_student_course_result_breakdown(student_id: int, course_id: int):
    """Detailed breakdown for a single course (assignments + quiz + final gating)."""

    Student.query.get_or_404(student_id)
    return jsonify(_compute_course_result(student_id, course_id))
