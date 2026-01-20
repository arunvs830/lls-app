import { API_ORIGIN } from '../../../services/api';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { assignmentApi, submissionApi } from '../../../services/api';

const SubmissionForm = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const studentId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadAssignment();
    }, [assignmentId]);

    const loadAssignment = async () => {
        try {
            const data = await assignmentApi.getOne(assignmentId);
            setAssignment(data);
        } catch (error) {
            console.error('Error loading assignment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('assignment_id', assignmentId);
        formData.append('student_id', studentId);
        formData.append('submission_text', submissionText);
        if (file) {
            formData.append('file', file);
        }

        try {
            await submissionApi.create(formData);
            alert('Assignment submitted successfully!');
            navigate('/student/assignments');
        } catch (error) {
            console.error('Error submitting:', error);
            alert('Failed to submit assignment.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="card"><p>Loading assignment details...</p></div>;

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '40px auto', padding: '32px' }}>
            <div className="page-header" style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#111827', fontWeight: 'bold' }}>Submit Assignment</h2>
            </div>

            {assignment && (
                <div style={{ marginBottom: '2.5rem', padding: '24px', backgroundColor: '#F9FAFB', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h3 style={{ color: '#1F2937', fontSize: '1.25rem', margin: 0, fontWeight: '600' }}>{assignment.title}</h3>
                        <span style={{
                            background: '#EFF6FF',
                            color: '#2563EB',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                        }}>
                            {assignment.max_marks} Marks
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', fontSize: '0.9rem', color: '#6B7280' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📅</span>
                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()} at {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    {assignment.description && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            whiteSpace: 'pre-wrap',
                            color: '#374151',
                            fontSize: '0.95rem',
                            border: '1px solid #E5E7EB',
                            lineHeight: '1.6'
                        }}>
                            <strong style={{ display: 'block', marginBottom: '8px', color: '#111827' }}>Instructions:</strong>
                            {assignment.description}
                        </div>
                    )}

                    {assignment.file_path && (
                        <div style={{ marginTop: '16px' }}>
                            <a href={`${API_ORIGIN}${assignment.file_path}`} target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    background: '#FFFFFF',
                                    color: '#7C3AED',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    border: '1px solid #DDD6FE',
                                    fontWeight: '500',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}>
                                📎 Download Question Attachment
                            </a>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="input-field-wrapper">
                    <label className="input-label" style={{ color: '#374151', fontWeight: 500 }}>Submission Text / Answer</label>
                    <textarea
                        className="input-element"
                        rows="8"
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Type your answer here..."
                        style={{
                            backgroundColor: '#FFFFFF',
                            color: '#1F2937',
                            border: '1px solid #D1D5DB',
                            borderRadius: '10px',
                            padding: '16px',
                            resize: 'vertical',
                            fontSize: '1rem'
                        }}
                    ></textarea>
                </div>

                <div className="input-field-wrapper" style={{ marginTop: '1.5rem' }}>
                    <label className="input-label" style={{ color: '#374151', fontWeight: 500 }}>Upload Response File (Word, PDF, txt)</label>

                    <div style={{
                        border: '2px dashed #D1D5DB',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        background: file ? '#F0FDF4' : '#F9FAFB',
                        borderColor: file ? '#16A34A' : '#D1D5DB',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        position: 'relative'
                    }}>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                            }}
                        />
                        {file ? (
                            <>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#16A34A' }}>✓</div>
                                <p style={{ color: '#15803D', fontWeight: 600, fontSize: '1.1rem' }}>{file.name}</p>
                                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <p style={{ marginTop: '0.5rem', color: '#DC2626', fontSize: '0.9rem', textDecoration: 'underline' }}>Click to change</p>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#9CA3AF' }}>📄</div>
                                <p style={{ color: '#374151', fontWeight: 500, marginBottom: '0.5rem' }}>Drag & drop or <span style={{ color: '#7C3AED' }}>browse</span></p>
                                <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                    Accepted formats: .pdf, .doc, .docx, .txt
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                    <Button type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                        {submitting ? 'Submitting...' : 'Submit Assignment'}
                    </Button>
                    <Button variant="secondary" type="button" onClick={() => navigate('/student/assignments')} style={{ width: '100%', justifyContent: 'center' }}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SubmissionForm;
