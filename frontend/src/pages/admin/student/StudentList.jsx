import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { studentApi } from '../../../services/api';
import '../../../styles/Table.css';

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

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

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await studentApi.delete(deleteId);
            loadData();
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading students...</p>
        </div>
    );

    return (
        <div className="card">
            <div className="page-header">
                <h2>Students</h2>
                <Button className="btn-lg-width" onClick={() => navigate('/admin/students/new')}>Add Student</Button>
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
                                <button
                                    className="action-btn edit"
                                    onClick={() => navigate(`/admin/students/edit/${student.id}`)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="action-btn danger"
                                    onClick={() => handleDeleteClick(student.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={showConfirm}
                title="Delete Student"
                message="Are you sure you want to delete this student? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setShowConfirm(false)}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default StudentList;
