import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    ClipboardList,
    HelpCircle,

    LogOut,
    Mail
} from 'lucide-react';
import '../styles/Sidebar.css';

const StaffSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">LLS</div>
                <h3>Staff Panel</h3>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/staff" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard className="nav-icon" size={20} />
                    Dashboard
                </NavLink>
                <NavLink to="/staff/my-courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <BookOpen className="nav-icon" size={20} />
                    My Courses
                </NavLink>
                <NavLink to="/staff/materials" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FileText className="nav-icon" size={20} />
                    Study Materials
                </NavLink>
                <NavLink to="/staff/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ClipboardList className="nav-icon" size={20} />
                    Assignments
                </NavLink>
                <NavLink to="/staff/mcqs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <HelpCircle className="nav-icon" size={20} />
                    Quiz Questions
                </NavLink>
                <NavLink to="/staff/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Mail className="nav-icon" size={20} />
                    Messages
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut className="nav-icon" size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default StaffSidebar;
