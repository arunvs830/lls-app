from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# -----------------------------------------------------
# Core Administration Models
# -----------------------------------------------------

class AcademicYear(db.Model):
    __tablename__ = 'academic_year'
    id = db.Column(db.Integer, primary_key=True)
    year_name = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    staff_courses = db.relationship('StaffCourse', backref='academic_year', lazy=True)

class Program(db.Model):
    __tablename__ = 'program'
    id = db.Column(db.Integer, primary_key=True)
    program_name = db.Column(db.String(100), nullable=False)
    program_code = db.Column(db.String(20), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    courses = db.relationship('Course', backref='program', lazy=True)
    students = db.relationship('Student', backref='program', lazy=True)
    certificate_layouts = db.relationship('CertificateLayout', backref='program', lazy=True)
    certificate_issues = db.relationship('CertificateIssue', backref='program', lazy=True)

class Semester(db.Model):
    __tablename__ = 'semester'
    id = db.Column(db.Integer, primary_key=True)
    semester_name = db.Column(db.String(50), nullable=False)
    semester_number = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    courses = db.relationship('Course', backref='semester', lazy=True)
    students = db.relationship('Student', backref='semester', lazy=True)
    payments = db.relationship('Payment', backref='semester', lazy=True)
    results = db.relationship('Result', backref='semester', lazy=True)

class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Staff(db.Model):
    __tablename__ = 'staff'
    id = db.Column(db.Integer, primary_key=True)
    staff_code = db.Column(db.String(20), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    staff_courses = db.relationship('StaffCourse', backref='staff', lazy=True)
    assignments = db.relationship('Assignment', backref='staff', lazy=True)
    mcqs = db.relationship('MCQ', backref='staff', lazy=True)
    evaluations = db.relationship('Evaluation', backref='staff', lazy=True)
    feedbacks = db.relationship('Feedback', backref='staff', lazy=True)

# -----------------------------------------------------
# Course Management Models
# -----------------------------------------------------

class Course(db.Model):
    __tablename__ = 'course'
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    course_name = db.Column(db.String(100), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    staff_courses = db.relationship('StaffCourse', backref='course', lazy=True)
    assignments = db.relationship('Assignment', backref='course', lazy=True)
    mcqs = db.relationship('MCQ', backref='course', lazy=True)
    results = db.relationship('Result', backref='course', lazy=True)
    feedbacks = db.relationship('Feedback', backref='course', lazy=True)

class StaffCourse(db.Model):
    __tablename__ = 'staff_course'
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_year.id'))
    assigned_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    study_materials = db.relationship('StudyMaterial', backref='staff_course', lazy=True)
    __table_args__ = (db.UniqueConstraint('staff_id', 'course_id', 'academic_year_id', name='unique_staff_course_assignment'),)

class StudyMaterial(db.Model):
    __tablename__ = 'study_material'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(500))
    file_type = db.Column(db.String(50))  # video, youtube, pdf, ppt
    thumbnail_path = db.Column(db.String(500))  # Path to thumbnail image for PPT
    staff_course_id = db.Column(db.Integer, db.ForeignKey('staff_course.id'))
    parent_id = db.Column(db.Integer, db.ForeignKey('study_material.id'))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    children = db.relationship('StudyMaterial', backref=db.backref('parent', remote_side='StudyMaterial.id'), lazy=True)
    assignments = db.relationship('Assignment', backref='study_material', lazy=True)
    mcqs = db.relationship('MCQ', backref='study_material', lazy=True)

# -----------------------------------------------------
# Assessment Models
# -----------------------------------------------------

class Assignment(db.Model):
    __tablename__ = 'assignment'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    study_material_id = db.Column(db.Integer, db.ForeignKey('study_material.id'))
    due_date = db.Column(db.DateTime)
    max_marks = db.Column(db.Numeric(5,2))
    file_path = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    submissions = db.relationship('Submission', backref='assignment', lazy=True)

class MCQ(db.Model):
    __tablename__ = 'mcq'
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(500), nullable=False)
    option_b = db.Column(db.String(500), nullable=False)
    option_c = db.Column(db.String(500))
    option_d = db.Column(db.String(500))
    correct_answer = db.Column(db.String(1), nullable=False)
    marks = db.Column(db.Numeric(5,2), default=1.00)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    study_material_id = db.Column(db.Integer, db.ForeignKey('study_material.id'))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    attempts = db.relationship('MCQAttempt', backref='mcq', lazy=True)

# -----------------------------------------------------
# Student Management Models
# -----------------------------------------------------

class Student(db.Model):
    __tablename__ = 'student'
    id = db.Column(db.Integer, primary_key=True)
    student_code = db.Column(db.String(20), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'))
    enrollment_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    payments = db.relationship('Payment', backref='student', lazy=True)
    submissions = db.relationship('Submission', backref='student', lazy=True)
    results = db.relationship('Result', backref='student', lazy=True)
    certificate_issues = db.relationship('CertificateIssue', backref='student', lazy=True)
    feedbacks = db.relationship('Feedback', backref='student', lazy=True)
    mcq_attempts = db.relationship('MCQAttempt', backref='student', lazy=True)

class Payment(db.Model):
    __tablename__ = 'payment'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    amount = db.Column(db.Numeric(10,2), nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_method = db.Column(db.String(50))
    transaction_id = db.Column(db.String(100))
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'))
    receipt_number = db.Column(db.String(50), unique=True)
    status = db.Column(db.String(20), default='completed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------
# Submission & Results Models
# -----------------------------------------------------

class Submission(db.Model):
    __tablename__ = 'submission'
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'))
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    file_path = db.Column(db.String(500))
    submission_text = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='submitted')

    evaluation = db.relationship('Evaluation', uselist=False, backref='submission')
    __table_args__ = (db.UniqueConstraint('assignment_id', 'student_id', name='unique_student_submission'),)

class Evaluation(db.Model):
    __tablename__ = 'evaluation'
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submission.id'), unique=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    marks_obtained = db.Column(db.Numeric(5,2))
    feedback = db.Column(db.Text)
    evaluated_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='evaluated')

class Result(db.Model):
    __tablename__ = 'result'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    semester_id = db.Column(db.Integer, db.ForeignKey('semester.id'))
    assignment_marks = db.Column(db.Numeric(5,2))
    mcq_marks = db.Column(db.Numeric(5,2))
    total_marks = db.Column(db.Numeric(5,2))
    grade = db.Column(db.String(5))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('student_id', 'course_id', 'semester_id', name='unique_student_result'),)

class MCQAttempt(db.Model):
    __tablename__ = 'mcq_attempt'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    mcq_id = db.Column(db.Integer, db.ForeignKey('mcq.id'))
    selected_answer = db.Column(db.String(1))
    is_correct = db.Column(db.Boolean)
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------
# Certificate Models
# -----------------------------------------------------

class CertificateLayout(db.Model):
    __tablename__ = 'certificate_layout'
    id = db.Column(db.Integer, primary_key=True)
    layout_name = db.Column(db.String(100), nullable=False)
    template_content = db.Column(db.Text)
    background_image = db.Column(db.String(500))
    program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    certificate_issues = db.relationship('CertificateIssue', backref='certificate_layout', lazy=True)

class CertificateIssue(db.Model):
    __tablename__ = 'certificate_issue'
    id = db.Column(db.Integer, primary_key=True)
    certificate_number = db.Column(db.String(50), unique=True, nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    program_id = db.Column(db.Integer, db.ForeignKey('program.id'))
    layout_id = db.Column(db.Integer, db.ForeignKey('certificate_layout.id'))
    issue_date = db.Column(db.Date, nullable=False)
    valid_until = db.Column(db.Date)
    grade = db.Column(db.String(20))

    file_path = db.Column(db.String(500))
    status = db.Column(db.String(20), default='issued')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------
# Communication Models
# -----------------------------------------------------

class Communication(db.Model):
    __tablename__ = 'communication'
    id = db.Column(db.Integer, primary_key=True)
    sender_type = db.Column(db.String(20), nullable=False)
    sender_id = db.Column(db.Integer, nullable=False)
    receiver_type = db.Column(db.String(20), nullable=False)
    receiver_id = db.Column(db.Integer, nullable=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    rating = db.Column(db.Integer)
    feedback_text = db.Column(db.Text)
    is_anonymous = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

# -----------------------------------------------------
# Notification Models
# -----------------------------------------------------

class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    user_type = db.Column(db.String(20), nullable=False)  # 'student', 'staff', 'admin'
    user_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50))  # 'assignment_submitted', 'assignment_graded', 'deadline_reminder', etc.
    reference_type = db.Column(db.String(50))  # 'assignment', 'submission', 'quiz', etc.
    reference_id = db.Column(db.Integer)
    is_read = db.Column(db.Boolean, default=False)
    email_sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)


