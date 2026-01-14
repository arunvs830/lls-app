import React from 'react';
import StudentSidebar from '../components/StudentSidebar';
import Header from '../components/Header';
import '../styles/AdminLayout.css';

const StudentLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <StudentSidebar />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
