import React, { useState } from 'react';
import InputField from './InputField';
import Button from './Button';

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Login attempt:', { username, password });
            setLoading(false);
            if (onLogin) onLogin();
        }, 1500);
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Enter your credentials to access the system</p>

            <InputField
                id="username"
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <InputField
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <div className="form-actions">
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>
            </div>

            <div className="form-footer">
                <a href="#" className="forgot-password">Forgot password?</a>
            </div>
        </form>
    );
};

export default LoginForm;
