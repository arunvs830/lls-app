import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/AdminLayout.css';

const AdminLayout = ({ children, title = "Dashboard" }) => {
    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="main-content">
                <Header title={title} />
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
