-- Language Learning System Database Schema

-- Disable foreign key checks for bulk creation
SET foreign_key_checks = 0;

-- -----------------------------------------------------
-- Core Administration Tables
-- -----------------------------------------------------

-- Academic Year
CREATE TABLE IF NOT EXISTS `academic_year` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `year_name` VARCHAR(50) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Program
CREATE TABLE IF NOT EXISTS `program` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `program_name` VARCHAR(100) NOT NULL,
    `program_code` VARCHAR(20) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_year`(`id`)
);

-- Semester
CREATE TABLE IF NOT EXISTS `semester` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `semester_name` VARCHAR(50) NOT NULL,
    `semester_number` INT NOT NULL,
    `program_id` INT,
    `start_date` DATE,
    `end_date` DATE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`program_id`) REFERENCES `program`(`id`)
);

-- Admin
CREATE TABLE IF NOT EXISTS `admin` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE IF NOT EXISTS `staff` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `staff_code` VARCHAR(20) NOT NULL UNIQUE,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Course Management Tables
-- -----------------------------------------------------

-- Course
CREATE TABLE IF NOT EXISTS `course` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(20) NOT NULL UNIQUE,
    `course_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`)
);

-- Staff Course Mapping
CREATE TABLE IF NOT EXISTS `staff_course` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `staff_id` INT,
    `course_id` INT,
    `academic_year_id` INT,
    `assigned_date` DATE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`),
    FOREIGN KEY (`course_id`) REFERENCES `course`(`id`),
    FOREIGN KEY (`academic_year_id`) REFERENCES `academic_year`(`id`),
    UNIQUE KEY `unique_staff_course_assignment` (`staff_id`, `course_id`, `academic_year_id`)
);

-- Study Material
CREATE TABLE IF NOT EXISTS `study_material` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `file_path` VARCHAR(500),
    `file_type` VARCHAR(50),
    `staff_course_id` INT,
    `upload_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`staff_course_id`) REFERENCES `staff_course`(`id`)
);

-- -----------------------------------------------------
-- Assessment Tables
-- -----------------------------------------------------

-- Assignment
CREATE TABLE IF NOT EXISTS `assignment` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `course_id` INT,
    `staff_id` INT,
    `study_material_id` INT,
    `due_date` DATETIME,
    `max_marks` DECIMAL(5,2),
    `file_path` VARCHAR(500),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`course_id`) REFERENCES `course`(`id`),
    FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`),
    FOREIGN KEY (`study_material_id`) REFERENCES `study_material`(`id`)
);

