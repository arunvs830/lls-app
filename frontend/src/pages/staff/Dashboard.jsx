import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import { staffCourseApi, studyMaterialApi, assignmentApi } from '../../services/api';
import '../../styles/StaffDashboard.css';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        courses: 0,
        materials: 0,
        assignments: 0,
        pending: 0
    });

    // TODO: Get from auth context
    const staffId = 1;

    useEffect(() => {
        let cancelled = false;

        const loadStats = async () => {
            try {
                const [courses, materials, assignments] = await Promise.all([
                    staffCourseApi.getAll(),
                    studyMaterialApi.getAll(),
                    assignmentApi.getAll()
                ]);

                if (cancelled) return;

                setStats({
                    courses: courses.filter(c => c.staff_id === staffId).length,
                    materials: materials.length,
                    assignments: assignments.length,
                    pending: 0
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        };

        loadStats();

        return () => {
            cancelled = true;
        };
    }, [staffId]);

    return (
        <div className="staff-dashboard">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Staff Dashboard</h1>
                    <p className="welcome-text">Welcome back! Manage your courses, materials, and assignments.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="staff-stats-grid">
                <StatCard
                    title="My Courses"
                    value={stats.courses}
                    icon="📚"
                    color="#8b5cf6"
                />
                <StatCard
                    title="Study Materials"
                    value={stats.materials}
                    icon="🎬"
                    color="#06b6d4"
                />
                <StatCard
                    title="Assignments"
                    value={stats.assignments}
                    icon="📝"
                    color="#10b981"
                />
                <StatCard
                    title="Pending Reviews"
                    value={stats.pending}
                    icon="⏳"
                    color="#f59e0b"
                />
            </div>

            {/* Content Grid */}
            <div className="staff-content-grid">
                {/* Quick Actions */}
                <div className="recent-activity">
                    <div className="staff-section-title">Quick Actions</div>
                    <div className="quick-actions-grid">
                        <button className="quick-action-btn purple" onClick={() => navigate('/staff/my-courses')}>
                            <span className="quick-action-icon">📚</span>
                            View My Courses
                        </button>
                        <button className="quick-action-btn blue" onClick={() => navigate('/staff/materials/new')}>
                            <span className="quick-action-icon">📤</span>
                            Upload Video
                        </button>
                        <button className="quick-action-btn green" onClick={() => navigate('/staff/assignments/new')}>
                            <span className="quick-action-icon">➕</span>
                            Create Assignment
                        </button>
                        <button className="quick-action-btn orange" onClick={() => navigate('/staff/materials')}>
                            <span className="quick-action-icon">📋</span>
                            All Materials
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity">
                    <div className="staff-section-title">Recent Activity</div>
                    <ul className="activity-list">
                        <li className="activity-item">
                            <div className="activity-icon" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>📹</div>
                            <div className="activity-content">
                                <div className="activity-title">Video uploaded</div>
                                <div className="activity-time">2 hours ago</div>
                            </div>
                        </li>
                        <li className="activity-item">
                            <div className="activity-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>📝</div>
                            <div className="activity-content">
                                <div className="activity-title">Assignment created</div>
                                <div className="activity-time">Yesterday</div>
                            </div>
                        </li>
                        <li className="activity-item">
                            <div className="activity-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>👤</div>
                            <div className="activity-content">
                                <div className="activity-title">Course assigned</div>
                                <div className="activity-time">2 days ago</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
