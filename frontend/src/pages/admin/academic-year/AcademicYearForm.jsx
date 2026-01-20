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
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError(null); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await academicYearApi.create(formData);
            navigate('/admin/academic-years');
        } catch (error) {
            console.error('Error creating academic year:', error);

            // Try to get error message from response
            const errorMessage = error.message || 'Failed to create academic year';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Add Academic Year</h2>
            </div>

            {error && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '4px',
                    color: '#c00'
                }}>
                    {error}
                </div>
            )}

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Academic Year'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/academic-years')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default AcademicYearForm;
