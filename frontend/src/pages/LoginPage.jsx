import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLogin = (user) => {
        // Navigate based on user role
        switch (user.role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'staff':
                navigate('/staff');
                break;
            case 'student':
                navigate('/student');
                break;
            default:
                navigate('/admin');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-placeholder">LLS</div>
                    <h1>Language Learning System</h1>
                </div>
                <LoginForm onLogin={handleLogin} />
                <div className="register-link">
                    Don't have an account? <Link to="/register">Register as Student</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