# -----------------------------------------------------
# Student Course Enrollment Models
# -----------------------------------------------------

class StudentCourse(db.Model):
    """
    Many-to-many relationship between students and courses.
    Allows students to enroll in multiple courses.
    """
    __tablename__ = 'student_course'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='active')  # 'active', 'completed', 'dropped'
    
    # Relationships
    student = db.relationship('Student', backref=db.backref('enrolled_courses', lazy=True))
    course = db.relationship('Course', backref=db.backref('enrolled_students', lazy=True))
    
    __table_args__ = (db.UniqueConstraint('student_id', 'course_id', name='unique_student_course_enrollment'),)


# -----------------------------------------------------
# Exam Models
# -----------------------------------------------------

class StudentExam(db.Model):
    """
    Stores CCA1 and CCA2 exam answer papers and marks for each student per course.
    """
    __tablename__ = 'student_exam'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    
    # CCA1
    cca1_file_path = db.Column(db.String(500))
    cca1_marks = db.Column(db.Numeric(5,2))
    
    # CCA2
    cca2_file_path = db.Column(db.String(500))
    cca2_marks = db.Column(db.Numeric(5,2))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    student = db.relationship('Student', backref=db.backref('exams', lazy=True))
    course = db.relationship('Course', backref=db.backref('student_exams', lazy=True))
    staff = db.relationship('Staff', backref=db.backref('graded_exams', lazy=True))
    
    __table_args__ = (db.UniqueConstraint('student_id', 'course_id', name='unique_student_exam'),)
