import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/CourseEnrollment.css';

const API_BASE = import.meta.env.DEV ? '/api' : 'http://127.0.0.1:6000/api';

const CourseEnrollment = () => {
    const navigate = useNavigate();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Get student from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user.id;

    useEffect(() => {
        if (!studentId) {
            navigate('/login');
            return;
        }
        loadCourses();
    }, [studentId]);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const [enrolledRes, availableRes] = await Promise.all([
                fetch(`${API_BASE}/students/${studentId}/courses`),
                fetch(`${API_BASE}/students/${studentId}/courses/available`)
            ]);

            if (enrolledRes.ok) {
                const enrolled = await enrolledRes.json();
                setEnrolledCourses(enrolled);
            }

            if (availableRes.ok) {
                const available = await availableRes.json();
                setAvailableCourses(available);
            }
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseToggle = (courseId) => {
        setSelectedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleEnroll = async () => {
        if (selectedCourses.length === 0) {
            setError('Please select at least one course');
            return;
        }

        setEnrolling(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE}/students/${studentId}/courses/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_ids: selectedCourses })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Successfully enrolled in ${data.enrolled.length} course(s)`);
                setSelectedCourses([]);
                loadCourses(); // Refresh the lists
            } else {
                throw new Error(data.error || 'Enrollment failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setEnrolling(false);
        }
    };

    const handleDropCourse = async (courseId) => {
        if (!confirm('Are you sure you want to drop this course?')) return;

        try {
            const response = await fetch(`${API_BASE}/students/${studentId}/courses/${courseId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setSuccess('Course dropped successfully');
                loadCourses();
            } else {
                throw new Error('Failed to drop course');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="enrollment-page">
                <div className="loading">Loading courses...</div>
            </div>
        );
    }

    return (
        <div className="enrollment-page">
            <div className="page-header">
                <h1>Course Enrollment</h1>
                <p>Manage your course enrollments</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️</span> {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span>✅</span> {success}
                </div>
            )}

            {/* Enrolled Courses Section */}
            <section className="enrollment-section">
                <h2>My Enrolled Courses</h2>
                {enrolledCourses.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📚</span>
                        <p>You haven't enrolled in any courses yet</p>
                    </div>
                ) : (
                    <div className="course-grid">
                        {enrolledCourses.map(enrollment => (
                            <div key={enrollment.id} className="enrolled-card">
                                <div className="card-content">
                                    <span className="course-code">{enrollment.course_code}</span>
                                    <h3>{enrollment.course_name}</h3>
                                    <div className="enrollment-meta">
                                        <span className={`status-badge ${enrollment.status}`}>
                                            {enrollment.status}
                                        </span>
                                        <span className="enrolled-date">
                                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {enrollment.status === 'active' && (
                                    <button 
                                        className="btn-drop"
                                        onClick={() => handleDropCourse(enrollment.course_id)}
                                    >
                                        Drop
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Available Courses Section */}
            <section className="enrollment-section">
                <h2>Available Courses</h2>
                <p className="section-description">
                    Select courses to enroll in. These are courses available for your program and semester.
                </p>

                {availableCourses.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">✨</span>
                        <p>No additional courses available for enrollment</p>
                        <p className="hint">You may have already enrolled in all available courses</p>
                    </div>
                ) : (
                    <>
                        <div className="available-courses">
                            {availableCourses.map(course => (
                                <div 
                                    key={course.id}
                                    className={`available-card ${selectedCourses.includes(course.id) ? 'selected' : ''}`}
                                    onClick={() => handleCourseToggle(course.id)}
                                >
                                    <div className="checkbox">
                                        {selectedCourses.includes(course.id) ? '✓' : ''}
                                    </div>
                                    <div className="course-details">
                                        <span className="course-code">{course.course_code}</span>
                                        <span className="course-name">{course.course_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="enrollment-actions">
                            <span className="selected-count">
                                {selectedCourses.length} course(s) selected
                            </span>
                            <button 
                                className="btn-enroll"
                                onClick={handleEnroll}
                                disabled={enrolling || selectedCourses.length === 0}
                            >
                                {enrolling ? 'Enrolling...' : 'Enroll in Selected Courses'}
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default CourseEnrollment;
