import React from 'react';
import StaffSidebar from '../components/StaffSidebar';
import Header from '../components/Header';
import '../styles/AdminLayout.css';

const StaffLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <StaffSidebar />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
