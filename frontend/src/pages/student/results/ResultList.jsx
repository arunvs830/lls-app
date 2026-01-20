import { useState, useEffect } from 'react';
import { studentDashboardApi } from '../../../services/api';

const ResultList = () => {
    const [resultsData, setResultsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const data = await studentDashboardApi.getCourseResults(studentId);
            setResultsData(data);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading your results...</p>
            </div>
        );
    }

    const student = resultsData?.student;
    const courses = resultsData?.courses || [];

    const releasedCourses = courses.filter(c => c.final?.released);
    const avgFinalPct = releasedCourses.length > 0
        ? (releasedCourses.reduce((sum, c) => sum + (c.final?.percentage || 0), 0) / releasedCourses.length).toFixed(1)
        : 0;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>My Results</h1>
                    <p style={styles.subtitle}>Academic performance overview</p>
                </div>
                <div style={styles.studentInfo}>
                    <span style={styles.studentName}>{student?.full_name}</span>
                    <span style={styles.studentCode}>{student?.student_code}</span>
                </div>
            </header>

            {/* Stats Summary */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{releasedCourses.length}</span>
                    <span style={styles.statLabel}>Final Results Released</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{avgFinalPct}%</span>
                    <span style={styles.statLabel}>Average Final %</span>
                </div>
                <div style={styles.statCard}>
                    <span style={{ ...styles.statNumber, color: '#10b981' }}>
                        {courses.filter(c => c.final?.released).length}
                    </span>
                    <span style={styles.statLabel}>Courses Completed</span>
                </div>
            </div>

            {/* Results Table */}
            {courses.length === 0 ? (
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📊</span>
                    <h3 style={styles.emptyTitle}>No results yet</h3>
                    <p style={styles.emptyText}>Your courses and results will appear here once you are enrolled.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Course</th>
                                <th style={styles.th}>Assignments</th>
                                <th style={styles.th}>Quiz</th>
                                <th style={styles.th}>Progress %</th>
                                <th style={styles.th}>Final %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((row) => (
                                <tr key={row.course?.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.courseCell}>
                                            <span style={styles.courseCode}>{row.course?.course_code}</span>
                                            <span style={styles.courseName}>{row.course?.course_name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {row.assignments
                                            ? `${row.assignments.earned_marks ?? 0}/${row.assignments.total_marks ?? 0}`
                                            : '-'}
                                    </td>
                                    <td style={styles.td}>
                                        {row.quiz
                                            ? `${row.quiz.earned_marks ?? 0}/${row.quiz.total_marks ?? 0}`
                                            : '-'}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.totalMarks}>{row.progress?.percentage ?? 0}%</span>
                                    </td>
                                    <td style={styles.td}>
                                        {row.final?.released ? (
                                            <span style={{
                                                ...styles.gradeBadge,
                                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                                color: '#10b981'
                                            }}>
                                                {row.final.percentage}%
                                            </span>
                                        ) : (
                                            <span style={{
                                                ...styles.gradeBadge,
                                                backgroundColor: '#E3E5E8',
                                                color: '#5C6873'
                                            }}>
                                                Locked
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    title: { fontSize: '2rem', fontWeight: '700', color: '#21272A', margin: 0 },
    subtitle: { color: '#5C6873', marginTop: '8px' },
    studentInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    studentName: { color: '#21272A', fontWeight: '600' },
    studentCode: { color: '#5C6873', fontSize: '0.85rem' },

    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E3E5E8',
        textAlign: 'center',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    statNumber: {
        display: 'block',
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#21272A',
    },
    statLabel: {
        color: '#5C6873',
        fontSize: '0.9rem',
        marginTop: '8px',
        display: 'block',
    },

    tableContainer: {
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E3E5E8',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '16px 20px',
        color: '#5C6873',
        fontSize: '0.85rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #E3E5E8',
        background: '#F5F7FA',
    },
    tr: {
        borderBottom: '1px solid #E3E5E8',
    },
    td: {
        padding: '20px',
        color: '#21272A',
        fontSize: '0.95rem',
    },
    courseCell: {
        display: 'flex',
        flexDirection: 'column',
    },
    courseCode: {
        color: '#7c3aed',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    courseName: {
        color: '#21272A',
        marginTop: '4px',
    },
    totalMarks: {
        fontWeight: '700',
        fontSize: '1.1rem',
    },
    gradeBadge: {
        padding: '6px 14px',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '0.9rem',
    },

    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E3E5E8',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    },
    emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '16px' },
    emptyTitle: { color: '#21272A', fontSize: '1.5rem', margin: '0 0 8px 0' },
    emptyText: { color: '#5C6873' },
};

export default ResultList;
