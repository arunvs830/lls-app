import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { programApi } from '../../../services/api';

const ProgramForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        program_name: '',
        program_code: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await programApi.create(formData);
            navigate('/admin/programs');
        } catch (error) {
            console.error('Error creating:', error);
            alert('Failed to create program');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Add Academic Program</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <InputField id="program_name" label="Program Name" placeholder="e.g. Bachelor of Computer Application" value={formData.program_name} onChange={handleChange} required />
                <InputField id="program_code" label="Program Code" placeholder="e.g. BCA" value={formData.program_code} onChange={handleChange} required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Program'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/programs')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default ProgramForm;
