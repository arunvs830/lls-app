import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentDashboardApi } from '../../../services/api';

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
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading your courses...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>My Courses</h1>
                    <p style={styles.subtitle}>{courses.length} courses enrolled</p>
                </div>
            </header>

            {courses.length === 0 ? (
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📚</span>
                    <h3 style={styles.emptyTitle}>No courses found</h3>
                    <p style={styles.emptyText}>You are not enrolled in any courses yet.</p>
                </div>
            ) : (
                <div style={styles.courseGrid}>
                    {courses.map((course, index) => (
                        <div
                            key={course.id}
                            style={{
                                ...styles.courseCard,
                                animationDelay: `${index * 0.1}s`
                            }}
                            onClick={() => navigate(`/student/courses/${course.id}`)}
                        >
                            <div style={styles.courseHeader}>
                                <div style={styles.courseIcon}>
                                    {getRandomEmoji(index)}
                                </div>
                                <span style={styles.courseCode}>{course.course_code}</span>
                            </div>

                            <h3 style={styles.courseName}>{course.course_name}</h3>

                            <div style={styles.courseMeta}>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaIcon}>📖</span>
                                    <span>{course.materials_count} Materials</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaIcon}>📝</span>
                                    <span>{course.assignments_count} Assignments</span>
                                </div>
                            </div>

                            <div style={styles.courseFooter}>
                                <button style={styles.viewBtn}>
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

const styles = {
    container: {
        padding: '24px',
        minHeight: '100vh',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
    loadingSpinner: {
        width: '48px',
        height: '48px',
        border: '4px solid rgba(139, 92, 246, 0.2)',
        borderTop: '4px solid #8b5cf6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '16px',
        color: '#5C6873',
    },

    header: {
        marginBottom: '32px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#21272A',
        margin: 0,
    },
    subtitle: {
        color: '#5C6873',
        marginTop: '8px',
    },

    courseGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
    },
    courseCard: {
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #E3E5E8',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    courseHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    courseIcon: {
        fontSize: '2.5rem',
    },
    courseCode: {
        background: 'rgba(139, 92, 246, 0.15)',
        color: '#7c3aed',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontWeight: '600',
        letterSpacing: '0.05em',
    },
    courseName: {
        color: '#21272A',
        fontSize: '1.3rem',
        fontWeight: '600',
        margin: '0 0 16px 0',
        lineHeight: '1.4',
    },
    courseMeta: {
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#5C6873',
        fontSize: '0.9rem',
    },
    metaIcon: {
        fontSize: '1rem',
    },
    courseFooter: {
        borderTop: '1px solid #E3E5E8',
        paddingTop: '16px',
    },
    viewBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'none',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        width: '100%',
        transition: 'transform 0.2s',
    },

    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E3E5E8',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    emptyIcon: {
        fontSize: '4rem',
        display: 'block',
        marginBottom: '16px',
    },
    emptyTitle: {
        color: '#21272A',
        fontSize: '1.5rem',
        margin: '0 0 8px 0',
    },
    emptyText: {
        color: '#5C6873',
    },
};

export default CourseList;
