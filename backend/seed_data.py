"""
Script to populate the database with minimal test data
Run from the backend directory: python3 seed_data.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, AcademicYear, Semester, Program, Course, Staff, Student, StaffCourse, Admin
from datetime import datetime, date
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    print("🌱 Seeding database with minimal test data...")
    
    # Drop and recreate all tables for fresh start
    print("🗑️ Dropping existing tables...")
    db.drop_all()
    print("🔧 Creating fresh tables...")
    db.create_all()
    
    # 1 Admin User
    admin1 = Admin(
        username="admin",
        email="admin@lls.edu",
        password_hash=generate_password_hash("admin123"),
        full_name="System Administrator",
        phone="9876543210"
    )
    db.session.add(admin1)
    db.session.commit()
    print("✅ Admin created (1)")
    
    # 1 Academic Year
    ay1 = AcademicYear(year_name="2025-2026", start_date=date(2025, 9, 1), end_date=date(2026, 8, 31))
    db.session.add(ay1)
    db.session.commit()
    print("✅ Academic Year created (1)")
    
    # 3 Semesters
    sem1 = Semester(semester_name="Sem 1", semester_number=1)
    sem2 = Semester(semester_name="Sem 2", semester_number=2)
    sem3 = Semester(semester_name="Sem 3", semester_number=3)
    db.session.add_all([sem1, sem2, sem3])
    db.session.commit()
    print("✅ Semesters created (3)")
    
    # 5 Programs
    prog1 = Program(program_name="German Language Program", program_code="GLP")
    prog2 = Program(program_name="Bachelor of Arts in English", program_code="BA-ENG")
    prog3 = Program(program_name="Bachelor of Computer Application", program_code="BCA")
    prog4 = Program(program_name="Bachelor of Commerce", program_code="BCOM")
    prog5 = Program(program_name="Bachelor of Business Administration", program_code="BBA")
    db.session.add_all([prog1, prog2, prog3, prog4, prog5])
    db.session.commit()
    print("✅ Programs created (5)")
    
    # Courses - German A1 and A2 for each program (different course records per program)
    # GLP Courses
    course_glp_a1 = Course(course_name="German A1", course_code="GLP-A1", program_id=prog1.id, semester_id=sem1.id)
    course_glp_a2 = Course(course_name="German A2", course_code="GLP-A2", program_id=prog1.id, semester_id=sem2.id)
    
    # BCA Courses
    course_bca_a1 = Course(course_name="German A1", course_code="BCA-GER-A1", program_id=prog3.id, semester_id=sem1.id)
    course_bca_a2 = Course(course_name="German A2", course_code="BCA-GER-A2", program_id=prog3.id, semester_id=sem2.id)
    
    # BCom Courses  
    course_bcom_a1 = Course(course_name="German A1", course_code="BCOM-GER-A1", program_id=prog4.id, semester_id=sem1.id)
    course_bcom_a2 = Course(course_name="German A2", course_code="BCOM-GER-A2", program_id=prog4.id, semester_id=sem2.id)
    
    # BBA Courses
    course_bba_a1 = Course(course_name="German A1", course_code="BBA-GER-A1", program_id=prog5.id, semester_id=sem1.id)
    course_bba_a2 = Course(course_name="German A2", course_code="BBA-GER-A2", program_id=prog5.id, semester_id=sem2.id)
    
    # BA English Courses
    course_baeng_a1 = Course(course_name="German A1", course_code="BAENG-GER-A1", program_id=prog2.id, semester_id=sem1.id)
    course_baeng_a2 = Course(course_name="German A2", course_code="BAENG-GER-A2", program_id=prog2.id, semester_id=sem2.id)
    
    db.session.add_all([
        course_glp_a1, course_glp_a2,
        course_bca_a1, course_bca_a2,
        course_bcom_a1, course_bcom_a2,
        course_bba_a1, course_bba_a2,
        course_baeng_a1, course_baeng_a2
    ])
    db.session.commit()
    print("✅ Courses created (10 - German A1 & A2 for each program)")
    
    # 3 Staff Members
    staff1 = Staff(
        staff_code="ST001",
        username="john.teacher",
        email="john@lls.edu",
        password_hash=generate_password_hash("password123"),
        full_name="John Smith"
    )
    staff2 = Staff(
        staff_code="ST002",
        username="maria.teacher",
        email="maria@lls.edu",
        password_hash=generate_password_hash("password123"),
        full_name="Maria Müller"
    )
    staff3 = Staff(
        staff_code="ST003",
        username="hans.teacher",
        email="hans@lls.edu",
        password_hash=generate_password_hash("password123"),
        full_name="Hans Weber"
    )
    db.session.add_all([staff1, staff2, staff3])
    db.session.commit()
    print("✅ Staff created (3)")
    
    # Staff-Course Allocation - Different teachers for same course name in different programs
    # John teaches GLP and BCA courses
    sc1 = StaffCourse(staff_id=staff1.id, course_id=course_glp_a1.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    sc2 = StaffCourse(staff_id=staff1.id, course_id=course_glp_a2.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    sc3 = StaffCourse(staff_id=staff1.id, course_id=course_bca_a1.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    sc4 = StaffCourse(staff_id=staff1.id, course_id=course_bca_a2.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    
    # Maria teaches BCom and BBA courses
    sc5 = StaffCourse(staff_id=staff2.id, course_id=course_bcom_a1.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    sc6 = StaffCourse(staff_id=staff2.id, course_id=course_bcom_a2.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    sc7 = StaffCourse(staff_id=staff2.id, course_id=course_bba_a1.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    sc8 = StaffCourse(staff_id=staff2.id, course_id=course_bba_a2.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    
    # Hans teaches BA English courses
    sc9 = StaffCourse(staff_id=staff3.id, course_id=course_baeng_a1.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    sc10 = StaffCourse(staff_id=staff3.id, course_id=course_baeng_a2.id, academic_year_id=ay1.id, assigned_date=date(2025, 9, 1))
    
    db.session.add_all([sc1, sc2, sc3, sc4, sc5, sc6, sc7, sc8, sc9, sc10])
    db.session.commit()
    print("✅ Staff-Course allocations created (10)")
    
    # 2 Students
    student1 = Student(
        student_code="STU0001",
        username="alice.student",
        email="alice@student.lls.edu",
        password_hash=generate_password_hash("password123"),
        full_name="Alice Johnson",
        program_id=prog1.id,
        semester_id=sem1.id,
        enrollment_date=date(2025, 9, 1)
    )
    student2 = Student(
        student_code="STU0002",
        username="arun",
        email="arun@gmail.com",
        password_hash=generate_password_hash("password123"),
        full_name="Arun Kumar",
        program_id=prog1.id,
        semester_id=sem1.id,
        enrollment_date=date(2025, 9, 1)
    )
    db.session.add_all([student1, student2])
    db.session.commit()
    print("✅ Students created (2)")
    
    print("\n🎉 Database seeded successfully!")
    print("""
    Summary:
    --------
    Admin: 1
    Academic Years: 1
    Semesters: 3 (Sem 1, Sem 2, Sem 3)
    Programs: 1 (GLP)
    Courses: 2 (German A1, German A2)
    Staff: 1 (john.teacher)
    Students: 2 (alice.student, arun)
    
    Login Credentials:
    ------------------
    Admin:   username: admin          password: admin123
    Staff:   username: john.teacher   password: password123
    Student: username: arun           password: password123
    Student: username: alice.student  password: password123
    """)


