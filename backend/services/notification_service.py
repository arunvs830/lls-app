"""
Notification Service - Handles all notifications and email sending
"""
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from flask import current_app
from models import db, Notification, Student, Staff, Assignment, Submission, Evaluation


def _send_email_background(app, to_email, subject, body, html_body, mail_server, mail_port, mail_username, mail_password, mail_sender, use_tls):
    """Background thread function to send email without blocking"""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = mail_sender
        msg['To'] = to_email
        
        text_part = MIMEText(body, 'plain')
        msg.attach(text_part)
        
        if html_body:
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
        
        with smtplib.SMTP(mail_server, mail_port) as server:
            if use_tls:
                server.starttls()
            server.login(mail_username, mail_password)
            server.sendmail(mail_sender, to_email, msg.as_string())
        
        with app.app_context():
            app.logger.info(f"Email sent (background): {subject} to {to_email}")
    except Exception as e:
        with app.app_context():
            app.logger.error(f"Failed to send email (background): {str(e)}")


class NotificationService:
    """Service for managing notifications and sending emails"""
    
    @staticmethod
    def create_notification(user_type, user_id, title, message, notification_type=None, 
                          reference_type=None, reference_id=None, send_email=True):
        """Create a notification and optionally send email"""
        notification = Notification(
            user_type=user_type,
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            reference_type=reference_type,
            reference_id=reference_id
        )
        db.session.add(notification)
        db.session.commit()
        
        # Send email if configured
        if send_email:
            email = NotificationService._get_user_email(user_type, user_id)
            if email:
                email_sent = NotificationService.send_email(email, title, message)
                notification.email_sent = email_sent
                db.session.commit()
        
        return notification
    
    @staticmethod
    def _get_user_email(user_type, user_id):
        """Get email address for a user"""
        if user_type == 'student':
            student = Student.query.get(user_id)
            return student.email if student else None
        elif user_type == 'staff':
            staff = Staff.query.get(user_id)
            return staff.email if staff else None
        return None
    
    @staticmethod
    def send_email(to_email, subject, body, html_body=None, background=True):
        """Send an email using SMTP. If background=True, sends in a separate thread."""
        try:
            mail_server = current_app.config.get('MAIL_SERVER')
            mail_port = current_app.config.get('MAIL_PORT')
            mail_username = current_app.config.get('MAIL_USERNAME')
            mail_password = current_app.config.get('MAIL_PASSWORD')
            mail_sender = current_app.config.get('MAIL_DEFAULT_SENDER')
            use_tls = current_app.config.get('MAIL_USE_TLS', True)
            
            # If no email credentials configured, log and return
            if not mail_username or not mail_password:
                current_app.logger.info(f"Email not sent (no credentials): {subject} to {to_email}")
                return False
            
            if background:
                # Send email in background thread
                app = current_app._get_current_object()
                thread = threading.Thread(
                    target=_send_email_background,
                    args=(app, to_email, subject, body, html_body, mail_server, mail_port, mail_username, mail_password, mail_sender, use_tls)
                )
                thread.daemon = True
                thread.start()
                current_app.logger.info(f"Email queued (background): {subject} to {to_email}")
                return True
            else:
                # Send email synchronously
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = mail_sender
                msg['To'] = to_email
                
                text_part = MIMEText(body, 'plain')
                msg.attach(text_part)
                
                if html_body:
                    html_part = MIMEText(html_body, 'html')
                    msg.attach(html_part)
                
                with smtplib.SMTP(mail_server, mail_port) as server:
                    if use_tls:
                        server.starttls()
                    server.login(mail_username, mail_password)
                    server.sendmail(mail_sender, to_email, msg.as_string())
                
                current_app.logger.info(f"Email sent: {subject} to {to_email}")
                return True
            
        except Exception as e:
            current_app.logger.error(f"Failed to send email: {str(e)}")
            return False
    
    # ==========================================
    # Assignment Notification Methods
    # ==========================================
    
    @staticmethod
    def notify_assignment_submitted(submission):
        """Notify student that their assignment was submitted successfully AND notify staff"""
        student = Student.query.get(submission.student_id)
        assignment = Assignment.query.get(submission.assignment_id)
        
        if not student or not assignment:
            return None
        
        # 1. Notify Student
        title = "Assignment Submitted Successfully"
        message = f"""Dear {student.full_name},

Your assignment "{assignment.title}" has been submitted successfully.

Submission Details:
- Assignment: {assignment.title}
- Submitted At: {submission.submitted_at.strftime('%B %d, %Y at %I:%M %p')}
- Status: Pending Review

Your teacher will review your submission and provide feedback soon.

Best regards,
LLS Team"""

        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">✅ Assignment Submitted</h1>
                </div>
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                    <p>Dear <strong>{student.full_name}</strong>,</p>
                    <p>Your assignment has been submitted successfully!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
                        <h3 style="margin: 0 0 10px 0; color: #374151;">📝 {assignment.title}</h3>
                        <p style="margin: 5px 0; color: #6b7280;">
                            <strong>Submitted:</strong> {submission.submitted_at.strftime('%B %d, %Y at %I:%M %p')}
                        </p>
                        <p style="margin: 5px 0; color: #6b7280;">
                            <strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span>
                        </p>
                    </div>
                    
                    <p>Your teacher will review your submission and provide feedback soon.</p>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        Best regards,<br>
                        <strong>LLS Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        notification = NotificationService.create_notification(
            user_type='student',
            user_id=student.id,
            title=title,
            message=message,
            notification_type='assignment_submitted',
            reference_type='submission',
            reference_id=submission.id,
            send_email=False  # We'll send HTML email manually
        )
        
        # Send HTML email to student
        if student.email:
            NotificationService.send_email(student.email, title, message, html_message)
            notification.email_sent = True
            db.session.commit()

        # 2. Notify Staff (if assigned)
        if assignment.staff_id:
            staff = Staff.query.get(assignment.staff_id)
            if staff:
                staff_title = f"New Submission: {assignment.title}"
                staff_message = f"""Dear {staff.full_name},

Student {student.full_name} ({student.student_code}) has submitted an assignment.

Details:
- Assignment: {assignment.title}
- Student: {student.full_name}
- Submitted At: {submission.submitted_at.strftime('%B %d, %Y at %I:%M %p')}

Please review and grade the submission.

Best regards,
LLS Team"""

                staff_html_message = f"""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">📥 New Submission</h1>
                        </div>
                        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                            <p>Dear <strong>{staff.full_name}</strong>,</p>
                            <p><strong>{student.full_name}</strong> ({student.student_code}) has submitted an assignment.</p>
                            
                            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
                                <h3 style="margin: 0 0 10px 0; color: #374151;">📝 {assignment.title}</h3>
                                <p style="margin: 5px 0; color: #6b7280;">
                                    <strong>Submitted:</strong> {submission.submitted_at.strftime('%B %d, %Y at %I:%M %p')}
                                </p>
                            </div>
                            
                            <p>Please review and grade the submission in your dashboard.</p>
                            
                            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                                Best regards,<br>
                                <strong>LLS Team</strong>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """

                # Create notification for staff
                NotificationService.create_notification(
                    user_type='staff',
                    user_id=staff.id,
                    title=staff_title,
                    message=staff_message,
                    notification_type='assignment_submission_received',
                    reference_type='submission',
                    reference_id=submission.id,
                    send_email=False
                )

                # Send email to staff
                if staff.email:
                    NotificationService.send_email(staff.email, staff_title, staff_message, staff_html_message)

        return notification
    
    @staticmethod
    def notify_assignment_graded(evaluation):
        """Notify student that their assignment has been graded"""
        submission = Submission.query.get(evaluation.submission_id)
        if not submission:
            return None
            
        student = Student.query.get(submission.student_id)
        assignment = Assignment.query.get(submission.assignment_id)
        
        if not student or not assignment:
            return None
        
        title = f"Assignment Graded: {assignment.title}"
        message = f"""Dear {student.full_name},

Great news! Your assignment "{assignment.title}" has been graded.

Results:
- Marks Obtained: {evaluation.marks_obtained} / {assignment.max_marks}
- Status: Evaluated

Teacher's Feedback:
{evaluation.feedback or 'No additional feedback provided.'}

You can view your detailed results in your student portal.

Best regards,
LLS Team"""

        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">📊 Assignment Graded</h1>
                </div>
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                    <p>Dear <strong>{student.full_name}</strong>,</p>
                    <p>Great news! Your assignment has been graded.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
                        <h3 style="margin: 0 0 10px 0; color: #374151;">📝 {assignment.title}</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #10b981;">
                                    {evaluation.marks_obtained} / {assignment.max_marks}
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">Marks Obtained</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #92400e;">💬 Teacher's Feedback</h4>
                        <p style="margin: 0; color: #78350f;">{evaluation.feedback or 'No additional feedback provided.'}</p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        Best regards,<br>
                        <strong>LLS Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        notification = NotificationService.create_notification(
            user_type='student',
            user_id=student.id,
            title=title,
            message=message,
            notification_type='assignment_graded',
            reference_type='evaluation',
            reference_id=evaluation.id,
            send_email=False
        )
        
        if student.email:
            email_sent = NotificationService.send_email(student.email, title, message, html_message)
            notification.email_sent = email_sent
            db.session.commit()
        
        return notification
    
    @staticmethod
    def notify_new_study_material(material):
        """Notify all students in a course that new study material is available"""
        # Local import to avoid circular dependency
        from models import StaffCourse, Course, StudentCourse, Student
        
        staff_course = StaffCourse.query.get(material.staff_course_id)
        if not staff_course:
            return
            
        course = Course.query.get(staff_course.course_id)
        if not course:
            return

        # Find all students enrolled in this course
        # Method 1: Via StudentCourse enrollment table
        student_courses = StudentCourse.query.filter_by(course_id=course.id, status='active').all()
        enrolled_student_ids = {sc.student_id for sc in student_courses}
        
        # Method 2: Via program_id and semester_id matching (fallback)
        if course.program_id and course.semester_id:
            program_students = Student.query.filter_by(
                program_id=course.program_id,
                semester_id=course.semester_id
            ).all()
            for s in program_students:
                enrolled_student_ids.add(s.id)
        
        # Get all unique students
        students = Student.query.filter(Student.id.in_(enrolled_student_ids)).all() if enrolled_student_ids else []
        
        for student in students:
            if not student:
                continue
                
            title = f"📚 New Study Material: {material.title}"
            message = f"""Dear {student.full_name},

New study material has been uploaded for your course "{course.course_name}".

Material Details:
- Title: {material.title}
- Type: {material.file_type.capitalize()}
- Course: {course.course_name}
- Uploaded At: {material.upload_date.strftime('%B %d, %Y at %I:%M %p')}

You can access the new material in your student dashboard.

Best regards,
LLS Team"""

            html_message = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">📚 New Study Material</h1>
                    </div>
                    <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                        <p>Dear <strong>{student.full_name}</strong>,</p>
                        <p>New study material has been uploaded for your course.</p>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
                            <h3 style="margin: 0 0 10px 0; color: #374151;">📖 {material.title}</h3>
                            <p style="margin: 5px 0; color: #6b7280;">
                                <strong>Course:</strong> {course.course_name}
                            </p>
                            <p style="margin: 5px 0; color: #6b7280;">
                                <strong>Type:</strong> {material.file_type.capitalize()}
                            </p>
                            <p style="margin: 5px 0; color: #6b7280;">
                                <strong>Uploaded:</strong> {material.upload_date.strftime('%B %d, %Y at %I:%M %p')}
                            </p>
                        </div>
                        
                        <p>Log in to your dashboard to view or download the material.</p>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                            Best regards,<br>
                            <strong>LLS Team</strong>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            notification = NotificationService.create_notification(
                user_type='student',
                user_id=student.id,
                title=title,
                message=message,
                notification_type='new_study_material',
                reference_type='study_material',
                reference_id=material.id,
                send_email=False
            )
            
            if student.email:
                email_sent = NotificationService.send_email(student.email, title, message, html_message)
                notification.email_sent = email_sent
                db.session.commit()

    @staticmethod
    def notify_new_assignment(assignment):
        """Notify all students in a course that a new assignment has been posted"""
        from models import Course, StudentCourse, Student
        
        course = Course.query.get(assignment.course_id)
        if not course:
            return

        # Find all students enrolled in this course
        # Method 1: Via StudentCourse enrollment table
        student_courses = StudentCourse.query.filter_by(course_id=course.id, status='active').all()
        enrolled_student_ids = {sc.student_id for sc in student_courses}
        
        # Method 2: Via program_id and semester_id matching (fallback)
        if course.program_id and course.semester_id:
            program_students = Student.query.filter_by(
                program_id=course.program_id,
                semester_id=course.semester_id
            ).all()
            for s in program_students:
                enrolled_student_ids.add(s.id)
        
        # Get all unique students
        students = Student.query.filter(Student.id.in_(enrolled_student_ids)).all() if enrolled_student_ids else []
        
        for student in students:
            if not student:
                continue
                
            title = f"📝 New Assignment: {assignment.title}"
            due_date_str = assignment.due_date.strftime('%B %d, %Y at %I:%M %p') if assignment.due_date else "Not set"
            
            message = f"""Dear {student.full_name},

A new assignment has been posted for your course "{course.course_name}".

Assignment Details:
- Title: {assignment.title}
- Course: {course.course_name}
- Due Date: {due_date_str}
- Max Marks: {assignment.max_marks}

Please check the assignment details and submit your work before the deadline.

Best regards,
LLS Team"""

            html_message = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">📝 New Assignment Posted</h1>
                    </div>
                    <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                        <p>Dear <strong>{student.full_name}</strong>,</p>
                        <p>A new assignment has been posted for your course.</p>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
                            <h3 style="margin: 0 0 10px 0; color: #374151;">📄 {assignment.title}</h3>
                            <p style="margin: 5px 0; color: #6b7280;">
                                <strong>Course:</strong> {course.course_name}
                            </p>
                            <p style="margin: 5px 0; color: #6b7280;">
                                <strong>Due Date:</strong> {due_date_str}
                            </p>
                            <p style="margin: 5px 0; color: #6b7280;">
                                <strong>Max Marks:</strong> {assignment.max_marks}
                            </p>
                        </div>
                        
                        <p>Make sure to review the requirements and submit your work on time.</p>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                            Best regards,<br>
                            <strong>LLS Team</strong>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            notification = NotificationService.create_notification(
                user_type='student',
                user_id=student.id,
                title=title,
                message=message,
                notification_type='new_assignment',
                reference_type='assignment',
                reference_id=assignment.id,
                send_email=False
            )
            
            if student.email:
                email_sent = NotificationService.send_email(student.email, title, message, html_message)
                notification.email_sent = email_sent
                db.session.commit()

    @staticmethod
    def notify_deadline_reminder(assignment, student):
        """Send deadline reminder for an upcoming assignment"""
        days_left = (assignment.due_date - datetime.utcnow()).days
        
        title = f"⏰ Assignment Deadline Reminder: {assignment.title}"
        message = f"""Dear {student.full_name},

This is a friendly reminder that you have an upcoming assignment deadline.

Assignment Details:
- Title: {assignment.title}
- Due Date: {assignment.due_date.strftime('%B %d, %Y at %I:%M %p')}
- Time Remaining: {days_left} day(s)

Please make sure to submit your assignment before the deadline.

Best regards,
LLS Team"""

        urgency_color = "#ef4444" if days_left <= 1 else "#f59e0b" if days_left <= 3 else "#3b82f6"
        
        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: {urgency_color}; padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">⏰ Deadline Reminder</h1>
                </div>
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                    <p>Dear <strong>{student.full_name}</strong>,</p>
                    <p>This is a friendly reminder about your upcoming assignment deadline.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid {urgency_color};">
                        <h3 style="margin: 0 0 10px 0; color: #374151;">📝 {assignment.title}</h3>
                        <p style="margin: 5px 0; color: #6b7280;">
                            <strong>Due Date:</strong> {assignment.due_date.strftime('%B %d, %Y at %I:%M %p')}
                        </p>
                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: {urgency_color};">
                            ⏳ {days_left} day(s) remaining
                        </p>
                    </div>
                    
                    <p style="background: #fef3c7; padding: 10px; border-radius: 5px; color: #92400e;">
                        ⚠️ Please submit your assignment before the deadline to avoid late penalties.
                    </p>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        Best regards,<br>
                        <strong>LLS Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        notification = NotificationService.create_notification(
            user_type='student',
            user_id=student.id,
            title=title,
            message=message,
            notification_type='deadline_reminder',
            reference_type='assignment',
            reference_id=assignment.id,
            send_email=False
        )
        
        if student.email:
            email_sent = NotificationService.send_email(student.email, title, message, html_message)
            notification.email_sent = email_sent
            db.session.commit()
        
        return notification

    @staticmethod
    def get_user_notifications(user_type, user_id, unread_only=False, limit=50):
        """Get notifications for a user"""
        query = Notification.query.filter_by(
            user_type=user_type,
            user_id=user_id
        )
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def get_unread_count(user_type, user_id):
        """Get count of unread notifications"""
        return Notification.query.filter_by(
            user_type=user_type,
            user_id=user_id,
            is_read=False
        ).count()
    
    @staticmethod
    def mark_as_read(notification_id):
        """Mark a notification as read"""
        notification = Notification.query.get(notification_id)
        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.session.commit()
        return notification
    
    @staticmethod
    def mark_all_as_read(user_type, user_id):
        """Mark all notifications as read for a user"""
        Notification.query.filter_by(
            user_type=user_type,
            user_id=user_id,
            is_read=False
        ).update({
            'is_read': True,
            'read_at': datetime.utcnow()
        })
        db.session.commit()


