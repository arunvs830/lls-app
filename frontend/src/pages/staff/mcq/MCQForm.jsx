import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { mcqApi, courseApi } from '../../../services/api';

const MCQForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Read URL query params (from "Add Quiz" button on material page)
    const queryParams = new URLSearchParams(location.search);
    const urlCourseId = queryParams.get('course_id') || '';
    const urlMaterialId = queryParams.get('study_material_id') || '';

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        marks: 1,
        course_id: urlCourseId,
        study_material_id: urlMaterialId,
    });

    const staffId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadCourses();
        if (isEdit) loadMCQ();
    }, [id]);

    const loadCourses = async () => {
        try {
            const data = await courseApi.getAll();
            setCourses(data);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    const loadMCQ = async () => {
        try {
            const data = await mcqApi.getOne(id);
            setFormData({
                question_text: data.question_text,
                option_a: data.option_a,
                option_b: data.option_b,
                option_c: data.option_c || '',
                option_d: data.option_d || '',
                correct_answer: data.correct_answer,
                marks: data.marks,
                course_id: data.course_id,
                study_material_id: data.study_material_id || '',
            });
        } catch (error) {
            console.error('Error loading MCQ:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                staff_id: staffId,
                study_material_id: formData.study_material_id || null,
            };

            if (isEdit) {
                await mcqApi.update(id, payload);
            } else {
                await mcqApi.create(payload);
            }

            // Navigate back - if came from material page, go back there
            if (urlMaterialId) {
                navigate(-1);
            } else {
                navigate('/staff/mcqs');
            }
        } catch (error) {
            console.error('Error saving MCQ:', error);
            alert('Failed to save question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/staff/mcqs')} style={styles.backBtn}>
                    ← Back
                </button>
                <h1 style={styles.title}>{isEdit ? 'Edit Question' : 'Create Question'}</h1>
            </header>

            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Course Selection */}
                <div style={styles.field}>
                    <label style={styles.label}>Course *</label>
                    <select
                        name="course_id"
                        value={formData.course_id}
                        onChange={handleChange}
                        required
                        style={styles.select}
                    >
                        <option value="">Select a course</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                        ))}
                    </select>
                </div>

                {/* Question Text */}
                <div style={styles.field}>
                    <label style={styles.label}>Question *</label>
                    <textarea
                        name="question_text"
                        value={formData.question_text}
                        onChange={handleChange}
                        required
                        placeholder="Enter your question here..."
                        style={styles.textarea}
                        rows={3}
                    />
                </div>

                {/* Options */}
                <div style={styles.optionsSection}>
                    <label style={styles.label}>Answer Options</label>
                    <div style={styles.optionsGrid}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                            <div key={opt} style={styles.optionField}>
                                <div style={styles.optionHeader}>
                                    <span style={styles.optionLabel}>Option {opt}</span>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="correct_answer"
                                            value={opt}
                                            checked={formData.correct_answer === opt}
                                            onChange={handleChange}
                                            style={styles.radio}
                                        />
                                        Correct
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    name={`option_${opt.toLowerCase()}`}
                                    value={formData[`option_${opt.toLowerCase()}`]}
                                    onChange={handleChange}
                                    required={opt === 'A' || opt === 'B'}
                                    placeholder={`Enter option ${opt}${opt === 'C' || opt === 'D' ? ' (optional)' : ''}`}
                                    style={styles.input}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Marks */}
                <div style={styles.field}>
                    <label style={styles.label}>Marks</label>
                    <input
                        type="number"
                        name="marks"
                        value={formData.marks}
                        onChange={handleChange}
                        min="0.5"
                        step="0.5"
                        style={{ ...styles.input, width: '120px' }}
                    />
                </div>

                {/* Submit */}
                <div style={styles.actions}>
                    <button type="button" onClick={() => navigate('/staff/mcqs')} style={styles.cancelBtn}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? 'Saving...' : (isEdit ? 'Update Question' : 'Create Question')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '800px' },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#8b5cf6',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    title: { color: 'white', fontSize: '1.75rem', fontWeight: '700', margin: 0 },
    form: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.06)',
    },
    field: { marginBottom: '24px' },
    label: {
        display: 'block',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '12px 16px',
        color: 'white',
        fontSize: '1rem',
    },
    textarea: {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '12px 16px',
        color: 'white',
        fontSize: '1rem',
        resize: 'vertical',
    },
    select: {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '12px 16px',
        color: 'white',
        fontSize: '1rem',
    },
    optionsSection: { marginBottom: '24px' },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    optionField: {
        background: 'rgba(255,255,255,0.02)',
        padding: '16px',
        borderRadius: '12px',
    },
    optionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    optionLabel: {
        color: 'white',
        fontWeight: '600',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.85rem',
        cursor: 'pointer',
    },
    radio: {
        accentColor: '#10b981',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    cancelBtn: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '10px',
        cursor: 'pointer',
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'none',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};

export default MCQForm;
