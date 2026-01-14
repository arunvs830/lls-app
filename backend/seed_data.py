"""
Script to populate the database with test data
Run from the backend directory: python3 seed_data.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, AcademicYear, Semester, Program, Course, Staff, Student, StaffCourse, StudyMaterial, Assignment
from datetime import datetime, date

app = create_app()

with app.app_context():
    print("🌱 Seeding database with test data...")
    
    # Drop and recreate all tables for fresh start
    print("🗑️ Dropping existing tables...")
    db.drop_all()
    print("🔧 Creating fresh tables...")
    db.create_all()
    
    # Academic Years

    ay1 = AcademicYear(year_name="2025-2026", start_date=date(2025, 9, 1), end_date=date(2026, 8, 31))
    ay2 = AcademicYear(year_name="2024-2025", start_date=date(2024, 9, 1), end_date=date(2025, 8, 31))
    db.session.add_all([ay1, ay2])
    db.session.commit()
    print("✅ Academic Years created")
    
    # Semesters
    sem1 = Semester(semester_name="Fall 2025", semester_number=1)
    sem2 = Semester(semester_name="Spring 2026", semester_number=2)
    db.session.add_all([sem1, sem2])
    db.session.commit()
    print("✅ Semesters created")
    
    # Programs (Degree Programs)
    prog1 = Program(program_name="Bachelor of Computer Applications", program_code="BCA")
    prog2 = Program(program_name="Bachelor of Commerce", program_code="BCOM")
    prog3 = Program(program_name="Bachelor of Science", program_code="BSC")
    db.session.add_all([prog1, prog2, prog3])
    db.session.commit()
    print("✅ Programs created")
    
    # Courses (Language Courses)
    course1 = Course(course_name="German A1", course_code="GER-A1", program_id=prog1.id, semester_id=sem1.id)
    course2 = Course(course_name="German A2", course_code="GER-A2", program_id=prog1.id, semester_id=sem1.id)
    course3 = Course(course_name="French A1", course_code="FRE-A1", program_id=prog1.id, semester_id=sem1.id)
    course4 = Course(course_name="English Communication", course_code="ENG-101", program_id=prog2.id, semester_id=sem1.id)
    course5 = Course(course_name="German B1", course_code="GER-B1", program_id=prog2.id, semester_id=sem2.id)
    db.session.add_all([course1, course2, course3, course4, course5])
    db.session.commit()
    print("✅ Courses created")
    
    # Staff
    staff1 = Staff(
        staff_code="STF001",
        username="john.teacher",
        email="john@lls.com",
        password_hash="password123",
        full_name="John Smith"
    )
    staff2 = Staff(
        staff_code="STF002",
        username="maria.teacher",
        email="maria@lls.com",
        password_hash="password123",
        full_name="Maria Garcia"
    )
    db.session.add_all([staff1, staff2])
    db.session.commit()
    print("✅ Staff created")
    
    # Students
    student1 = Student(
        student_code="STU001",
        username="alice.student",
        email="alice@student.lls.com",
        password_hash="password123",
        full_name="Alice Johnson",
        program_id=prog1.id,  # BCA student
        semester_id=sem1.id,
        enrollment_date=date(2025, 9, 1)
    )
    student2 = Student(
        student_code="STU002",
        username="bob.student",
        email="bob@student.lls.com",
        password_hash="password123",
        full_name="Bob Williams",
        program_id=prog2.id,  # BCOM student
        semester_id=sem1.id,
        enrollment_date=date(2025, 9, 1)
    )
    db.session.add_all([student1, student2])
    db.session.commit()
    print("✅ Students created")
    
    # Staff-Course Allocation
    sc1 = StaffCourse(staff_id=staff1.id, course_id=course1.id, academic_year_id=ay1.id)
    sc2 = StaffCourse(staff_id=staff1.id, course_id=course2.id, academic_year_id=ay1.id)
    sc3 = StaffCourse(staff_id=staff2.id, course_id=course3.id, academic_year_id=ay1.id)
    sc4 = StaffCourse(staff_id=staff2.id, course_id=course4.id, academic_year_id=ay1.id)
    db.session.add_all([sc1, sc2, sc3, sc4])
    db.session.commit()
    print("✅ Staff-Course allocations created")

    
    # Study Materials
    mat1 = StudyMaterial(
        title="Introduction to German",
        description="Learn the basics of German language including greetings and common phrases.",
        file_path="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        file_type="youtube",
        staff_course_id=sc1.id
    )
    mat2 = StudyMaterial(
        title="German Alphabet & Pronunciation",
        description="Master the German alphabet and proper pronunciation techniques.",
        file_path="https://www.youtube.com/watch?v=abc123",
        file_type="youtube",
        staff_course_id=sc1.id
    )
    mat3 = StudyMaterial(
        title="Basic Grammar Rules",
        description="Understanding German grammar fundamentals.",
        file_path="https://example.com/grammar.pdf",
        file_type="pdf",
        staff_course_id=sc1.id
    )
    db.session.add_all([mat1, mat2, mat3])
    db.session.commit()
    print("✅ Study Materials created")
    
    # Sub-materials (children)
    submat1 = StudyMaterial(
        title="Vocabulary List - Lesson 1",
        description="Downloadable vocabulary list for lesson 1",
        file_path="https://example.com/vocab1.pdf",
        file_type="pdf",
        staff_course_id=sc1.id,
        parent_id=mat1.id
    )
    submat2 = StudyMaterial(
        title="Practice Worksheet",
        description="Worksheet with exercises for greetings practice",
        file_path="https://example.com/worksheet1.docx",
        file_type="ppt",
        staff_course_id=sc1.id,
        parent_id=mat1.id
    )
    db.session.add_all([submat1, submat2])
    db.session.commit()
    print("✅ Sub-materials created")
    
    # Assignments linked to materials
    assign1 = Assignment(
        title="Greetings Practice Assignment",
        description="Write 10 German greetings and their English translations. Record yourself pronouncing each one.",
        course_id=course1.id,
        staff_id=staff1.id,
        study_material_id=mat1.id,
        due_date=datetime(2026, 2, 15, 23, 59),
        max_marks=20
    )
    assign2 = Assignment(
        title="Alphabet Quiz",
        description="Complete the alphabet pronunciation quiz. You must score at least 80% to pass.",
        course_id=course1.id,
        staff_id=staff1.id,
        study_material_id=mat2.id,
        due_date=datetime(2026, 2, 20, 23, 59),
        max_marks=30
    )
    db.session.add_all([assign1, assign2])
    db.session.commit()
    print("✅ Assignments created")
    
    # MCQ Questions - linked to "Introduction to German" material
    from models import MCQ
    mcq1 = MCQ(
        question_text="What is the German word for 'Hello'?",
        option_a="Hallo",
        option_b="Tschüss",
        option_c="Danke",
        option_d="Bitte",
        correct_answer="A",
        marks=1,
        course_id=course1.id,
        staff_id=staff1.id,
        study_material_id=mat1.id  # Link to Introduction to German
    )
    mcq2 = MCQ(
        question_text="How do you say 'Thank you' in German?",
        option_a="Bitte",
        option_b="Danke",
        option_c="Entschuldigung",
        option_d="Guten Tag",
        correct_answer="B",
        marks=1,
        course_id=course1.id,
        staff_id=staff1.id,
        study_material_id=mat1.id
    )
    mcq3 = MCQ(
        question_text="What is 'Good Morning' in German?",
        option_a="Gute Nacht",
        option_b="Guten Abend",
        option_c="Guten Morgen",
        option_d="Guten Tag",
        correct_answer="C",
        marks=1,
        course_id=course1.id,
        staff_id=staff1.id,
        study_material_id=mat1.id
    )
    mcq4 = MCQ(
        question_text="What does 'Bitte' mean?",
        option_a="Sorry",
        option_b="Please / You're welcome",
        option_c="Goodbye",
        option_d="Hello",
        correct_answer="B",
        marks=1,
        course_id=course1.id,
        staff_id=staff1.id,
        study_material_id=mat1.id
    )
    mcq5 = MCQ(
        question_text="Which article is used with 'Buch' (book)?",
        option_a="der",
        option_b="die",
        option_c="das",
        option_d="ein",
        correct_answer="C",
        marks=2,
        course_id=course1.id,
        staff_id=staff1.id,
        study_material_id=mat1.id
    )
    db.session.add_all([mcq1, mcq2, mcq3, mcq4, mcq5])
    db.session.commit()
    print("✅ MCQ Questions created")
    
    print("\n🎉 Database seeded successfully!")
    print(f"""
    Summary:
    --------
    Academic Years: 2
    Semesters: 2
    Programs: 3 (BCA, BCOM, BSC)
    Courses: 5 (German A1/A2, French A1, English, German B1)
    Staff: 2
    Students: 2 (Alice=BCA, Bob=BCOM)
    Staff-Course Allocations: 4
    Study Materials: 3 (+ 2 sub-materials)
    Assignments: 2
    MCQ Questions: 5
    
    Test Users:
    -----------
    Staff: john.teacher / maria.teacher
    Students: alice.student (BCA) / bob.student (BCOM)
    """)


