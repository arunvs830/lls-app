import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { academicYearApi } from '../../../services/api';
import '../../../styles/Table.css';

const AcademicYearList = () => {
    const navigate = useNavigate();
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await academicYearApi.getAll();
            setYears(data);
        } catch (error) {
            console.error('Error loading academic years:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this?')) {
            try {
                await academicYearApi.delete(id);
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
                <h2>Academic Years</h2>
                <div style={{ width: '200px' }}>
                    <Button onClick={() => navigate('/admin/academic-years/new')}>Add New Year</Button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {years.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>No academic years found</td></tr>
                    ) : years.map((year) => (
                        <tr key={year.id}>
                            <td>{year.year_name}</td>
                            <td>{year.start_date}</td>
                            <td>{year.end_date}</td>
                            <td>
                                <button className="btn-secondary action-btn" onClick={() => handleDelete(year.id)} style={{ color: '#ef4444' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AcademicYearList;
