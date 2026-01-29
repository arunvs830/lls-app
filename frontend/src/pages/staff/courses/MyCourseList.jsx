import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffCourseApi, courseApi } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/VideoLearning.css';

const MyCourseList = () => {
    const navigate = useNavigate();
    const { error: notifyError } = useNotification();
    const [myCourses, setMyCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const staffId = user?.id;

    const courseColors = [
        { bg: 'linear-gradient(135deg, #667eea, #764ba2)', icon: '🇩🇪' },
        { bg: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: '🇫🇷' },
        { bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: '🇪🇸' },
        { bg: 'linear-gradient(135deg, #43e97b, #38f9d7)', icon: '🇯🇵' },
        { bg: 'linear-gradient(135deg, #fa709a, #fee140)', icon: '🇨🇳' },
    ];

    useEffect(() => {
        if (staffId) {
            loadData();
        }
    }, [staffId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [allocations, courseData] = await Promise.all([
                staffCourseApi.getByStaff(staffId),
                courseApi.getAll()
            ]);
            // allocations already filtered by backend
            const myAllocations = allocations;
            setMyCourses(myAllocations);
            setCourses(courseData);
        } catch (error) {
            console.error('Error loading:', error);
            setError('Failed to load courses. Please try again later.');
            notifyError('Failed to load course list');
        } finally {
            setLoading(false);
        }
    };

    const getCourse = (id) => courses.find(c => c.id === id);

    if (loading) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#6B7280' }}>Loading courses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>Error Loading Courses</h3>
                <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>{error}</p>
                <button
                    onClick={loadData}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: '#1F2937',
                    marginBottom: '0.5rem'
                }}>
                    My Courses
                </h1>
                <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
                    Select a course to manage videos and study materials
                </p>
            </div>

            {/* Course Cards Grid */}
            <div className="course-grid">
                {myCourses.map((alloc, index) => {
                    const course = getCourse(alloc.course_id);
                    const colorScheme = courseColors[index % courseColors.length];
                    return (
                        <div
                            key={alloc.id}
                            className="course-card"
                            onClick={() => navigate(`/staff/course/${alloc.course_id}/videos`)}
                        >
                            <div className="course-thumbnail" style={{ background: colorScheme.bg }}>
                                <span>{colorScheme.icon}</span>
                            </div>
                            <div className="course-info">
                                <div className="course-title">{course?.course_name || 'Course'}</div>
                                <div className="course-meta">
                                    <span>📹 Videos</span>
                                    <span>📝 Materials</span>
                                </div>
                                <div className="course-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: '0%' }}></div>
                                    </div>
                                    <div className="progress-text">Click to manage</div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {myCourses.length === 0 && (
                    <div className="card" style={{
                        gridColumn: '1/-1',
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                        <h3 style={{ color: '#1F2937', marginBottom: '0.5rem' }}>No Courses Assigned</h3>
                        <p style={{ color: '#6B7280', maxWidth: '400px', margin: '0 auto' }}>
                            You haven't been assigned any courses yet. Please contact the administrator to get courses assigned to you.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourseList;
