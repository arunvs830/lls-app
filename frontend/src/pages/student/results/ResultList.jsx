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
            const data = await studentDashboardApi.getResults(studentId);
            setResultsData(data);
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade) => {
        if (!grade) return 'rgba(255,255,255,0.4)';
        switch (grade.charAt(0).toUpperCase()) {
            case 'A': return '#10b981';
            case 'B': return '#3b82f6';
            case 'C': return '#f59e0b';
            case 'D': return '#f97316';
            default: return '#ef4444';
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
    const results = resultsData?.results || [];

    // Calculate overall stats
    const totalMarks = results.reduce((sum, r) => sum + (r.total_marks || 0), 0);
    const avgMarks = results.length > 0 ? (totalMarks / results.length).toFixed(1) : 0;

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
                    <span style={styles.statNumber}>{results.length}</span>
                    <span style={styles.statLabel}>Courses Graded</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{avgMarks}</span>
                    <span style={styles.statLabel}>Average Score</span>
                </div>
                <div style={styles.statCard}>
                    <span style={{ ...styles.statNumber, color: '#10b981' }}>
                        {results.filter(r => r.grade?.startsWith('A')).length}
                    </span>
                    <span style={styles.statLabel}>A Grades</span>
                </div>
            </div>

            {/* Results Table */}
            {results.length === 0 ? (
                <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📊</span>
                    <h3 style={styles.emptyTitle}>No results yet</h3>
                    <p style={styles.emptyText}>Your grades will appear here once they are released.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Course</th>
                                <th style={styles.th}>Semester</th>
                                <th style={styles.th}>Assignments</th>
                                <th style={styles.th}>MCQ</th>
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(result => (
                                <tr key={result.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.courseCell}>
                                            <span style={styles.courseCode}>{result.course?.course_code}</span>
                                            <span style={styles.courseName}>{result.course?.course_name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{result.semester?.semester_name || '-'}</td>
                                    <td style={styles.td}>{result.assignment_marks ?? '-'}</td>
                                    <td style={styles.td}>{result.mcq_marks ?? '-'}</td>
                                    <td style={styles.td}>
                                        <span style={styles.totalMarks}>{result.total_marks ?? '-'}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.gradeBadge,
                                            backgroundColor: `${getGradeColor(result.grade)}20`,
                                            color: getGradeColor(result.grade)
                                        }}>
                                            {result.grade || 'N/A'}
                                        </span>
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
    loadingText: { marginTop: '16px', color: 'rgba(255,255,255,0.6)' },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    title: { fontSize: '2rem', fontWeight: '700', color: 'white', margin: 0 },
    subtitle: { color: 'rgba(255,255,255,0.5)', marginTop: '8px' },
    studentInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    studentName: { color: 'white', fontWeight: '600' },
    studentCode: { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' },

    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
    },
    statNumber: {
        display: 'block',
        fontSize: '2.5rem',
        fontWeight: '700',
        color: 'white',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.9rem',
        marginTop: '8px',
        display: 'block',
    },

    tableContainer: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '16px 20px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.85rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    tr: {
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    td: {
        padding: '20px',
        color: 'white',
        fontSize: '0.95rem',
    },
    courseCell: {
        display: 'flex',
        flexDirection: 'column',
    },
    courseCode: {
        color: '#8b5cf6',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    courseName: {
        color: 'white',
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
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
    },
    emptyIcon: { fontSize: '4rem', display: 'block', marginBottom: '16px' },
    emptyTitle: { color: 'white', fontSize: '1.5rem', margin: '0 0 8px 0' },
    emptyText: { color: 'rgba(255,255,255,0.4)' },
};

export default ResultList;
