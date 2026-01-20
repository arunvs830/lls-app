import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mcqApi } from '../../../services/api';

const QuizResults = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const data = await mcqApi.getStudentResults(studentId);
            setResults(data);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 80) return '#10b981';
        if (percentage >= 60) return '#3b82f6';
        if (percentage >= 40) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading results...</p>
            </div>
        );
    }

    const overallPercentage = results?.total_attempts > 0
        ? Math.round((results.total_correct / results.total_attempts) * 100)
        : 0;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Quiz Results</h1>
                <p style={styles.subtitle}>Your quiz performance overview</p>
            </header>

            {/* Overall Stats */}
            <div style={styles.overallCard}>
                <div style={styles.mainScore}>
                    <div style={{
                        ...styles.scoreCircle,
                        borderColor: getGradeColor(overallPercentage)
                    }}>
                        <span style={{ ...styles.scorePercentage, color: getGradeColor(overallPercentage) }}>
                            {overallPercentage}%
                        </span>
                        <span style={styles.scoreLabel}>Overall</span>
                    </div>
                </div>
                <div style={styles.statsRow}>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{results?.total_attempts || 0}</span>
                        <span style={styles.statLabel}>Questions Attempted</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={{ ...styles.statValue, color: '#10b981' }}>{results?.total_correct || 0}</span>
                        <span style={styles.statLabel}>Correct Answers</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={{ ...styles.statValue, color: '#ef4444' }}>
                            {(results?.total_attempts || 0) - (results?.total_correct || 0)}
                        </span>
                        <span style={styles.statLabel}>Incorrect</span>
                    </div>
                </div>
            </div>

            {/* Course-wise Results */}
            <h2 style={styles.sectionTitle}>Results by Course</h2>

            {(!results?.course_results || results.course_results.length === 0) ? (
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📊</span>
                    <p>No quiz attempts yet. Take some quizzes to see your results!</p>
                    <button onClick={() => navigate('/student/quiz')} style={styles.actionBtn}>
                        Browse Quizzes →
                    </button>
                </div>
            ) : (
                <div style={styles.courseList}>
                    {results.course_results.map(course => (
                        <div key={course.course_id} style={styles.courseCard}>
                            <div style={styles.courseHeader}>
                                <div>
                                    <span style={styles.courseCode}>{course.course_code}</span>
                                    <h3 style={styles.courseName}>{course.course_name}</h3>
                                </div>
                                <div style={{
                                    ...styles.percentBadge,
                                    backgroundColor: `${getGradeColor(course.percentage)}15`,
                                    color: getGradeColor(course.percentage)
                                }}>
                                    {course.percentage}%
                                </div>
                            </div>

                            <div style={styles.courseStats}>
                                <div style={styles.statItem}>
                                    <span style={styles.statItemValue}>{course.total_attempted}</span>
                                    <span style={styles.statItemLabel}>Attempted</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={{ ...styles.statItemValue, color: '#10b981' }}>{course.correct_count}</span>
                                    <span style={styles.statItemLabel}>Correct</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statItemValue}>{course.earned_marks}/{course.total_marks}</span>
                                    <span style={styles.statItemLabel}>Marks</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={styles.progressBar}>
                                <div style={{
                                    ...styles.progressFill,
                                    width: `${course.percentage}%`,
                                    background: getGradeColor(course.percentage)
                                }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action */}
            <div style={styles.actionsRow}>
                <button onClick={() => navigate('/student/quiz')} style={styles.primaryBtn}>
                    Take More Quizzes
                </button>
                <button onClick={() => navigate('/student')} style={styles.secondaryBtn}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
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
    header: { marginBottom: '32px', textAlign: 'center' },
    title: { color: '#21272A', fontSize: '2rem', fontWeight: '700', margin: 0 },
    subtitle: { color: '#5C6873', marginTop: '8px' },

    overallCard: {
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid #E3E5E8',
        marginBottom: '32px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    mainScore: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    scoreCircle: {
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        border: '6px solid',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scorePercentage: {
        fontSize: '2.5rem',
        fontWeight: '700',
    },
    scoreLabel: {
        color: '#5C6873',
        fontSize: '0.9rem',
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
    },
    statBox: {
        textAlign: 'center',
        padding: '16px',
        background: '#F5F7FA',
        borderRadius: '12px',
    },
    statValue: {
        display: 'block',
        color: '#21272A',
        fontSize: '1.75rem',
        fontWeight: '700',
    },
    statLabel: {
        color: '#5C6873',
        fontSize: '0.85rem',
    },

    sectionTitle: {
        color: '#21272A',
        fontSize: '1.25rem',
        marginBottom: '16px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        background: '#FFFFFF',
        borderRadius: '20px',
        color: '#5C6873',
        border: '1px solid #E3E5E8',
    },
    emptyIcon: { fontSize: '3rem', display: 'block', marginBottom: '12px' },
    actionBtn: {
        marginTop: '16px',
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'none',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '10px',
        cursor: 'pointer',
    },

    courseList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '32px',
    },
    courseCard: {
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #E3E5E8',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    courseHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    courseCode: {
        color: '#7c3aed',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    courseName: {
        color: '#21272A',
        margin: '4px 0 0 0',
        fontSize: '1.1rem',
    },
    percentBadge: {
        padding: '8px 16px',
        borderRadius: '10px',
        fontWeight: '700',
        fontSize: '1.1rem',
    },
    courseStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px',
    },
    statItem: {
        textAlign: 'center',
    },
    statItemValue: {
        display: 'block',
        color: '#21272A',
        fontSize: '1.25rem',
        fontWeight: '600',
    },
    statItemLabel: {
        color: '#5C6873',
        fontSize: '0.75rem',
    },
    progressBar: {
        height: '6px',
        background: '#E3E5E8',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.3s ease',
    },

    actionsRow: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
    },
    primaryBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'none',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    secondaryBtn: {
        background: '#F5F7FA',
        border: '1px solid #E3E5E8',
        color: '#21272A',
        padding: '14px 28px',
        borderRadius: '12px',
        cursor: 'pointer',
    },
};

export default QuizResults;
