import React from 'react';
import NotificationBell from './NotificationBell';
import '../styles/Header.css';

const Header = ({ title, userType, userId, userName }) => {
    // Get user info from localStorage if not passed as props
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const effectiveUserType = userType || storedUser.role || 'student';
    const effectiveUserId = userId || storedUser.id;
    const effectiveUserName = userName || storedUser.full_name || storedUser.email || 'User';

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="admin-header">
            <div className="header-title">
                <h1>{title}</h1>
            </div>
            <div className="header-actions">
                {effectiveUserId && (
                    <NotificationBell
                        userType={effectiveUserType}
                        userId={effectiveUserId}
                    />
                )}
                <div className="user-profile">
                    <div className="avatar">{getInitials(effectiveUserName)}</div>
                    <span className="user-name">{effectiveUserName}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
