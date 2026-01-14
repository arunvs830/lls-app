# Routes package
from .academic_year import academic_year_bp
from .semester import semester_bp
from .program import program_bp
from .course import course_bp
from .staff import staff_bp
from .student import student_bp
from .staff_course import staff_course_bp
from .study_material import study_material_bp
from .assignment import assignment_bp
from .submission import submission_bp
from .student_dashboard import student_dashboard_bp
from .mcq import mcq_bp

def register_routes(app):
    app.register_blueprint(academic_year_bp)
    app.register_blueprint(semester_bp)
    app.register_blueprint(program_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(staff_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(staff_course_bp)
    app.register_blueprint(study_material_bp)
    app.register_blueprint(assignment_bp)
    app.register_blueprint(submission_bp)
    app.register_blueprint(student_dashboard_bp)
    app.register_blueprint(mcq_bp)

