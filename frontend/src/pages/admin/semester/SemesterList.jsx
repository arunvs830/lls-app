import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { semesterApi } from '../../../services/api';
import '../../../styles/Table.css';

const SemesterList = () => {
    const navigate = useNavigate();
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await semesterApi.getAll();
            setSemesters(data);
        } catch (error) {
            console.error('Error loading semesters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await semesterApi.delete(id);
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
                <h2>Semesters</h2>
                <div style={{ width: '200px' }}>
                    <Button onClick={() => navigate('/admin/semesters/new')}>Add Semester</Button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Number</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {semesters.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No semesters found</td></tr>
                    ) : semesters.map((sem) => (
                        <tr key={sem.id}>
                            <td>{sem.semester_name}</td>
                            <td>{sem.semester_number}</td>
                            <td>
                                <button className="btn-secondary action-btn" onClick={() => handleDelete(sem.id)} style={{ color: '#ef4444' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SemesterList;
