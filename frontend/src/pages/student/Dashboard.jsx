import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentDashboardApi, assignmentApi } from '../../services/api';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [dashboard, assignments] = await Promise.all([
                studentDashboardApi.getDashboard(studentId),
                assignmentApi.getAll()
            ]);

            setDashboardData(dashboard);

            // Get upcoming assignments (due in the future)
            const now = new Date();
            const upcoming = assignments
                .filter(a => a.due_date && new Date(a.due_date) > now)
                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                .slice(0, 3);
            setUpcomingAssignments(upcoming);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No deadline';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading your dashboard...</p>
            </div>
        );
    }

    const stats = dashboardData?.stats || {};
    const student = dashboardData?.student || {};

    return (
        <div style={styles.container}>
            {/* Welcome Header */}
            <header style={styles.header}>
                <div style={styles.welcomeSection}>
                    <h1 style={styles.welcomeTitle}>Welcome back, {student.full_name || 'Student'}! 👋</h1>
                    <p style={styles.welcomeSubtitle}>
                        {student.program} • {student.semester}
                    </p>
                </div>
                <div style={styles.studentBadge}>
                    <span style={styles.studentCode}>{student.student_code}</span>
                </div>
            </header>

            {/* Stats Grid */}
            <section style={styles.statsGrid}>
                <div style={{ ...styles.statCard, ...styles.statPurple }}>
                    <div style={styles.statIcon}>📚</div>
                    <div style={styles.statContent}>
                        <span style={styles.statNumber}>{stats.enrolled_courses || 0}</span>
                        <span style={styles.statLabel}>Enrolled Courses</span>
                    </div>
                    <button onClick={() => navigate('/student/courses')} style={styles.statLink}>
                        View All →
                    </button>
                </div>

                <div style={{ ...styles.statCard, ...styles.statOrange }}>
                    <div style={styles.statIcon}>📝</div>
                    <div style={styles.statContent}>
                        <span style={styles.statNumber}>{stats.pending_assignments || 0}</span>
                        <span style={styles.statLabel}>Pending Tasks</span>
                    </div>
                    <button onClick={() => navigate('/student/assignments')} style={styles.statLink}>
                        Review →
                    </button>
                </div>

                <div style={{ ...styles.statCard, ...styles.statGreen }}>
                    <div style={styles.statIcon}>✅</div>
                    <div style={styles.statContent}>
                        <span style={styles.statNumber}>{stats.completed_assignments || 0}</span>
                        <span style={styles.statLabel}>Completed</span>
                    </div>
                    <button onClick={() => navigate('/student/results')} style={styles.statLink}>
                        Results →
                    </button>
                </div>

                <div style={{ ...styles.statCard, ...styles.statBlue }}>
                    <div style={styles.statIcon}>📊</div>
                    <div style={styles.statContent}>
                        <span style={styles.statNumber}>
                            {stats.total_assignments > 0
                                ? Math.round((stats.completed_assignments / stats.total_assignments) * 100)
                                : 0}%
                        </span>
                        <span style={styles.statLabel}>Progress</span>
                    </div>
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${stats.total_assignments > 0
                                    ? (stats.completed_assignments / stats.total_assignments) * 100
                                    : 0}%`
                            }}
                        ></div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div style={styles.contentGrid}>
                {/* Upcoming Assignments */}
                <section style={styles.contentCard}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>📅 Upcoming Deadlines</h2>
                        <button onClick={() => navigate('/student/assignments')} style={styles.viewAllBtn}>
                            View All
                        </button>
                    </div>
                    <div style={styles.assignmentList}>
                        {upcomingAssignments.length === 0 ? (
                            <div style={styles.emptyState}>
                                <span style={styles.emptyIcon}>🎉</span>
                                <p>No upcoming deadlines!</p>
                            </div>
                        ) : (
                            upcomingAssignments.map(assignment => (
                                <div key={assignment.id} style={styles.assignmentItem}>
                                    <div style={styles.assignmentInfo}>
                                        <h4 style={styles.assignmentTitle}>{assignment.title}</h4>
                                        <span style={styles.assignmentCourse}>{assignment.course_name}</span>
                                    </div>
                                    <div style={styles.assignmentMeta}>
                                        <span style={styles.dueDate}>{formatDate(assignment.due_date)}</span>
                                        <button
                                            onClick={() => navigate(`/student/assignments/submit/${assignment.id}`)}
                                            style={styles.submitBtn}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Quick Actions */}
                <section style={styles.contentCard}>
                    <h2 style={styles.cardTitle}>⚡ Quick Actions</h2>
                    <div style={styles.quickActions}>
                        <button onClick={() => navigate('/student/courses')} style={styles.actionButton}>
                            <span style={styles.actionIcon}>📖</span>
                            <span>My Courses</span>
                        </button>
                        <button onClick={() => navigate('/student/assignments')} style={styles.actionButton}>
                            <span style={styles.actionIcon}>📝</span>
                            <span>Assignments</span>
                        </button>
                        <button onClick={() => navigate('/student/results')} style={styles.actionButton}>
                            <span style={styles.actionIcon}>🏆</span>
                            <span>View Results</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
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
        color: 'rgba(255,255,255,0.6)',
        fontSize: '1rem',
    },

    // Header
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    welcomeSection: {},
    welcomeTitle: {
        fontSize: '2rem',
        fontWeight: '700',
        color: 'white',
        margin: 0,
    },
    welcomeSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '1rem',
        marginTop: '8px',
    },
    studentBadge: {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '12px 24px',
    },
    studentCode: {
        color: '#8b5cf6',
        fontWeight: '600',
        fontSize: '0.9rem',
        letterSpacing: '0.05em',
    },

    // Stats
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    statPurple: { borderLeft: '4px solid #8b5cf6' },
    statOrange: { borderLeft: '4px solid #f59e0b' },
    statGreen: { borderLeft: '4px solid #10b981' },
    statBlue: { borderLeft: '4px solid #3b82f6' },
    statIcon: {
        fontSize: '2rem',
    },
    statContent: {
        display: 'flex',
        flexDirection: 'column',
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: 'white',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.9rem',
    },
    statLink: {
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        padding: 0,
        fontSize: '0.85rem',
        textAlign: 'left',
        transition: 'color 0.2s',
    },
    progressBar: {
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
    },

    // Content Grid
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
    },
    contentCard: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.06)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    cardTitle: {
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: '600',
        margin: 0,
    },
    viewAllBtn: {
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        color: '#8b5cf6',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
    },

    // Assignments
    assignmentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    assignmentItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.04)',
    },
    assignmentInfo: {},
    assignmentTitle: {
        color: 'white',
        margin: 0,
        fontSize: '1rem',
        fontWeight: '500',
    },
    assignmentCourse: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.85rem',
    },
    assignmentMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    dueDate: {
        color: '#f59e0b',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'none',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px 20px',
        color: 'rgba(255,255,255,0.4)',
    },
    emptyIcon: {
        fontSize: '3rem',
        display: 'block',
        marginBottom: '12px',
    },

    // Quick Actions
    quickActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '16px',
    },
    actionButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'all 0.2s',
    },
    actionIcon: {
        fontSize: '1.5rem',
    },
};

export default StudentDashboard;
