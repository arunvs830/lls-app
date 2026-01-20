# Communication & Feedback API Testing Guide

## Quick Test Commands

### Prerequisites
```bash
# Backend server must be running
cd backend
python3 app.py
# Server should be at http://localhost:6000
```

---

## Communication API Tests

### 1. Send a Message (Student to Staff)
```bash
curl -X POST http://localhost:6000/api/communications \
  -H "Content-Type: application/json" \
  -d '{
    "sender_type": "student",
    "sender_id": 1,
    "receiver_type": "staff",
    "receiver_id": 1,
    "subject": "Question about Assignment",
    "message": "Hello, I have a question about the recent assignment. Could you please help?"
  }'
```

Expected Response:
```json
{
  "id": 1,
  "message": "Message sent successfully"
}
```

### 2. Get Inbox Messages
```bash
# Get staff inbox
curl http://localhost:6000/api/communications/inbox/staff/1

# Get student inbox
curl http://localhost:6000/api/communications/inbox/student/1
```

Expected Response:
```json
[
  {
    "id": 1,
    "sender_type": "student",
    "sender_id": 1,
    "sender_name": "John Doe",
    "subject": "Question about Assignment",
    "message": "Hello, I have a question...",
    "is_read": false,
    "sent_at": "2025-01-17T10:30:00",
    "read_at": null
  }
]
```

### 3. Get Sent Messages
```bash
curl http://localhost:6000/api/communications/sent/student/1
```

### 4. Get Specific Message
```bash
curl http://localhost:6000/api/communications/1
```

### 5. Mark Message as Read
```bash
curl -X PUT http://localhost:6000/api/communications/1/read
```

Expected Response:
```json
{
  "message": "Message marked as read"
}
```

### 6. Get Unread Count
```bash
curl http://localhost:6000/api/communications/unread-count/staff/1
```

Expected Response:
```json
{
  "unread_count": 3
}
```

### 7. Delete Message
```bash
curl -X DELETE http://localhost:6000/api/communications/1
```

---

## Feedback API Tests

### 1. Submit Course Feedback
```bash
curl -X POST http://localhost:6000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "course_id": 1,
    "rating": 5,
    "feedback_text": "Excellent course! Very well structured and the instructor was great.",
    "is_anonymous": false
  }'
```

Expected Response:
```json
{
  "id": 1,
  "message": "Feedback submitted successfully"
}
```

### 2. Submit Staff Feedback
```bash
curl -X POST http://localhost:6000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "staff_id": 1,
    "rating": 4,
    "feedback_text": "Very helpful and responsive instructor.",
    "is_anonymous": false
  }'
```

### 3. Submit Anonymous Feedback
```bash
curl -X POST http://localhost:6000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "course_id": 2,
    "rating": 3,
    "feedback_text": "Course content could be improved.",
    "is_anonymous": true
  }'
```

### 4. Get All Feedback (Admin)
```bash
curl http://localhost:6000/api/feedback
```

Expected Response:
```json
[
  {
    "id": 1,
    "student_id": 1,
    "student_name": "John Doe",
    "course_id": 1,
    "course_name": "German A1",
    "staff_id": null,
    "staff_name": null,
    "rating": 5,
    "feedback_text": "Excellent course!",
    "is_anonymous": false,
    "submitted_at": "2025-01-17T10:30:00"
  },
  {
    "id": 2,
    "student_id": 1,
    "student_name": "Anonymous",
    "course_id": 2,
    "course_name": "German A2",
    "staff_id": null,
    "staff_name": null,
    "rating": 3,
    "feedback_text": "Course content could be improved.",
    "is_anonymous": true,
    "submitted_at": "2025-01-17T10:35:00"
  }
]
```

### 5. Get Course Feedback with Analytics
```bash
curl http://localhost:6000/api/feedback/course/1
```

Expected Response:
```json
{
  "feedbacks": [
    {
      "id": 1,
      "student_id": 1,
      "student_name": "John Doe",
      "rating": 5,
      "feedback_text": "Excellent course!",
      "submitted_at": "2025-01-17T10:30:00"
    }
  ],
  "total_count": 1,
  "average_rating": 5.0
}
```

### 6. Get Staff Feedback
```bash
curl http://localhost:6000/api/feedback/staff/1
```

### 7. Get Student's Submitted Feedback
```bash
curl http://localhost:6000/api/feedback/student/1
```

### 8. Get Specific Feedback
```bash
curl http://localhost:6000/api/feedback/1
```

### 9. Update Feedback
```bash
curl -X PUT http://localhost:6000/api/feedback/1 \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "feedback_text": "Updated: Still a great course!"
  }'
```

### 10. Delete Feedback
```bash
curl -X DELETE http://localhost:6000/api/feedback/1
```

---

## Integration Test Scenarios

### Scenario 1: Student Course Completion Flow

```bash
# 1. Student completes a course
# 2. Student submits feedback
curl -X POST http://localhost:6000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "course_id": 1,
    "rating": 5,
    "feedback_text": "Great course!",
    "is_anonymous": false
  }'

# 3. Check course feedback and ratings
curl http://localhost:6000/api/feedback/course/1
```

