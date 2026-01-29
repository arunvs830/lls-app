import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { programApi, semesterApi, courseApi, authApi } from '../services/api';
import '../styles/RegisterPage.css';

const API_BASE = import.meta.env.DEV ? '/api' : 'http://127.0.0.1:6000/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Program/Semester, 3: Courses
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        program_id: '',
        semester_id: '',
        course_ids: []
    });

    // Dropdown options
    const [programs, setPrograms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);

    // Load programs and semesters on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [programsData, semestersData, coursesData] = await Promise.all([
                    programApi.getAll(),
                    semesterApi.getAll(),
                    courseApi.getAll()
                ]);
                setPrograms(programsData);
                setSemesters(semestersData);
                setCourses(coursesData);
            } catch {
                setError('Failed to load registration data');
            }
        };
        loadData();
    }, []);

    // Filter courses when program/semester changes
    useEffect(() => {
        if (formData.program_id && formData.semester_id) {
            const filtered = courses.filter(
                c => c.program_id === parseInt(formData.program_id) &&
                    c.semester_id === parseInt(formData.semester_id)
            );
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses([]);
        }
    }, [formData.program_id, formData.semester_id, courses]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleCourseToggle = (courseId) => {
        setFormData(prev => ({
            ...prev,
            course_ids: prev.course_ids.includes(courseId)
                ? prev.course_ids.filter(id => id !== courseId)
                : [...prev.course_ids, courseId]
        }));
    };

    const validateStep1 = () => {
        if (!formData.full_name.trim()) {
            setError('Full name is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.program_id) {
            setError('Please select a program');
            return false;
        }
        if (!formData.semester_id) {
            setError('Please select a semester');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await authApi.register({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                program_id: parseInt(formData.program_id),
                semester_id: parseInt(formData.semester_id),
                course_ids: formData.course_ids
            });

            if (data.error) {
                throw new Error(data.error);
            }

            // Registration successful - show success message and redirect
            setError(''); // Clear any errors
            // Navigate to login with success message
            navigate('/login', {
                state: {
                    message: `Registration successful! Use your email (${formData.email}) to login.`
                }
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Account</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Program</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Courses</span>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="form-step">
            <h2>Create Your Account</h2>
            <p className="step-description">Enter your personal information to get started</p>

            <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirm_password">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="form-step">
            <h2>Select Your Program</h2>
            <p className="step-description">Choose your program and current semester</p>

            <div className="form-group">
                <label htmlFor="program_id">Program</label>
                <select
                    id="program_id"
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleInputChange}
                >
                    <option value="">Select a program</option>
                    {programs.map(program => (
                        <option key={program.id} value={program.id}>
                            {program.program_code} - {program.program_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="semester_id">Semester</label>
                <select
                    id="semester_id"
                    name="semester_id"
                    value={formData.semester_id}
                    onChange={handleInputChange}
                >
                    <option value="">Select a semester</option>
                    {semesters.map(semester => (
                        <option key={semester.id} value={semester.id}>
                            {semester.semester_name}
                        </option>
                    ))}
                </select>
            </div>

            {formData.program_id && formData.semester_id && filteredCourses.length === 0 && (
                <div className="info-message">
                    <span className="info-icon">ℹ️</span>
                    <p>No courses available for this program and semester combination.</p>
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="form-step">
            <h2>Select Your Courses</h2>
            <p className="step-description">
                Choose the courses you want to enroll in. You can add more courses later.
            </p>

            {filteredCourses.length === 0 ? (
                <div className="empty-courses">
                    <span className="empty-icon">📚</span>
                    <p>No courses available for your program and semester.</p>
                    <p className="hint">You can enroll in courses later from your dashboard.</p>
                </div>
            ) : (
                <div className="course-list">
                    {filteredCourses.map(course => (
                        <div
                            key={course.id}
                            className={`course-card ${formData.course_ids.includes(course.id) ? 'selected' : ''}`}
                            onClick={() => handleCourseToggle(course.id)}
                        >
                            <div className="course-checkbox">
                                {formData.course_ids.includes(course.id) ? '✓' : ''}
                            </div>
                            <div className="course-info">
                                <span className="course-code">{course.course_code}</span>
                                <span className="course-name">{course.course_name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="selected-count">
                {formData.course_ids.length} course(s) selected
            </div>
        </div>
    );

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <div className="logo">LLS</div>
                    <h1>Student Registration</h1>
                </div>

                {renderStepIndicator()}

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <div className="form-content">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>

                <div className="form-actions">
                    {step > 1 && (
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleNext}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                        </button>
                    )}
                </div>

                <div className="login-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
