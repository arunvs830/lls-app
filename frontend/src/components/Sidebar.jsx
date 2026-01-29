import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    GraduationCap,
    BookOpen,
    Library,
    Users,
    UserCircle,
    ClipboardList,
    Award,
    BarChart3,
    PieChart,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import '../styles/Sidebar.css';

import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
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
                    <h3>Admin Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <LayoutDashboard className="nav-icon" size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/academic-years" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <Calendar className="nav-icon" size={20} />
                        Academic Years
                    </NavLink>
                    <NavLink to="/admin/programs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <GraduationCap className="nav-icon" size={20} />
                        Programs
                    </NavLink>
                    <NavLink to="/admin/semesters" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <Library className="nav-icon" size={20} />
                        Semesters
                    </NavLink>
                    <NavLink to="/admin/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <BookOpen className="nav-icon" size={20} />
                        Courses
                    </NavLink>
                    <NavLink to="/admin/staff" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <Users className="nav-icon" size={20} />
                        Staff
                    </NavLink>
                    <NavLink to="/admin/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <UserCircle className="nav-icon" size={20} />
                        Students
                    </NavLink>
                    <NavLink to="/admin/staff-allocation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <ClipboardList className="nav-icon" size={20} />
                        Staff Allocation
                    </NavLink>
                    <NavLink to="/admin/certificates" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <Award className="nav-icon" size={20} />
                        Certificates
                    </NavLink>
                    <NavLink to="/admin/staff-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <BarChart3 className="nav-icon" size={20} />
                        Staff Report
                    </NavLink>
                    <NavLink to="/admin/course-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <PieChart className="nav-icon" size={20} />
                        Course Report
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

export default Sidebar;
