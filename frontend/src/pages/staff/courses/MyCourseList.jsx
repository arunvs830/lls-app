import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffCourseApi, courseApi, studyMaterialApi } from '../../../services/api';
import '../../../styles/VideoLearning.css';

const MyCourseList = () => {
    const navigate = useNavigate();
    const [myCourses, setMyCourses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // TODO: Get actual staff ID from auth context
    const staffId = 1;

    const courseColors = [
        { bg: 'linear-gradient(135deg, #667eea, #764ba2)', icon: '🇩🇪' },
        { bg: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: '🇫🇷' },
        { bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: '🇪🇸' },
        { bg: 'linear-gradient(135deg, #43e97b, #38f9d7)', icon: '🇯🇵' },
        { bg: 'linear-gradient(135deg, #fa709a, #fee140)', icon: '🇨🇳' },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allocations, courseData] = await Promise.all([
                staffCourseApi.getAll(),
                courseApi.getAll()
            ]);
            const myAllocations = allocations.filter(a => a.staff_id === staffId);
            setMyCourses(myAllocations);
            setCourses(courseData);
        } catch (error) {
            console.error('Error loading:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCourse = (id) => courses.find(c => c.id === id);

    if (loading) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading courses...</p>
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
                    color: 'white',
                    marginBottom: '0.5rem'
                }}>
                    My Courses
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
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
                        background: 'rgba(30, 30, 50, 0.6)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Courses Assigned</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '0 auto' }}>
                            You haven't been assigned any courses yet. Please contact the administrator to get courses assigned to you.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourseList;