### Scenario 2: Staff Receives Feedback

```bash
# 1. Get feedback for specific staff member
curl http://localhost:6000/api/feedback/staff/1

# Response will show average rating and all feedback
```

### Scenario 3: Communication Flow

```bash
# 1. Student sends message to staff
curl -X POST http://localhost:6000/api/communications \
  -H "Content-Type: application/json" \
  -d '{
    "sender_type": "student",
    "sender_id": 1,
    "receiver_type": "staff",
    "receiver_id": 1,
    "subject": "Assignment Help",
    "message": "Need help with assignment 3"
  }'

# 2. Staff checks unread count
curl http://localhost:6000/api/communications/unread-count/staff/1

# 3. Staff reads inbox
curl http://localhost:6000/api/communications/inbox/staff/1

# 4. Staff marks message as read
curl -X PUT http://localhost:6000/api/communications/1/read

# 5. Staff sends reply
curl -X POST http://localhost:6000/api/communications \
  -H "Content-Type: application/json" \
  -d '{
    "sender_type": "staff",
    "sender_id": 1,
    "receiver_type": "student",
    "receiver_id": 1,
    "subject": "Re: Assignment Help",
    "message": "Sure, I can help. Here is the solution..."
  }'

# 6. Student checks inbox
curl http://localhost:6000/api/communications/inbox/student/1
```

---

## Expected Error Responses

### Missing Required Fields
```bash
curl -X POST http://localhost:6000/api/communications \
  -H "Content-Type: application/json" \
  -d '{"sender_type": "student"}'
```

Response:
```json
{
  "error": "Missing required fields"
}
```
Status: 400

### Invalid User Type
```bash
curl -X POST http://localhost:6000/api/communications \
  -H "Content-Type: application/json" \
  -d '{
    "sender_type": "invalid_type",
    "sender_id": 1,
    "receiver_type": "staff",
    "receiver_id": 1,
    "message": "Test"
  }'
```

Response:
```json
{
  "error": "Invalid sender or receiver type"
}
```
Status: 400

### Invalid Rating
```bash
curl -X POST http://localhost:6000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "course_id": 1,
    "rating": 10,
    "feedback_text": "Test"
  }'
```

Response:
```json
{
  "error": "Rating must be between 1 and 5"
}
```
Status: 400

### Resource Not Found
```bash
curl http://localhost:6000/api/communications/9999
```

Response:
```json
{
  "error": "404 Not Found"
}
```
Status: 404

---

## Database Verification

### Check if tables exist
```bash
cd backend
python3
```

```python
from app import app, db
from models import Communication, Feedback

with app.app_context():
    # Check Communication table
    comm_count = Communication.query.count()
    print(f"Communication messages: {comm_count}")
    
    # Check Feedback table
    fb_count = Feedback.query.count()
    print(f"Feedback entries: {fb_count}")
    
    # Show sample data
    if comm_count > 0:
        latest_msg = Communication.query.order_by(Communication.sent_at.desc()).first()
        print(f"Latest message: {latest_msg.subject}")
    
    if fb_count > 0:
        latest_fb = Feedback.query.order_by(Feedback.submitted_at.desc()).first()
        print(f"Latest feedback rating: {latest_fb.rating}/5")
```

---

## Postman Collection

If you prefer using Postman, here's a collection structure:

### Communication Collection
- Send Message (POST)
- Get Inbox (GET)
- Get Sent (GET)
- Get Message (GET)
- Mark as Read (PUT)
- Delete Message (DELETE)
- Get Unread Count (GET)

### Feedback Collection
- Submit Feedback (POST)
- Get All Feedback (GET)
- Get Course Feedback (GET)
- Get Staff Feedback (GET)
- Get Student Feedback (GET)
- Get Specific Feedback (GET)
- Update Feedback (PUT)
- Delete Feedback (DELETE)

---

## Success Criteria

✅ All communication endpoints return 200/201
✅ Messages can be sent and received
✅ Read/unread status updates correctly
✅ Unread count is accurate
✅ Feedback can be submitted with ratings 1-5
✅ Average ratings are calculated correctly
✅ Anonymous feedback hides student name
✅ Feedback can be retrieved by course/staff/student
✅ Error handling works as expected
✅ Database tables are populated correctly

---

## Troubleshooting

### Backend not starting
```bash
# Check if all dependencies are installed
cd backend
pip install -r requirements.txt

# Check for syntax errors
python3 -c "from routes import communication, feedback"
```

### Database errors
```bash
# Re-create database
cd backend
python3
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
```

### 404 errors
- Verify blueprints are registered in `routes/__init__.py`
- Check Flask app is running on correct port (6000)
- Ensure routes are imported correctly

### 500 errors
- Check backend console for error messages
- Verify database connection
- Check if required fields are provided

---

**Testing Status:** Ready  
**Date:** January 17, 2025  
**Version:** 1.0
