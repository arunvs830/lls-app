# Communication & Feedback Features - Implementation Guide

## Overview

This document describes the newly implemented Communication and Feedback features that were defined in the database schema but previously missing from the application.

## Features Implemented

### 1. Communication System
Internal messaging system allowing students, staff, and admins to communicate with each other.

### 2. Feedback System
Allows students to provide ratings and feedback for courses and staff members.

---

## Communication Feature

### Database Model

```python
class Communication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_type = db.Column(db.String(20), nullable=False)  # 'student', 'staff', 'admin'
    sender_id = db.Column(db.Integer, nullable=False)
    receiver_type = db.Column(db.String(20), nullable=False)
    receiver_id = db.Column(db.Integer, nullable=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)
```

### Backend API Endpoints

**File:** `backend/routes/communication.py`

#### Send Message
```
POST /api/communications
Body: {
    "sender_type": "student|staff|admin",
    "sender_id": 1,
    "receiver_type": "student|staff|admin",
    "receiver_id": 2,
    "subject": "Optional subject",
    "message": "Message content"
}
```

#### Get Inbox
```
GET /api/communications/inbox/{user_type}/{user_id}
Returns: Array of received messages with sender details
```

#### Get Sent Messages
```
GET /api/communications/sent/{user_type}/{user_id}
Returns: Array of sent messages with receiver details
```

#### Get Specific Message
```
GET /api/communications/{message_id}
Returns: Full message details
```

#### Mark as Read
```
PUT /api/communications/{message_id}/read
Marks the message as read and sets read_at timestamp
```

#### Delete Message
```
DELETE /api/communications/{message_id}
```

#### Get Unread Count
```
GET /api/communications/unread-count/{user_type}/{user_id}
Returns: { "unread_count": 5 }
```

### Frontend API Service

**File:** `frontend/src/services/api.js`

```javascript
import { communicationApi } from './services/api';

// Send message
await communicationApi.send({
    sender_type: 'student',
    sender_id: 1,
    receiver_type: 'staff',
    receiver_id: 2,
    subject: 'Question about Assignment',
    message: 'I have a question...'
});

// Get inbox
const inbox = await communicationApi.getInbox('student', 1);

// Get sent messages
const sent = await communicationApi.getSent('student', 1);

// Mark as read
await communicationApi.markAsRead(messageId);

// Get unread count
const { unread_count } = await communicationApi.getUnreadCount('student', 1);
```

---

## Feedback Feature

### Database Model

```python
class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'))
    rating = db.Column(db.Integer)  # 1-5 stars
    feedback_text = db.Column(db.Text)
    is_anonymous = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
```

### Backend API Endpoints

**File:** `backend/routes/feedback.py`

#### Submit Feedback
```
POST /api/feedback
Body: {
    "student_id": 1,
    "course_id": 5,  // or "staff_id": 3
    "rating": 4,  // 1-5 (optional)
    "feedback_text": "Great course!",
    "is_anonymous": false
}
```

#### Get All Feedback (Admin)
```
GET /api/feedback
Returns: All feedback with student/course/staff details
```

#### Get Course Feedback
```
GET /api/feedback/course/{course_id}
Returns: {
    "feedbacks": [...],
    "total_count": 10,
    "average_rating": 4.2
}
```

#### Get Staff Feedback
```
GET /api/feedback/staff/{staff_id}
Returns: {
    "feedbacks": [...],
    "total_count": 15,
    "average_rating": 4.5
}
```

#### Get Student's Submitted Feedback
```
GET /api/feedback/student/{student_id}
Returns: Array of feedback submitted by the student
```

#### Get Specific Feedback
```
GET /api/feedback/{feedback_id}
```

#### Update Feedback
```
PUT /api/feedback/{feedback_id}
Body: {
    "rating": 5,
    "feedback_text": "Updated feedback",
    "is_anonymous": true
}
```

#### Delete Feedback
```
DELETE /api/feedback/{feedback_id}
```

### Frontend API Service

**File:** `frontend/src/services/api.js`

```javascript
import { feedbackApi } from './services/api';

// Submit feedback for a course
await feedbackApi.submit({
    student_id: 1,
    course_id: 5,
    rating: 4,
    feedback_text: 'Excellent course content!',
    is_anonymous: false
});

// Submit feedback for a staff member
await feedbackApi.submit({
    student_id: 1,
    staff_id: 3,
    rating: 5,
    feedback_text: 'Very helpful instructor',
    is_anonymous: false
});

// Get course feedback
const courseFeedback = await feedbackApi.getByCourse(5);
console.log(courseFeedback.average_rating); // 4.2

// Get staff feedback
const staffFeedback = await feedbackApi.getByStaff(3);

// Get student's submissions
const myFeedback = await feedbackApi.getByStudent(1);
```

---

## Frontend UI Components to Create

### Communication Components

#### 1. MessageInbox Component
**Location:** `frontend/src/pages/student/messages/Inbox.jsx`

```jsx
import { communicationApi } from '../../../services/api';

Features:
- List of received messages
- Mark as read functionality
- Delete messages
- Unread badge indicator
- Search/filter messages
```

#### 2. MessageCompose Component
**Location:** `frontend/src/pages/student/messages/Compose.jsx`

```jsx
Features:
- Select receiver (staff/admin)
- Subject field
- Message body
- Send button
```

#### 3. MessageView Component
**Location:** `frontend/src/pages/student/messages/View.jsx`

```jsx
Features:
- Display full message
- Reply functionality
- Delete option
- Mark as read automatically
```

### Feedback Components

#### 1. FeedbackForm Component
**Location:** `frontend/src/pages/student/feedback/FeedbackForm.jsx`

