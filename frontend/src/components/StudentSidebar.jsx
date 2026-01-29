import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    HelpCircle,
    Trophy,
    PlusCircle,
    LogOut,
    Mail,
    Menu,
    X
} from 'lucide-react';
import '../styles/Sidebar.css';

import { useAuth } from '../context/AuthContext';

const StudentSidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const closeMobileMenu = () => setMobileOpen(false);

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            <div
                className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
                onClick={closeMobileMenu}
                aria-hidden="true"
            />

            <aside className={`sidebar ${mobileOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">LLS</div>
                    <h3>Student Portal</h3>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/student" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <LayoutDashboard className="nav-icon" size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink to="/student/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <BookOpen className="nav-icon" size={20} />
                        My Courses
                    </NavLink>
                    <NavLink to="/student/enroll" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <PlusCircle className="nav-icon" size={20} />
                        Enroll in Courses
                    </NavLink>
                    <NavLink to="/student/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <ClipboardList className="nav-icon" size={20} />
                        Assignments
                    </NavLink>
                    <NavLink to="/student/quiz" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <HelpCircle className="nav-icon" size={20} />
                        Quizzes
                    </NavLink>
                    <NavLink to="/student/results" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <Trophy className="nav-icon" size={20} />
                        Results
                    </NavLink>
                    <NavLink to="/student/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
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
        </>
    );
};

export default StudentSidebar;
