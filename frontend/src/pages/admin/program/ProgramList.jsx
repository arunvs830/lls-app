import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { programApi } from '../../../services/api';
import '../../../styles/Table.css';

const ProgramList = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await programApi.getAll();
            setPrograms(data);
        } catch (error) {
            console.error('Error loading programs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await programApi.delete(id);
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
                <h2>Academic Programs</h2>
                <div style={{ width: '200px' }}>
                    <Button onClick={() => navigate('/admin/programs/new')}>Add Program</Button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Program Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {programs.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No programs found</td></tr>
                    ) : programs.map((program) => (
                        <tr key={program.id}>
                            <td>{program.program_code}</td>
                            <td>{program.program_name}</td>
                            <td>
                                <button className="btn-secondary action-btn" onClick={() => handleDelete(program.id)} style={{ color: '#ef4444' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProgramList;
