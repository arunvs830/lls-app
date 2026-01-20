import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentDashboardApi, mcqApi } from '../../../services/api';

const QuizList = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const coursesData = await studentDashboardApi.getCourses(studentId);

            // For each course, get quiz info
            const coursesWithQuiz = await Promise.all(
                coursesData.map(async (course) => {
                    try {
                        const quiz = await mcqApi.getCourseQuiz(course.id, studentId);
                        return {
                            ...course,
                            total_questions: quiz.total_questions,
                            attempted_count: quiz.attempted_count
                        };
                    } catch {
                        return { ...course, total_questions: 0, attempted_count: 0 };
                    }
                })
            );

            setCourses(coursesWithQuiz);
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
                <p style={styles.loadingText}>Loading quizzes...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>My Quizzes</h1>
                <p style={styles.subtitle}>Test your knowledge with course quizzes</p>
            </header>

            {courses.length === 0 ? (
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📝</span>
                    <h3>No quizzes available</h3>
                    <p>Quizzes will appear here when your teachers create them.</p>
                </div>
            ) : (
                <div style={styles.courseGrid}>
                    {courses.map(course => (
                        <div key={course.id} style={styles.courseCard}>
                            <div style={styles.cardHeader}>
                                <span style={styles.courseCode}>{course.course_code}</span>
                                {course.attempted_count === course.total_questions && course.total_questions > 0 && (
                                    <span style={styles.completeBadge}>✓ Complete</span>
                                )}
                            </div>

                            <h3 style={styles.courseName}>{course.course_name}</h3>

                            <div style={styles.quizStats}>
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>{course.total_questions}</span>
                                    <span style={styles.statLabel}>Questions</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>{course.attempted_count}</span>
                                    <span style={styles.statLabel}>Attempted</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>
                                        {course.total_questions > 0
                                            ? Math.round((course.attempted_count / course.total_questions) * 100)
                                            : 0}%
                                    </span>
                                    <span style={styles.statLabel}>Progress</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={styles.progressBar}>
                                <div style={{
                                    ...styles.progressFill,
                                    width: `${course.total_questions > 0
                                        ? (course.attempted_count / course.total_questions) * 100
                                        : 0}%`
                                }}></div>
                            </div>

                            <button
                                onClick={() => navigate(`/student/quiz/${course.id}`)}
                                style={course.total_questions === 0 ? styles.disabledBtn : styles.startBtn}
                                disabled={course.total_questions === 0}
                            >
                                {course.total_questions === 0
                                    ? 'No questions yet'
                                    : course.attempted_count === course.total_questions
                                        ? 'Review Quiz'
                                        : 'Start Quiz →'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '24px' },
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
    loadingText: { marginTop: '16px', color: '#5C6873' },
    header: { marginBottom: '32px' },
    title: { color: '#21272A', fontSize: '2rem', fontWeight: '700', margin: 0 },
    subtitle: { color: '#5C6873', marginTop: '8px' },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        background: '#FFFFFF',
        borderRadius: '20px',
        color: '#5C6873',
        border: '1px solid #E3E5E8',
    },
    emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '16px' },
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
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    courseCode: {
        background: 'rgba(139, 92, 246, 0.15)',
        color: '#7c3aed',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    completeBadge: {
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    courseName: {
        color: '#21272A',
        fontSize: '1.25rem',
        fontWeight: '600',
        margin: '0 0 20px 0',
    },
    quizStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '16px',
    },
    statItem: {
        textAlign: 'center',
    },
    statNumber: {
        display: 'block',
        color: '#21272A',
        fontSize: '1.5rem',
        fontWeight: '700',
    },
    statLabel: {
        color: '#5C6873',
        fontSize: '0.8rem',
    },
    progressBar: {
        height: '6px',
        background: '#E3E5E8',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '20px',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
        borderRadius: '3px',
        transition: 'width 0.3s ease',
    },
    startBtn: {
        width: '100%',
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'none',
        color: 'white',
        padding: '14px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '1rem',
    },
    disabledBtn: {
        width: '100%',
        background: '#F5F7FA',
        border: '1px solid #E3E5E8',
        color: '#8F96A1',
        padding: '14px',
        borderRadius: '12px',
        cursor: 'not-allowed',
        fontWeight: '600',
        fontSize: '1rem',
    },
};

export default QuizList;
