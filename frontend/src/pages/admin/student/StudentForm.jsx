import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { studentApi, programApi, semesterApi } from '../../../services/api';

const StudentForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        student_code: '',
        full_name: '',
        email: '',
        password: '',
        program_id: '',
        semester_id: '',
        enrollment_date: new Date().toISOString().split('T')[0]
    });
    const [programs, setPrograms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDropdowns();
    }, []);

    const loadDropdowns = async () => {
        try {
            const [programData, semesterData] = await Promise.all([
                programApi.getAll(),
                semesterApi.getAll()
            ]);
            setPrograms(programData);
            setSemesters(semesterData);
        } catch (error) {
            console.error('Error loading dropdowns:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await studentApi.create(formData);
            navigate('/admin/students');
        } catch (error) {
            console.error('Error creating:', error);
            alert('Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Add Student</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <InputField id="student_code" label="Student Code" placeholder="STU-001" value={formData.student_code} onChange={handleChange} required />
                    <InputField id="full_name" label="Full Name" placeholder="John Doe" value={formData.full_name} onChange={handleChange} required />
                </div>

                <InputField id="email" type="email" label="Email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />

                <InputField id="password" type="password" label="Password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-field-wrapper">
                        <label className="input-label">Program</label>
                        <select id="program_id" className="input-element" value={formData.program_id} onChange={handleChange}>
                            <option value="">Select Program...</option>
                            {programs.map(p => <option key={p.id} value={p.id}>{p.program_name}</option>)}
                        </select>
                    </div>
                    <div className="input-field-wrapper">
                        <label className="input-label">Semester</label>
                        <select id="semester_id" className="input-element" value={formData.semester_id} onChange={handleChange}>
                            <option value="">Select Semester...</option>
                            {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
                        </select>
                    </div>
                </div>

                <InputField id="enrollment_date" type="date" label="Enrollment Date" value={formData.enrollment_date} onChange={handleChange} required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Student'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/students')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
