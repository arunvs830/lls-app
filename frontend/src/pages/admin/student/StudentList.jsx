import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { studentApi } from '../../../services/api';
import '../../../styles/Table.css';

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await studentApi.getAll();
            setStudents(data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await studentApi.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    if (loading) return <div className="card"><p>Loading...</p></div>;

    return (
        <div className="card">
            <div className="page-header">
                <h2>Students</h2>
                <div style={{ width: '200px' }}>
                    <Button onClick={() => navigate('/admin/students/new')}>Add Student</Button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student Code</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>No students found</td></tr>
                    ) : students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.student_code}</td>
                            <td>{student.full_name}</td>
                            <td>{student.email}</td>
                            <td>
                                <button className="btn-secondary action-btn" onClick={() => handleDelete(student.id)} style={{ color: '#ef4444' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentList;