```jsx
import { feedbackApi } from '../../../services/api';

Features:
- Course/Staff selection dropdown
- Star rating (1-5)
- Feedback text area
- Anonymous checkbox
- Submit button
```

#### 2. CourseFeedbackList Component
**Location:** `frontend/src/pages/staff/courses/FeedbackList.jsx`

```jsx
Features:
- Display feedback for their courses
- Average rating display
- Individual feedback cards
- Filter by course
- Anonymous feedback handling
```

#### 3. FeedbackDashboard Component
**Location:** `frontend/src/pages/admin/feedback/Dashboard.jsx`

```jsx
Features:
- View all feedback
- Filter by course/staff
- Analytics (average ratings, trends)
- Export functionality
```

---

## Usage Examples

### For Students

**Send a Message:**
```javascript
// In student dashboard or course page
const sendMessage = async () => {
    await communicationApi.send({
        sender_type: 'student',
        sender_id: currentUser.id,
        receiver_type: 'staff',
        receiver_id: staffId,
        subject: 'Question about Assignment 1',
        message: 'Can you please clarify...'
    });
};
```

**Submit Course Feedback:**
```javascript
// After completing a course
const submitFeedback = async () => {
    await feedbackApi.submit({
        student_id: currentUser.id,
        course_id: courseId,
        rating: 5,
        feedback_text: 'Excellent course!',
        is_anonymous: false
    });
};
```

### For Staff

**Check Messages:**
```javascript
// In staff dashboard
const loadMessages = async () => {
    const inbox = await communicationApi.getInbox('staff', currentUser.id);
    const unreadCount = await communicationApi.getUnreadCount('staff', currentUser.id);
};
```

**View Course Feedback:**
```javascript
// In course management page
const loadCourseFeedback = async (courseId) => {
    const feedback = await feedbackApi.getByCourse(courseId);
    console.log(`Average Rating: ${feedback.average_rating}/5`);
    console.log(`Total Feedback: ${feedback.total_count}`);
};
```

### For Admin

**Monitor All Feedback:**
```javascript
// In admin dashboard
const loadAllFeedback = async () => {
    const allFeedback = await feedbackApi.getAll();
    // Display analytics, charts, etc.
};
```

---

## Integration with Existing Features

### 1. Update Header Component
Add message notification icon with unread count:

```jsx
// src/components/Header.jsx
import { Bell, Mail } from 'lucide-react';

const [unreadMessages, setUnreadMessages] = useState(0);

useEffect(() => {
    const fetchUnreadCount = async () => {
        const { unread_count } = await communicationApi.getUnreadCount(
            userType, 
            userId
        );
        setUnreadMessages(unread_count);
    };
    fetchUnreadCount();
}, []);

<button className="icon-btn">
    <Mail size={20} />
    {unreadMessages > 0 && (
        <span className="notification-badge">{unreadMessages}</span>
    )}
</button>
```

### 2. Add to Sidebar Navigation

```jsx
// Add to student/staff sidebars
<NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <Mail className="nav-icon" size={20} />
    Messages
    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
</NavLink>

<NavLink to="/feedback" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <MessageSquare className="nav-icon" size={20} />
    Feedback
</NavLink>
```

### 3. Add Feedback Button to Course Pages

```jsx
// In CourseDetails or CourseMaterials components
<button onClick={() => navigate('/feedback/new', { state: { courseId } })}>
    <Star size={18} />
    Rate this Course
</button>
```

---

## Database Tables Already Exist

Both `communication` and `feedback` tables are already defined in your database schema (models.py). No migration needed - the tables should already exist.

To verify:
```bash
cd backend
python
>>> from app import app, db
>>> from models import Communication, Feedback
>>> with app.app_context():
...     print(Communication.query.count())
...     print(Feedback.query.count())
```

---

## Testing the APIs

### Test Communication API

```bash
# Send a message
curl -X POST http://localhost:6000/api/communications \
  -H "Content-Type: application/json" \
  -d '{
    "sender_type": "student",
    "sender_id": 1,
    "receiver_type": "staff",
    "receiver_id": 1,
    "subject": "Test Message",
    "message": "Hello, this is a test"
  }'

# Get inbox
curl http://localhost:6000/api/communications/inbox/staff/1

# Get unread count
curl http://localhost:6000/api/communications/unread-count/staff/1
```

### Test Feedback API

```bash
# Submit feedback
curl -X POST http://localhost:6000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "course_id": 1,
    "rating": 5,
    "feedback_text": "Great course!",
    "is_anonymous": false
  }'

# Get course feedback
curl http://localhost:6000/api/feedback/course/1

# Get staff feedback
curl http://localhost:6000/api/feedback/staff/1
```

---

## Next Steps

1. **Create Frontend UI Components** (as outlined above)
2. **Add Navigation Links** in sidebars
3. **Add Notification Icons** in header
4. **Create Message Pages** (Inbox, Compose, View)
5. **Create Feedback Pages** (Submit, View, Analytics)
6. **Add Real-time Updates** (optional - using WebSockets)
7. **Add Email Notifications** (optional - when messages received)

---

## Summary

**✅ Completed:**
- Backend API routes for Communication (7 endpoints)
- Backend API routes for Feedback (9 endpoints)
- Frontend API service functions
- Registered blueprints in Flask app
- Complete documentation

**⏳ To Do:**
- Create frontend UI components
- Add navigation menu items
- Integrate with existing dashboards
- Add notification system
- Create analytics/reporting pages

**Files Created:**
- `backend/routes/communication.py`
- `backend/routes/feedback.py`
- Updated: `backend/routes/__init__.py`
- Updated: `frontend/src/services/api.js`
- This documentation file

---

**Version:** 1.0  
**Date:** January 17, 2025  
**Status:** Backend Complete, Frontend UI Pending  
**Priority:** HIGH - Core features from DFD
