import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const StudentSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear auth and navigate to login
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">LLS</div>
                <h3>Student Portal</h3>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/student" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    Dashboard
                </NavLink>
                <NavLink to="/student/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    My Courses
                </NavLink>
                <NavLink to="/student/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    Assignments
                </NavLink>
                <NavLink to="/student/quiz" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    Quizzes
                </NavLink>
                <NavLink to="/student/results" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    Results
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </aside>
    );
};

export default StudentSidebar;
