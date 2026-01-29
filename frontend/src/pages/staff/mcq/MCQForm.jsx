import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { mcqApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/MCQForm.css';

const MCQForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { id } = useParams();
    const isEdit = Boolean(id);

    // Read URL query params (from "Add Quiz" button on material page)
    const queryParams = new URLSearchParams(location.search);
    const urlCourseId = queryParams.get('course_id') || '';
    const urlMaterialId = queryParams.get('study_material_id') || '';

    const [courses, setCourses] = useState([]);
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [linkType, setLinkType] = useState('general'); // 'general' or 'material'
    const [mode, setMode] = useState('single'); // 'single' or 'import'
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
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

    const staffId = user?.id;

    useEffect(() => {
        loadCourses();
        if (isEdit) loadMCQ();
    }, [id]);

    useEffect(() => {
        if (formData.course_id && linkType === 'material') {
            loadStudyMaterials(formData.course_id);
        }
    }, [formData.course_id, linkType]);

    // Initialize linkType based on existing data
    useEffect(() => {
        if (urlMaterialId || formData.study_material_id) {
            setLinkType('material');
        }
    }, [urlMaterialId, formData.study_material_id]);

    const loadCourses = async () => {
        try {
            // Fetch only courses assigned to this staff member
            if (staffId) {
                const response = await fetch(`/api/staff-courses?staff_id=${staffId}&include_course=true`);
                const data = await response.json();

                // Map to format expected by dropdown (using course_id from allocation)
                const mappedCourses = data.map(item => ({
                    id: item.course_id,
                    course_name: item.course_name,
                    course_code: item.course_code
                }));

                setCourses(mappedCourses);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            setNotification({ show: true, message: 'Failed to load courses', type: 'error' });
        }
    };

    const loadStudyMaterials = async (courseId) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/materials`);
            const data = await response.json();
            setStudyMaterials(data);
        } catch (error) {
            console.error('Error loading study materials:', error);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/mcqs/template', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mcq_import_template.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download template');
            }
        } catch (error) {
            console.error('Error downloading template:', error);
            alert('Error downloading template');
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
            if (data.study_material_id) {
                setLinkType('material');
            }
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
            if (mode === 'import') {
                const fileInput = document.getElementById('import-file');
                const file = fileInput?.files[0];
                if (!file) {
                    setNotification({ show: true, message: 'Please select a file to upload', type: 'error' });
                    setLoading(false);
                    return;
                }

                const importData = new FormData();
                importData.append('file', file);
                importData.append('staff_id', staffId);
                if (formData.course_id) {
                    importData.append('course_id', formData.course_id);
                }
                if (linkType === 'material' && formData.study_material_id) {
                    importData.append('study_material_id', formData.study_material_id);
                }

                const token = localStorage.getItem('token');
                const response = await fetch('/api/mcqs/import', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: importData
                });
                const data = await response.json();

                if (response.ok) {
                    alert(`${data.message}\n${data.errors?.length > 0 ? 'Warnings:\n' + data.errors.join('\n') : ''}`);
                    navigate('/staff/mcqs');
                } else {
                    setNotification({ show: true, message: data.error || 'Import failed', type: 'error' });
                }
            } else {
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

                // Navigate back
                if (urlMaterialId) {
                    navigate(-1);
                } else {
                    navigate('/staff/mcqs');
                }
            }
        } catch (error) {
            console.error('Error saving MCQ:', error);
            setNotification({ show: true, message: 'Failed to save question', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mcq-form-container">
            <header className="mcq-form-header">
                <button onClick={() => navigate('/staff/mcqs')} className="mcq-form-back-btn">
                    ← Back
                </button>
                <h1 className="mcq-form-title">{isEdit ? 'Edit Question' : 'Create Question'}</h1>
            </header>

            {/* Notification Banner */}
            {notification.show && (
                <div className={`notification-banner ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mcq-form-card">
                <h2>{isEdit ? 'Edit Question' : 'Add New Question'}</h2>

                {/* Creation Mode Toggle */}
                {!isEdit && (
                    <div className="mcq-form-field">
                        <label className="mcq-form-label">Creation Mode</label>
                        <div className="mcq-link-type-options">
                            <label className="mcq-form-radio-label">
                                <input
                                    type="radio"
                                    name="mode"
                                    value="single"
                                    checked={mode === 'single'}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="mcq-form-radio"
                                />
                                Manual Entry
                            </label>
                            <label className="mcq-form-radio-label">
                                <input
                                    type="radio"
                                    name="mode"
                                    value="import"
                                    checked={mode === 'import'}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="mcq-form-radio"
                                />
                                Bulk Import (Excel)
                            </label>
                        </div>
                    </div>
                )}

                {/* Course Selection */}
                <div className="mcq-form-field">
                    <label htmlFor="course_id" className="mcq-form-label">Course *</label>
                    <select
                        id="course_id"
                        name="course_id"
                        value={formData.course_id}
                        onChange={handleChange}
                        required
                        className="mcq-form-select"
                        aria-required="true"
                    >
                        <option value="">Select a course</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                        ))}
                    </select>
                </div>

                {/* Link Type Selection */}
                <div className="mcq-form-field">
                    <label className="mcq-form-label">Question Type</label>
                    <div className="mcq-link-type-options">
                        <label className="mcq-form-radio-label">
                            <input
                                type="radio"
                                name="linkType"
                                value="general"
                                checked={linkType === 'general'}
                                onChange={(e) => {
                                    setLinkType(e.target.value);
                                    setFormData(prev => ({ ...prev, study_material_id: '' }));
                                }}
                                className="mcq-form-radio"
                            />
                            General Question
                        </label>
                        <label className="mcq-form-radio-label">
                            <input
                                type="radio"
                                name="linkType"
                                value="material"
                                checked={linkType === 'material'}
                                onChange={(e) => setLinkType(e.target.value)}
                                className="mcq-form-radio"
                            />
                            Based on Study Material
                        </label>
                    </div>
                </div>

                {/* Study Material Selection */}
                {linkType === 'material' && (
                    <div className="mcq-form-field">
                        <label htmlFor="study_material_id" className="mcq-form-label">Study Material *</label>
                        <select
                            id="study_material_id"
                            name="study_material_id"
                            value={formData.study_material_id}
                            onChange={handleChange}
                            required={linkType === 'material'}
                            className="mcq-form-select"
                            disabled={!formData.course_id}
                        >
                            <option value="">Select Study Material</option>
                            {studyMaterials.map(m => (
                                <option key={m.id} value={m.id}>{m.title} ({m.file_type})</option>
                            ))}
                        </select>
                        {!formData.course_id && (
                            <p className="mcq-form-hint">Please select a course first</p>
                        )}
                    </div>
                )}

                {/* Import Mode File Upload */}
                {mode === 'import' && !isEdit && (
                    <div className="mcq-form-field">
                        <label className="mcq-form-label">Upload Excel File</label>
                        <input
                            type="file"
                            id="import-file"
                            accept=".xlsx"
                            className="mcq-form-input"
                            required
                        />
                        <div style={{ marginTop: '10px' }}>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="mcq-list-download-btn"
                                style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                            >
                                ⬇ Download Template
                            </button>
                            <p className="mcq-form-hint">
                                Download the template to ensure correct format. Course code is automatically applied from the selection above.
                            </p>
                        </div>
                    </div>
                )}

                {/* Manual Entry Fields */}
                {mode === 'single' && (
                    <>
                        {/* Question Text */}
                        <div className="mcq-form-field">
                            <label htmlFor="question_text" className="mcq-form-label">Question *</label>
                            <textarea
                                id="question_text"
                                name="question_text"
                                value={formData.question_text}
                                onChange={handleChange}
                                required
                                placeholder="Enter your question here..."
                                className="mcq-form-textarea"
                                rows={3}
                                aria-required="true"
                            />
                        </div>

                        {/* Options */}
                        <div className="mcq-form-field">
                            <label className="mcq-form-label">Answer Options</label>
                            <div className="mcq-form-options-grid">
                                {['A', 'B', 'C', 'D'].map(opt => (
                                    <div key={opt} className="mcq-form-option-field">
                                        <div className="mcq-form-option-header">
                                            <span className="mcq-form-option-label">Option {opt}</span>
                                            <label className="mcq-form-radio-label">
                                                <input
                                                    type="radio"
                                                    name="correct_answer"
                                                    value={opt}
                                                    checked={formData.correct_answer === opt}
                                                    onChange={handleChange}
                                                    className="mcq-form-radio"
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
                                            className="mcq-form-input"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Marks */}
                        <div className="mcq-form-field">
                            <label className="mcq-form-label">Marks</label>
                            <input
                                type="number"
                                name="marks"
                                value={formData.marks}
                                onChange={handleChange}
                                min="0.5"
                                step="0.5"
                                className="mcq-form-input"
                                style={{ width: '120px' }}
                            />
                        </div>
                    </>
                )}

                {/* Submit */}
                <div className="mcq-form-actions">
                    <button type="button" onClick={() => navigate('/staff/mcqs')} className="mcq-form-cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="mcq-form-submit-btn">
                        {loading ? 'Saving...' : (isEdit ? (mode === 'import' ? 'Import Questions' : 'Update Question') : (mode === 'import' ? 'Import Questions' : 'Create Question'))}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MCQForm;
