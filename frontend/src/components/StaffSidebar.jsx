import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    ClipboardList,
    HelpCircle,
    LogOut,
    Mail,
    Menu,
    TrendingUp,
    X
} from 'lucide-react';
import '../styles/Sidebar.css';

import { useAuth } from '../context/AuthContext';

import { communicationApi, submissionApi } from '../services/api';

const StaffSidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [pendingSubmissions, setPendingSubmissions] = useState(0);

    const staffId = Number(localStorage.getItem('userId') || 0);

    // Fetch counts on mount and interval
    React.useEffect(() => {
        if (!staffId) return;

        const loadCounts = async () => {
            try {
                const msgRes = await communicationApi.getUnreadCount('staff', staffId);
                setUnreadMessages(msgRes.unread_count || 0);

                const subRes = await submissionApi.getPendingCount(staffId);
                setPendingSubmissions(subRes.pending_count || 0);
            } catch (error) {
                console.error("Failed to load sidebar counts", error);
            }
        };

        loadCounts();
        const interval = setInterval(loadCounts, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, [staffId]);

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
                    <h3>Staff Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/staff" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <LayoutDashboard className="nav-icon" size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink to="/staff/my-courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <BookOpen className="nav-icon" size={20} />
                        My Courses
                    </NavLink>
                    <NavLink to="/staff/materials" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <FileText className="nav-icon" size={20} />
                        Study Materials
                    </NavLink>
                    <NavLink to="/staff/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <ClipboardList className="nav-icon" size={20} />
                        Assignments
                    </NavLink>
                    <NavLink to="/staff/mcqs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <HelpCircle className="nav-icon" size={20} />
                        Quiz Questions
                    </NavLink>
                    <NavLink to="/staff/submissions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                            <ClipboardList className="nav-icon" size={20} />
                            <span style={{ flex: 1 }}>Submissions</span>
                            {pendingSubmissions > 0 && (
                                <span style={{
                                    background: '#fb7185',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '50%',
                                    marginLeft: 'auto'
                                }}>
                                    {pendingSubmissions}
                                </span>
                            )}
                        </div>
                    </NavLink>
                    <NavLink to="/staff/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Mail className="nav-icon" size={20} />
                            <span style={{ flex: 1 }}>Messages</span>
                            {unreadMessages > 0 && (
                                <span style={{
                                    background: '#fb7185',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '50%',
                                    marginLeft: 'auto'
                                }}>
                                    {unreadMessages}
                                </span>
                            )}
                        </div>
                    </NavLink>
                    <NavLink to="/staff/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                            <TrendingUp className="nav-icon" size={20} />
                            <span style={{ flex: 1 }}>Student Reports</span>
                        </div>
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

export default StaffSidebar;
