import React from 'react';
import '../styles/Sidebar.css';

const StaffSidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">LLS</div>
                <h3>Staff Panel</h3>
            </div>
            <nav className="sidebar-nav">
                <a href="/staff" className="nav-item active">Dashboard</a>
                <a href="/staff/my-courses" className="nav-item">My Courses</a>
                <a href="/staff/materials" className="nav-item">Study Materials</a>
                <a href="/staff/assignments" className="nav-item">Assignments</a>
                <a href="/staff/mcqs" className="nav-item">Quiz Questions</a>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn">Logout</button>
            </div>
        </aside>
    );
};

export default StaffSidebar;
