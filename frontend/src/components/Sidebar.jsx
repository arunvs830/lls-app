import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">LLS</div>
                <h3>Admin Panel</h3>
            </div>
            <nav className="sidebar-nav">
                <a href="/admin" className="nav-item active">Dashboard</a>
                <a href="/admin/academic-years" className="nav-item">Academic Years</a>
                <a href="/admin/programs" className="nav-item">Programs</a>
                <a href="/admin/semesters" className="nav-item">Semesters</a>
                <a href="/admin/courses" className="nav-item">Courses</a>
                <a href="/admin/staff" className="nav-item">Staff</a>
                <a href="/admin/students" className="nav-item">Students</a>
                <a href="/admin/staff-allocation" className="nav-item">Staff Allocation</a>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn">Logout</button>
            </div>
        </aside>
    );
};

export default Sidebar;
