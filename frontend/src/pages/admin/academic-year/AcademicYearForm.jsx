import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { academicYearApi } from '../../../services/api';

const AcademicYearForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        year_name: '',
        start_date: '',
        end_date: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await academicYearApi.create(formData);
            navigate('/admin/academic-years');
        } catch (error) {
            console.error('Error creating:', error);
            alert('Failed to create academic year');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Add Academic Year</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <InputField
                    id="year_name"
                    label="Year Name (e.g., 2025-2026)"
                    placeholder="2025-2026"
                    value={formData.year_name}
                    onChange={handleChange}
                    required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <InputField id="start_date" type="date" label="Start Date" value={formData.start_date} onChange={handleChange} required />
                    <InputField id="end_date" type="date" label="End Date" value={formData.end_date} onChange={handleChange} required />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Academic Year'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/academic-years')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default AcademicYearForm;
