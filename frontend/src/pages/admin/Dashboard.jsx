import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, UserCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';
import { studentApi, courseApi, staffApi } from '../../services/api';
import '../../styles/AdminDashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        staff: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [studentsRes, coursesRes, staffRes] = await Promise.all([
                    studentApi.getAll(),
                    courseApi.getAll(),
                    staffApi.getAll()
                ]);

                setStats({
                    students: studentsRes.length || 0,
                    courses: coursesRes.length || 0,
                    staff: staffRes.length || 0
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Render skeleton loaders while loading
    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="stats-grid">
                    <Skeleton.StatCard />
                    <Skeleton.StatCard />
                    <Skeleton.StatCard />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="stats-grid">
                <StatCard
                    title="Total Students"
                    value={stats.students.toLocaleString()}
                    icon={<UserCircle size={24} />}
                />
                <StatCard
                    title="Total Courses"
                    value={stats.courses.toLocaleString()}
                    icon={<BookOpen size={24} />}
                />
                <StatCard
                    title="Active Staff"
                    value={stats.staff.toLocaleString()}
                    icon={<Users size={24} />}
                />
            </div>

            <div className="dashboard-sections">
                <div className="recent-activity card">
                    <h3>Recent Activity</h3>
                    <div className="activity-placeholder" style={{ padding: '24px', textAlign: 'center', color: '#5C6873' }}>
                        <p>No recent activity to display.</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>System activity will appear here when available.</p>
                    </div>
                </div>

                <div className="quick-actions card">
                    <h3>Quick Actions</h3>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/students/new')}>Add New Student</button>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/courses/new')}>Create Course</button>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/staff/new')}>Add Staff</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
