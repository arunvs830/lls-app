import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentDashboardApi } from '../../../services/api';
import '../../../styles/StudentCourseList.css';

const CourseList = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user'))?.id || 1;

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const data = await studentDashboardApi.getCourses(studentId);
            setCourses(data);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="scl-loading-container">
                <div className="scl-loading-spinner"></div>
                <p className="scl-loading-text">Loading your courses...</p>
            </div>
        );
    }

    return (
        <div className="student-course-list-container">
            <header className="scl-header">
                <div>
                    <h1 className="scl-title">My Courses</h1>
                    <p className="scl-subtitle">{courses.length} courses enrolled</p>
                </div>
            </header>

            {courses.length === 0 ? (
                <div className="scl-empty-state">
                    <span className="scl-empty-icon">📚</span>
                    <h3 className="scl-empty-title">No courses found</h3>
                    <p className="scl-empty-text">You are not enrolled in any courses yet.</p>
                </div>
            ) : (
                <div className="scl-course-grid">
                    {courses.map((course, index) => (
                        <div
                            key={course.id}
                            className="scl-course-card"
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
                            onClick={() => navigate(`/student/courses/${course.id}`)}
                        >
                            <div className="scl-course-header">
                                <div className="scl-course-icon">
                                    {getRandomEmoji(index)}
                                </div>
                                <span className="scl-course-code">{course.course_code}</span>
                            </div>

                            <h3 className="scl-course-name">{course.course_name}</h3>

                            <div className="scl-course-meta">
                                <div className="scl-meta-item">
                                    <span className="scl-meta-icon">📖</span>
                                    <span>{course.materials_count} Materials</span>
                                </div>
                                <div className="scl-meta-item">
                                    <span className="scl-meta-icon">📝</span>
                                    <span>{course.assignments_count} Assignments</span>
                                </div>
                            </div>

                            <div className="scl-course-footer">
                                <button className="scl-view-btn">
                                    View Course →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getRandomEmoji = (index) => {
    const emojis = ['🇩🇪', '📚', '🎓', '✍️', '🗣️', '💬', '🌍', '📖'];
    return emojis[index % emojis.length];
};

export default CourseList;