def send_deadline_reminders():
    """
    Scheduled task to send deadline reminders
    Should be called by a scheduler (e.g., cron job or APScheduler)
    """
    from models import Assignment, Student, Submission, StaffCourse, StudentEnrollment
    
    # Get assignments due in the next 3 days
    now = datetime.utcnow()
    deadline_threshold = now + timedelta(days=3)
    
    upcoming_assignments = Assignment.query.filter(
        Assignment.due_date > now,
        Assignment.due_date <= deadline_threshold
    ).all()
    
    for assignment in upcoming_assignments:
        # Get course for this assignment
        course_id = assignment.course_id
        
        # Get all students enrolled in this course
        # This depends on your enrollment logic
        enrolled_students = Student.query.all()  # Simplified - adjust based on your enrollment model
        
        for student in enrolled_students:
            # Check if student already submitted
            existing_submission = Submission.query.filter_by(
                assignment_id=assignment.id,
                student_id=student.id
            ).first()
            
            if not existing_submission:
                # Check if we already sent a reminder today
                existing_reminder = Notification.query.filter_by(
                    user_type='student',
                    user_id=student.id,
                    notification_type='deadline_reminder',
                    reference_id=assignment.id
                ).filter(
                    Notification.created_at >= now.replace(hour=0, minute=0, second=0)
                ).first()
                
                if not existing_reminder:
                    NotificationService.notify_deadline_reminder(assignment, student)
