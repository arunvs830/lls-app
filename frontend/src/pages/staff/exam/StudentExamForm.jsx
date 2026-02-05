import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const StudentExamForm = () => {
    const { courseId, studentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error: notifyError } = useNotification();

    const [studentInfo, setStudentInfo] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        cca1_marks: '',
        cca2_marks: '',
        cca1_file: null,
        cca2_file: null
    });

    const [existingFiles, setExistingFiles] = useState({
        cca1_file_path: null,
        cca2_file_path: null
    });

    useEffect(() => {
        loadData();
    }, [courseId, studentId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/exams/student/${studentId}/course/${courseId}`);
            const data = await response.json();

            setStudentInfo(data.student);
            setCourseInfo(data.course);

            if (data.exam) {
                setFormData({
                    cca1_marks: data.exam.cca1_marks ?? '',
                    cca2_marks: data.exam.cca2_marks ?? '',
                    cca1_file: null,
                    cca2_file: null
                });
                setExistingFiles({
                    cca1_file_path: data.exam.cca1_file_path,
                    cca2_file_path: data.exam.cca2_file_path
                });
            }
        } catch (error) {
            console.error('Error loading exam data:', error);
            notifyError('Failed to load exam data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formPayload = new FormData();
            formPayload.append('student_id', studentId);
            formPayload.append('course_id', courseId);
            formPayload.append('staff_id', user.id);

            if (formData.cca1_marks !== '') {
                formPayload.append('cca1_marks', formData.cca1_marks);
            }
            if (formData.cca2_marks !== '') {
                formPayload.append('cca2_marks', formData.cca2_marks);
            }
            if (formData.cca1_file) {
                formPayload.append('cca1_file', formData.cca1_file);
            }
            if (formData.cca2_file) {
                formPayload.append('cca2_file', formData.cca2_file);
            }

            const response = await fetch(`${API_BASE}/api/exams`, {
                method: 'POST',
                body: formPayload
            });

            if (!response.ok) {
                throw new Error('Failed to save exam data');
            }

            success('Exam data saved successfully');
            navigate(`/staff/exam/${courseId}/students`);
        } catch (error) {
            console.error('Error saving exam:', error);
            notifyError('Failed to save exam data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#6B7280' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.25rem' }}>
                        Manage Exam - {studentInfo?.full_name}
                    </h2>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
                        {courseInfo?.course_name} ({courseInfo?.course_code})
                    </p>
                </div>
            </div>

            <div style={{
                background: '#F3F4F6',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
            }}>
                <p style={{ margin: 0, color: '#374151' }}>
                    <strong>Student:</strong> {studentInfo?.full_name} ({studentInfo?.student_code})
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
                    {studentInfo?.email}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* CCA1 Section */}
                <div style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1F2937' }}>
                        📋 CCA1 (Continuous Assessment 1)
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <InputField
                                id="cca1_marks"
                                type="number"
                                label="CCA1 Marks"
                                placeholder="Enter marks"
                                value={formData.cca1_marks}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="input-field-wrapper">
                            <label className="input-label">Upload Answer Paper</label>
                            <input
                                type="file"
                                className="input-element"
                                onChange={(e) => handleFileChange(e, 'cca1_file')}
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{ padding: '0.5rem' }}
                            />
                            {existingFiles.cca1_file_path && (
                                <p style={{ fontSize: '0.8rem', color: '#059669', margin: '0.5rem 0 0 0' }}>
                                    ✓ File already uploaded
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* CCA2 Section */}
                <div style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1F2937' }}>
                        📖 CCA2 (Continuous Assessment 2)
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <InputField
                                id="cca2_marks"
                                type="number"
                                label="CCA2 Marks"
                                placeholder="Enter marks"
                                value={formData.cca2_marks}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="input-field-wrapper">
                            <label className="input-label">Upload Answer Paper</label>
                            <input
                                type="file"
                                className="input-element"
                                onChange={(e) => handleFileChange(e, 'cca2_file')}
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{ padding: '0.5rem' }}
                            />
                            {existingFiles.cca2_file_path && (
                                <p style={{ fontSize: '0.8rem', color: '#059669', margin: '0.5rem 0 0 0' }}>
                                    ✓ File already uploaded
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Exam Data'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/staff/exam/${courseId}/students`)}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default StudentExamForm;