-- MCQ
CREATE TABLE IF NOT EXISTS `mcq` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `question_text` TEXT NOT NULL,
    `option_a` VARCHAR(500) NOT NULL,
    `option_b` VARCHAR(500) NOT NULL,
    `option_c` VARCHAR(500),
    `option_d` VARCHAR(500),
    `correct_answer` CHAR(1) NOT NULL,
    `marks` DECIMAL(5,2) DEFAULT 1.00,
    `course_id` INT,
    `staff_id` INT,
    `study_material_id` INT,

    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`course_id`) REFERENCES `course`(`id`),
    FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`),
    FOREIGN KEY (`study_material_id`) REFERENCES `study_material`(`id`)
);

-- -----------------------------------------------------
-- Student Management Tables
-- -----------------------------------------------------

-- Student
CREATE TABLE IF NOT EXISTS `student` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_code` VARCHAR(20) NOT NULL UNIQUE,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `program_id` INT,
    `semester_id` INT,
    `enrollment_date` DATE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`program_id`) REFERENCES `program`(`id`),
    FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`)
);

-- Payment
CREATE TABLE IF NOT EXISTS `payment` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT,
    `amount` DECIMAL(10,2) NOT NULL,
    `payment_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `payment_method` VARCHAR(50),
    `transaction_id` VARCHAR(100),
    `semester_id` INT,
    `receipt_number` VARCHAR(50) UNIQUE,
    `status` VARCHAR(20) DEFAULT 'completed',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `student`(`id`),
    FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`)
);

-- -----------------------------------------------------
-- Submission & Results Tables
-- -----------------------------------------------------

-- Submission
CREATE TABLE IF NOT EXISTS `submission` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `assignment_id` INT,
    `student_id` INT,
    `file_path` VARCHAR(500),
    `submission_text` TEXT,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) DEFAULT 'submitted',
    FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`id`),
    FOREIGN KEY (`student_id`) REFERENCES `student`(`id`),
    UNIQUE KEY `unique_student_submission` (`assignment_id`, `student_id`)
);

-- Evaluation
CREATE TABLE IF NOT EXISTS `evaluation` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `submission_id` INT UNIQUE,
    `staff_id` INT,
    `marks_obtained` DECIMAL(5,2),
    `feedback` TEXT,
    `evaluated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) DEFAULT 'evaluated',
    FOREIGN KEY (`submission_id`) REFERENCES `submission`(`id`),
    FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`)
);

-- Result
CREATE TABLE IF NOT EXISTS `result` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT,
    `course_id` INT,
    `semester_id` INT,
    `assignment_marks` DECIMAL(5,2),
    `mcq_marks` DECIMAL(5,2),
    `total_marks` DECIMAL(5,2),
    `grade` VARCHAR(5),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `student`(`id`),
    FOREIGN KEY (`course_id`) REFERENCES `course`(`id`),
    FOREIGN KEY (`semester_id`) REFERENCES `semester`(`id`),
    UNIQUE KEY `unique_student_result` (`student_id`, `course_id`, `semester_id`)
);

-- MCQ Attempt
CREATE TABLE IF NOT EXISTS `mcq_attempt` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT,
    `mcq_id` INT,
    `selected_answer` CHAR(1),
    `is_correct` BOOLEAN,
    `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `student`(`id`),
    FOREIGN KEY (`mcq_id`) REFERENCES `mcq`(`id`)
);

-- -----------------------------------------------------
-- Certificate Tables
-- -----------------------------------------------------

-- Certificate Layout
CREATE TABLE IF NOT EXISTS `certificate_layout` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `layout_name` VARCHAR(100) NOT NULL,
    `template_content` TEXT,
    `background_image` VARCHAR(500),
    `program_id` INT,
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`program_id`) REFERENCES `program`(`id`)
);

-- Certificate Issue
CREATE TABLE IF NOT EXISTS `certificate_issue` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `certificate_number` VARCHAR(50) NOT NULL UNIQUE,
    `student_id` INT,
    `program_id` INT,
    `layout_id` INT,
    `issue_date` DATE NOT NULL,
    `valid_until` DATE,
    `grade` VARCHAR(20),

    `file_path` VARCHAR(500),
    `status` VARCHAR(20) DEFAULT 'issued',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `student`(`id`),
    FOREIGN KEY (`program_id`) REFERENCES `program`(`id`),
    FOREIGN KEY (`layout_id`) REFERENCES `certificate_layout`(`id`)
);

-- -----------------------------------------------------
-- Communication Tables
-- -----------------------------------------------------

-- Communication
CREATE TABLE IF NOT EXISTS `communication` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sender_type` VARCHAR(20) NOT NULL,
    `sender_id` INT NOT NULL,
    `receiver_type` VARCHAR(20) NOT NULL,
    `receiver_id` INT NOT NULL,
    `subject` VARCHAR(200),
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `read_at` TIMESTAMP NULL
);

-- Feedback
CREATE TABLE IF NOT EXISTS `feedback` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT,
    `course_id` INT,
    `staff_id` INT,
    `rating` INT CHECK (rating BETWEEN 1 AND 5),
    `feedback_text` TEXT,
    `is_anonymous` BOOLEAN DEFAULT FALSE,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`student_id`) REFERENCES `student`(`id`),
    FOREIGN KEY (`course_id`) REFERENCES `course`(`id`),
    FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`)
);

-- Enable foreign key checks
SET foreign_key_checks = 1;
