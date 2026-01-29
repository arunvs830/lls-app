import React, { useState } from 'react';
import InputField from './InputField';
import Button from './Button';
import { authApi } from '../services/api';

import { useAuth } from '../context/AuthContext';

// ... existing imports ...

const LoginForm = ({ onLogin }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login(email, password, role);

            if (response.success) {
                // Use global auth context
                login(response.user, response.access_token || response.token || 'session-token');

                if (onLogin) {
                    onLogin(response.user);
                }
            } else {
                setError(response.error || 'Invalid email or password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Enter your credentials to access the system</p>

            {error && (
                <div className="error-message" style={{
                    background: 'rgba(255, 77, 77, 0.1)',
                    border: '1px solid #ff4d4d',
                    color: '#ff4d4d',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            <div className="role-selector" style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#a0aec0',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    Login As
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['admin', 'staff', 'student'].map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                border: role === r ? '2px solid #667eea' : '1px solid #4a5568',
                                borderRadius: '8px',
                                background: role === r ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                                color: role === r ? '#667eea' : '#a0aec0',
                                cursor: 'pointer',
                                fontWeight: role === r ? '600' : '400',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <InputField
                id="email"
                type="text"
                label="Email or Username"
                placeholder="Enter email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <button
                    type="button"
                    className="forgot-password"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => alert('Password reset functionality is not yet implemented.')}
                >
                    Forgot password?
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
