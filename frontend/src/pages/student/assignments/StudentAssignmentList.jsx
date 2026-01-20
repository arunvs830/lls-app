import { API_ORIGIN } from '../../../services/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { assignmentApi, submissionApi } from '../../../services/api';
import '../../../styles/Table.css';

const StudentAssignmentList = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [loading, setLoading] = useState(true);

    // In a real app, you'd get this from auth context
    const studentId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user'))?.id || 1;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Ideally we'd fetch assignments for courses the student is enrolled in
            // For now, let's fetch all and filter or just show all available
            const [assignmentData, submissionData] = await Promise.all([
                assignmentApi.getAll(),
                submissionApi.getByStudent(studentId)
            ]);

            setAssignments(assignmentData);

            // Map submissions by assignment_id
            const submissionMap = {};
            submissionData.forEach(s => {
                submissionMap[s.assignment_id] = s;
            });
            setSubmissions(submissionMap);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="card"><p>Loading assignments...</p></div>;

    return (
        <div className="card">
            <div className="page-header">
                <h2>My Assignments</h2>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Due Date</th>
                        <th>Max Marks</th>
                        <th>Status</th>
                        <th>Grade</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No assignments found</td></tr>
                    ) : assignments.map((a) => {
                        const submission = submissions[a.id];
                        const isOverdue = new Date(a.due_date) < new Date() && !submission;

                        return (
                            <tr key={a.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                                    {a.file_path && (
                                        <a href={`${API_ORIGIN}${a.file_path}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>
                                            📥 Download Question
                                        </a>
                                    )}
                                </td>
                                <td style={{ color: isOverdue ? '#ef4444' : 'inherit' }}>
                                    {new Date(a.due_date).toLocaleString()}
                                </td>
                                <td>{a.max_marks}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        backgroundColor: submission ? (submission.status === 'evaluated' ? '#10b98120' : '#3b82f620') : '#6b728020',
                                        color: submission ? (submission.status === 'evaluated' ? '#10b981' : '#3b82f6') : '#9ca3af'
                                    }}>
                                        {submission ? (submission.status === 'evaluated' ? 'Graded' : 'Submitted') : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    {submission?.evaluation ? (
                                        <span style={{ fontWeight: 600 }}>{submission.evaluation.marks_obtained} / {a.max_marks}</span>
                                    ) : '--'}
                                </td>
                                <td>
                                    {!submission ? (
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/student/assignments/submit/${a.id}`)}
                                            disabled={isOverdue}
                                        >
                                            Submit
                                        </Button>
                                    ) : (
                                        <button
                                            className="btn-secondary"
                                            style={{ color: '#8b5cf6', background: 'none' }}
                                            onClick={() => navigate(`/student/assignments/view/${a.id}`)}
                                        >
                                            View Submission
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default StudentAssignmentList;
