import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { staffApi } from '../../../services/api';

const StaffForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        staff_code: '',
        full_name: '',
        username: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await staffApi.create(formData);
            navigate('/admin/staff');
        } catch (error) {
            console.error('Error creating:', error);
            alert('Failed to create staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Add Staff Member</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <InputField id="staff_code" label="Staff Code" placeholder="STF-001" value={formData.staff_code} onChange={handleChange} required />
                    <InputField id="full_name" label="Full Name" placeholder="Dr. John Smith" value={formData.full_name} onChange={handleChange} required />
                </div>

                <InputField id="username" label="Username" placeholder="john.smith" value={formData.username} onChange={handleChange} required />
                <InputField id="email" type="email" label="Email" placeholder="john.smith@lls.edu" value={formData.email} onChange={handleChange} required />
                <InputField id="password" type="password" label="Password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Staff'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/staff')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default StaffForm;
