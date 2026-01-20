import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    HelpCircle,
    Trophy,
    PlusCircle,
    LogOut,
    Mail
} from 'lucide-react';
import '../styles/Sidebar.css';

const StudentSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
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
                    <LayoutDashboard className="nav-icon" size={20} />
                    Dashboard
                </NavLink>
                <NavLink to="/student/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <BookOpen className="nav-icon" size={20} />
                    My Courses
                </NavLink>
                <NavLink to="/student/enroll" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <PlusCircle className="nav-icon" size={20} />
                    Enroll in Courses
                </NavLink>
                <NavLink to="/student/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ClipboardList className="nav-icon" size={20} />
                    Assignments
                </NavLink>
                <NavLink to="/student/quiz" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <HelpCircle className="nav-icon" size={20} />
                    Quizzes
                </NavLink>
                <NavLink to="/student/results" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Trophy className="nav-icon" size={20} />
                    Results
                </NavLink>
                <NavLink to="/student/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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

export default StudentSidebar;
