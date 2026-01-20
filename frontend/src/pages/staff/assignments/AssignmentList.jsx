import { API_ORIGIN } from '../../../services/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { assignmentApi, courseApi } from '../../../services/api';
import '../../../styles/Table.css';

const AssignmentList = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assignmentData, courseData] = await Promise.all([
                assignmentApi.getAll(),
                courseApi.getAll()
            ]);

            // Map course names to assignments
            const enrichedAssignments = assignmentData.map(a => ({
                ...a,
                course_name: courseData.find(c => c.id === a.course_id)?.course_name || 'N/A'
            }));

            setAssignments(enrichedAssignments);
        } catch (error) {
            console.error('Error loading assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            try {
                await assignmentApi.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting assignment:', error);
                alert('Failed to delete assignment.');
            }
        }
    };

    if (loading) return <div className="card"><p>Loading...</p></div>;

    return (
        <div className="card">
            <div className="page-header">
                <h2>Manage Assignments</h2>
                <div style={{ width: '200px' }}>
                    <Button onClick={() => navigate('/staff/assignments/new')}>Create Assignment</Button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Course</th>
                        <th>Due Date</th>
                        <th>Max Marks</th>
                        <th>Attachment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No assignments created yet</td></tr>
                    ) : assignments.map((a) => (
                        <tr key={a.id}>
                            <td>{a.title}</td>
                            <td>{a.course_name}</td>
                            <td>{new Date(a.due_date).toLocaleString()}</td>
                            <td>{a.max_marks}</td>
                            <td>
                                {a.file_path ? (
                                    <a href={`${API_ORIGIN}${a.file_path}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6' }}>
                                        View File
                                    </a>
                                ) : 'None'}
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => navigate(`/staff/assignments/${a.id}/submissions`)} className="btn-secondary action-btn" style={{ color: '#8b5cf6', padding: '4px 8px' }}>Submissions</button>
                                    <button onClick={() => navigate(`/staff/assignments/edit/${a.id}`)} className="btn-secondary action-btn" style={{ padding: '4px 8px' }}>Edit</button>
                                    <button onClick={() => handleDelete(a.id)} className="btn-secondary action-btn" style={{ color: '#ef4444', padding: '4px 8px' }}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignmentList;
