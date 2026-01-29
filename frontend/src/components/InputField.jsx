import React from 'react';
import '../styles/InputField.css';

const InputField = ({ label, type = 'text', placeholder, value, onChange, id, required = false, error }) => {
  return (
    <div className="input-field-wrapper">
      {label && <label htmlFor={id} className={`input-label ${error ? 'error' : ''}`}>{label}</label>}
      <input
        id={id}
        type={type}
        className={`input-element ${error ? 'error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <span id={`${id}-error`} className="input-error-message">{error}</span>}
    </div>
  );
};

export default InputField;
