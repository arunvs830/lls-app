import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { semesterApi } from '../../../services/api';

const SemesterForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        semester_name: '',
        semester_number: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await semesterApi.create(formData);
            navigate('/admin/semesters');
        } catch (error) {
            console.error('Error creating:', error);
            alert('Failed to create semester');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Add Semester</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <InputField id="semester_name" label="Semester Name" placeholder="e.g. Semester 1" value={formData.semester_name} onChange={handleChange} required />
                    <InputField id="semester_number" type="number" label="Number" placeholder="1" value={formData.semester_number} onChange={handleChange} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Semester'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/semesters')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default SemesterForm;
