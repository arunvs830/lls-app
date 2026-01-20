from app import create_app
from models import db, Student, Admin, Staff
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    password = "password123"
    hashed_password = generate_password_hash(password)
    
    # Reset student 'arun'
    student = Student.query.filter_by(username='arun').first()
    if student:
        student.password_hash = hashed_password
        print(f"✅ Reset password for student: {student.username}")
    
    # Reset student 'alice.student'
    student2 = Student.query.filter_by(username='alice.student').first()
    if student2:
        student2.password_hash = hashed_password
        print(f"✅ Reset password for student: {student2.username}")
        
    # Reset staff 'john.teacher'
    staff = Staff.query.filter_by(username='john.teacher').first()
    if staff:
        staff.password_hash = hashed_password
        print(f"✅ Reset password for staff: {staff.username}")
        
    # Reset admin 'admin'
    admin = Admin.query.filter_by(username='admin').first()
    if admin:
        admin.password_hash = hashed_password
        print(f"✅ Reset password for admin: {admin.username}")
        
    db.session.commit()
    print("\n🎉 All passwords reset to: password123")
