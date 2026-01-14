import React from 'react';
import '../styles/InputField.css';

const InputField = ({ label, type = 'text', placeholder, value, onChange, id, required = false }) => {
  return (
    <div className="input-field-wrapper">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input
        id={id}
        type={type}
        className="input-element"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default InputField;
