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
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Submit Assignment</h2>
            </div>

            {assignment && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{assignment.title}</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                        <span>📅 Due: {new Date(assignment.due_date).toLocaleString()}</span>
                        <span>🎯 Marks: {assignment.max_marks}</span>
                    </div>
                    {assignment.description && (
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                            {assignment.description}
                        </div>
                    )}
                    {assignment.file_path && (
                        <div style={{ marginTop: '1rem' }}>
                            <a href={`http://localhost:5001${assignment.file_path}`} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                📎 Download Question Attachment
                            </a>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="input-field-wrapper">
                    <label className="input-label">Submission Text / Answer</label>
                    <textarea
                        className="input-element"
                        rows="8"
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Type your answer here or provide additional notes..."
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}
                    ></textarea>
                </div>

                <div className="input-field-wrapper" style={{ marginTop: '1.5rem' }}>
                    <label className="input-label">Upload Response File (Word, PDF, txt)</label>
                    <input
                        type="file"
                        className="input-element"
                        onChange={handleFileChange}
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                        Accepted formats: .pdf, .doc, .docx, .txt
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                    <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Assignment'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/student/assignments')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default SubmissionForm;
