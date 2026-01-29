import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { staffApi } from '../../../services/api';
import '../../../styles/Table.css';

const StaffList = () => {
    const navigate = useNavigate();
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await staffApi.getAll();
            setStaffMembers(data);
        } catch (error) {
            console.error('Error loading staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await staffApi.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading staff members...</p>
        </div>
    );

    return (
        <div className="card">
            <div className="page-header">
                <h2>Staff Members</h2>
                <Button className="btn-lg-width" onClick={() => navigate('/admin/staff/new')}>Add Staff</Button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Staff Code</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {staffMembers.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>No staff found</td></tr>
                    ) : staffMembers.map((staff) => (
                        <tr key={staff.id}>
                            <td>{staff.staff_code}</td>
                            <td>{staff.full_name}</td>
                            <td>{staff.email}</td>
                            <td>
                                <button className="action-btn danger" onClick={() => handleDelete(staff.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StaffList;
