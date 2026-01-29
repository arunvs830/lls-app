import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, ClipboardList, Clock, Upload, PlusCircle, FolderOpen } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { staffCourseApi, studyMaterialApi, assignmentApi, submissionApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/StaffDashboard.css';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        courses: 0,
        materials: 0,
        assignments: 0,
        pending: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const staffId = user?.id;

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                const [courses, materials, assignments, submissions] = await Promise.all([
                    staffCourseApi.getByStaff(staffId),
                    studyMaterialApi.getByStaff(staffId),
                    assignmentApi.getByStaff(staffId),
                    submissionApi.getForStaff(staffId).catch(() => [])
                ]);

                if (cancelled) return;

                // Data is already filtered by backend
                const myCourses = courses;
                const myCourseIds = myCourses.map(c => c.course_id);
                const myAssignments = assignments;

                // Count pending submissions
                const pendingCount = submissions.filter(s =>
                    myAssignments.some(a => a.id === s.assignment_id) && !s.marks
                ).length;

                setStats({
                    courses: myCourses.length,
                    materials: materials.filter(m => myCourseIds.includes(m.course_id)).length,
                    assignments: myAssignments.length,
                    pending: pendingCount
                });

                // Generate recent activity from actual data
                const activity = [];

                // Recent materials
                const recentMaterials = materials
                    .filter(m => myCourseIds.includes(m.course_id))
                    .sort((a, b) => new Date(b.upload_date || 0) - new Date(a.upload_date || 0))
                    .slice(0, 2);

                recentMaterials.forEach(m => {
                    activity.push({
                        id: `material-${m.id}`,
                        icon: '📹',
                        iconBg: 'rgba(16, 185, 129, 0.2)',
                        title: `Uploaded: ${m.title}`,
                        time: formatTimeAgo(m.upload_date)
                    });
                });

                // Recent assignments
                const recentAssignments = myAssignments
                    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                    .slice(0, 2);

                recentAssignments.forEach(a => {
                    activity.push({
                        id: `assignment-${a.id}`,
                        icon: '📝',
                        iconBg: 'rgba(139, 92, 246, 0.2)',
                        title: `Created: ${a.title}`,
                        time: formatTimeAgo(a.created_at)
                    });
                });

                setRecentActivity(activity.slice(0, 5));
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [staffId]);

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Recently';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="staff-dashboard">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Staff Dashboard</h1>
                    <p className="welcome-text">Welcome back! Manage your courses, materials, and assignments.</p>
                </div>
            </div>

            {/* Stats Grid - Now using Lucide icons consistently */}
            <div className="staff-stats-grid">
                <StatCard
                    title="My Courses"
                    value={stats.courses}
                    icon={<BookOpen size={24} />}
                />
                <StatCard
                    title="Study Materials"
                    value={stats.materials}
                    icon={<Video size={24} />}
                />
                <StatCard
                    title="Assignments"
                    value={stats.assignments}
                    icon={<ClipboardList size={24} />}
                />
                <StatCard
                    title="Pending Reviews"
                    value={stats.pending}
                    icon={<Clock size={24} />}
                />
            </div>

            {/* Content Grid */}
            <div className="staff-content-grid">
                {/* Quick Actions */}
                <div className="recent-activity">
                    <div className="staff-section-title">Quick Actions</div>
                    <div className="quick-actions-grid">
                        <button className="quick-action-btn purple" onClick={() => navigate('/staff/my-courses')}>
                            <span className="quick-action-icon"><FolderOpen size={20} /></span>
                            View My Courses
                        </button>
                        <button className="quick-action-btn blue" onClick={() => navigate('/staff/materials/new')}>
                            <span className="quick-action-icon"><Upload size={20} /></span>
                            Upload Video
                        </button>
                        <button className="quick-action-btn green" onClick={() => navigate('/staff/assignments/new')}>
                            <span className="quick-action-icon"><PlusCircle size={20} /></span>
                            Create Assignment
                        </button>
                        <button className="quick-action-btn orange" onClick={() => navigate('/staff/materials')}>
                            <span className="quick-action-icon"><Video size={20} /></span>
                            All Materials
                        </button>
                    </div>
                </div>

                {/* Recent Activity - Now dynamic */}
                <div className="recent-activity">
                    <div className="staff-section-title">Recent Activity</div>
                    {loading ? (
                        <p className="activity-loading">Loading...</p>
                    ) : recentActivity.length === 0 ? (
                        <p className="activity-empty">No recent activity to show.</p>
                    ) : (
                        <ul className="activity-list">
                            {recentActivity.map(item => (
                                <li key={item.id} className="activity-item">
                                    <div className="activity-icon" style={{ background: item.iconBg }}>
                                        {item.icon}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-title">{item.title}</div>
                                        <div className="activity-time">{item.time}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
