import React from 'react';
import '../styles/Button.css';

const Button = ({ children, type = 'button', onClick, variant = 'primary', className = '', disabled = false }) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
