import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/admin');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-placeholder">LLS</div>
                    <h1>Language Learning System</h1>
                </div>
                <LoginForm onLogin={handleLogin} />
            </div>
        </div>
    );
};

export default LoginPage;
