import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { submissionApi, assignmentApi } from '../../../services/api';
import '../../../styles/Table.css';

const SubmissionList = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(null); // id of submission being evaluated
    const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });

    const staffId = localStorage.getItem('userId') || 1;

    useEffect(() => {
        loadData();
    }, [assignmentId]);

    const loadData = async () => {
        try {
            const [assignmentData, submissionData] = await Promise.all([
                assignmentApi.getOne(assignmentId),
                submissionApi.getAll(assignmentId)
            ]);
            setAssignment(assignmentData);
            setSubmissions(submissionData);
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = (sub) => {
        setEvaluating(sub.id);
        setGradeForm({
            marks: sub.evaluation?.marks_obtained || '',
            feedback: sub.evaluation?.feedback || ''
        });
    };

    const submitEvaluation = async (submissionId) => {
        try {
            await submissionApi.evaluate(submissionId, {
                staff_id: staffId,
                marks_obtained: gradeForm.marks,
                feedback: gradeForm.feedback
            });
            alert('Evaluation saved!');
            setEvaluating(null);
            loadData();
        } catch (error) {
            console.error('Error saving evaluation:', error);
            alert('Failed to save evaluation.');
        }
    };

    if (loading) return <div className="card"><p>Loading submissions...</p></div>;

    return (
        <div className="card">
            <div className="page-header" style={{ display: 'block' }}>
                <button onClick={() => navigate('/staff/assignments')} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '0.5rem' }}>
                    ← Back to Assignments
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Submissions: {assignment?.title}</h2>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total: {submissions.length}</span>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Submitted At</th>
                        <th>Work</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No submissions received yet</td></tr>
                    ) : submissions.map((s) => (
                        <tr key={s.id}>
                            <td>Student #{s.student_id}</td>
                            <td>{new Date(s.submitted_at).toLocaleString()}</td>
                            <td>
                                <div>
                                    {s.submission_text && (
                                        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontStyle: 'italic', opacity: 0.8 }}>
                                            "{s.submission_text.substring(0, 50)}..."
                                        </div>
                                    )}
                                    {s.file_path && (
                                        <a href={`http://localhost:5001${s.file_path}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontWeight: 500 }}>
                                            📄 View Attachment
                                        </a>
                                    )}
                                </div>
                            </td>
                            <td>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    backgroundColor: s.status === 'evaluated' ? '#10b98120' : '#3b82f620',
                                    color: s.status === 'evaluated' ? '#10b981' : '#3b82f6'
                                }}>
                                    {s.status === 'evaluated' ? 'Graded' : 'Pending'}
                                </span>
                            </td>
                            <td>
                                {s.evaluation ? (
                                    <span style={{ fontWeight: 600 }}>{s.evaluation.marks_obtained} / {assignment.max_marks}</span>
                                ) : '--'}
                            </td>
                            <td>
                                {evaluating === s.id ? (
                                    <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <input
                                            type="number"
                                            placeholder="Marks"
                                            value={gradeForm.marks}
                                            onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                                            style={{ width: '100%', marginBottom: '0.5rem', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px' }}
                                        />
                                        <textarea
                                            placeholder="Feedback"
                                            value={gradeForm.feedback}
                                            onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                            style={{ width: '100%', marginBottom: '0.5rem', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px', height: '60px' }}
                                        ></textarea>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button size="small" onClick={() => submitEvaluation(s.id)}>Save</Button>
                                            <button onClick={() => setEvaluating(null)} className="btn-secondary" style={{ padding: '4px 8px' }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button size="small" onClick={() => handleEvaluate(s)}>
                                        {s.status === 'evaluated' ? 'Re-grade' : 'Grade'}
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubmissionList;
