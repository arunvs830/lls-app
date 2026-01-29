import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, CheckCircle, BarChart, Trophy } from 'lucide-react';
import { studentDashboardApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/StudentDashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const studentId = user?.id;

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!studentId) {
            navigate('/login');
        }
    }, [studentId, navigate]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const dashboard = await studentDashboardApi.getDashboard(studentId);
            setDashboardData(dashboard);
            setUpcomingAssignments(dashboard.upcoming_assignments || []);
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
            <div className="student-dashboard-loading">
                <div className="student-dashboard-spinner"></div>
                <p className="student-dashboard-loading-text">Loading your dashboard...</p>
            </div>
        );
    }

    const stats = dashboardData?.stats || {};
    const student = dashboardData?.student || {};
    const progressPercent = stats.total_assignments > 0
        ? Math.round((stats.completed_assignments / stats.total_assignments) * 100)
        : 0;

    return (
        <div className="student-dashboard-container">
            {/* Welcome Header */}
            <header className="student-dashboard-header">
                <div className="student-dashboard-welcome-section">
                    <h1 className="student-dashboard-welcome-title">Welcome back, {student.full_name || 'Student'}!</h1>
                    <p className="student-dashboard-welcome-subtitle">
                        {student.program} • {student.semester}
                    </p>
                </div>
                <div className="student-dashboard-badge">
                    <span className="student-dashboard-code">{student.student_code}</span>
                </div>
            </header>

            {/* Stats Grid */}
            <section className="student-dashboard-stats-grid">
                <div className="student-dashboard-stat-card purple">
                    <div className="student-dashboard-stat-icon"><BookOpen size={24} /></div>
                    <div className="student-dashboard-stat-content">
                        <span className="student-dashboard-stat-number">{stats.enrolled_courses || 0}</span>
                        <span className="student-dashboard-stat-label">Enrolled Courses</span>
                    </div>
                    <button onClick={() => navigate('/student/courses')} className="student-dashboard-stat-link">
                        View All →
                    </button>
                </div>

                <div className="student-dashboard-stat-card orange">
                    <div className="student-dashboard-stat-icon"><ClipboardList size={24} /></div>
                    <div className="student-dashboard-stat-content">
                        <span className="student-dashboard-stat-number">{stats.pending_assignments || 0}</span>
                        <span className="student-dashboard-stat-label">Pending Tasks</span>
                    </div>
                    <button onClick={() => navigate('/student/assignments')} className="student-dashboard-stat-link">
                        Review →
                    </button>
                </div>

                <div className="student-dashboard-stat-card green">
                    <div className="student-dashboard-stat-icon"><CheckCircle size={24} /></div>
                    <div className="student-dashboard-stat-content">
                        <span className="student-dashboard-stat-number">{stats.completed_assignments || 0}/{stats.total_assignments || 0}</span>
                        <span className="student-dashboard-stat-label">Submitted</span>
                    </div>
                    <button onClick={() => navigate('/student/results')} className="student-dashboard-stat-link">
                        Results →
                    </button>
                </div>

                <div className="student-dashboard-stat-card blue">
                    <div className="student-dashboard-stat-icon"><BarChart size={24} /></div>
                    <div className="student-dashboard-stat-content">
                        <span className="student-dashboard-stat-number">{progressPercent}%</span>
                        <span className="student-dashboard-stat-label">Progress</span>
                    </div>
                    <div className="student-dashboard-progress-bar">
                        <div
                            className="student-dashboard-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="student-dashboard-content-grid">
                {/* Upcoming Assignments */}
                <section className="student-dashboard-content-card">
                    <div className="student-dashboard-card-header">
                        <h2 className="student-dashboard-card-title">📅 Upcoming Deadlines</h2>
                        <button onClick={() => navigate('/student/assignments')} className="student-dashboard-view-all-btn">
                            View All
                        </button>
                    </div>
                    <div className="student-dashboard-assignment-list">
                        {upcomingAssignments.length === 0 ? (
                            <div className="student-dashboard-empty-state">
                                <span className="student-dashboard-empty-icon">🎉</span>
                                <p>No upcoming deadlines!</p>
                            </div>
                        ) : (
                            upcomingAssignments.map(assignment => (
                                <div key={assignment.id} className="student-dashboard-assignment-item">
                                    <div className="student-dashboard-assignment-info">
                                        <h4 className="student-dashboard-assignment-title">{assignment.title}</h4>
                                        <span className="student-dashboard-assignment-course">{assignment.course_name}</span>
                                    </div>
                                    <div className="student-dashboard-assignment-meta">
                                        <span className="student-dashboard-due-date">{formatDate(assignment.due_date)}</span>
                                        <button
                                            onClick={() => navigate(`/student/assignments/submit/${assignment.id}`)}
                                            className="student-dashboard-submit-btn"
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
                <section className="student-dashboard-content-card">
                    <h2 className="student-dashboard-card-title">⚡ Quick Actions</h2>
                    <div className="student-dashboard-quick-actions">
                        <button onClick={() => navigate('/student/courses')} className="student-dashboard-action-button">
                            <span className="student-dashboard-action-icon">📖</span>
                            <span>My Courses</span>
                        </button>
                        <button onClick={() => navigate('/student/assignments')} className="student-dashboard-action-button">
                            <span className="student-dashboard-action-icon"><ClipboardList size={24} /></span>
                            <span>Assignments</span>
                        </button>
                        <button onClick={() => navigate('/student/results')} className="student-dashboard-action-button">
                            <span className="student-dashboard-action-icon"><Trophy size={24} /></span>
                            <span>View Results</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StudentDashboard;
