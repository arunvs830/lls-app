import StatCard from '../../components/StatCard';
import '../../styles/AdminDashboard.css';

const Dashboard = () => {
    return (
        <div className="admin-dashboard">
            <div className="stats-grid">
                <StatCard
                    title="Total Students"
                    value="1,234"
                    icon="👥"
                    trend={12}
                />
                <StatCard
                    title="Total Courses"
                    value="45"
                    icon="📚"
                />
                <StatCard
                    title="Active Staff"
                    value="28"
                    icon="👨‍🏫"
                    trend={-2}
                />
                <StatCard
                    title="Revenue (MJD)"
                    value="58,900"
                    icon="💰"
                    trend={8.5}
                />
            </div>

            <div className="dashboard-sections">
                <div className="recent-activity card">
                    <h3>Recent Activity</h3>
                    <ul className="activity-list">
                        <li>New student registration: <strong>John Doe</strong> <span className="time">2m ago</span></li>
                        <li>Course updated: <strong>Advanced German</strong> <span className="time">15m ago</span></li>
                        <li>New payment received: <strong>#REC-001</strong> <span className="time">1h ago</span></li>
                    </ul>
                </div>

                <div className="quick-actions card">
                    <h3>Quick Actions</h3>
                    <button className="btn btn-secondary">Add New Student</button>
                    <button className="btn btn-secondary">Create Course</button>
                    <button className="btn btn-secondary">Generate Report</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
