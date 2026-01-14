import React from 'react';
import '../styles/Header.css';

const Header = ({ title }) => {
    return (
        <header className="admin-header">
            <div className="header-title">
                <h1>{title}</h1>
            </div>
            <div className="header-actions">
                <button className="icon-btn notification-btn">
                    <span className="notification-badge"></span>
                    🔔
                </button>
                <div className="user-profile">
                    <div className="avatar">AD</div>
                    <span className="user-name">Admin User</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
