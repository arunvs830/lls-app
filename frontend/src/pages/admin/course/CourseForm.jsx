import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { courseApi, programApi, semesterApi } from '../../../services/api';

const CourseForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        course_name: '',
        course_code: '',
        program_id: '',
        semester_id: ''
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
            console.error('Error loading:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await courseApi.create(formData);
            navigate('/admin/courses');
        } catch (error) {
            console.error('Error creating:', error);
            alert('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Add Language Course</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-field-wrapper">
                        <label className="input-label">Program</label>
                        <select id="program_id" className="input-element" value={formData.program_id} onChange={handleChange} required>
                            <option value="">Select Program...</option>
                            {programs.map(p => <option key={p.id} value={p.id}>{p.program_name}</option>)}
                        </select>
                    </div>
                    <div className="input-field-wrapper">
                        <label className="input-label">Semester</label>
                        <select id="semester_id" className="input-element" value={formData.semester_id} onChange={handleChange} required>
                            <option value="">Select Semester...</option>
                            {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
                        </select>
                    </div>
                </div>

                <InputField id="course_name" label="Course Name" placeholder="e.g. German A1" value={formData.course_name} onChange={handleChange} required />
                <InputField id="course_code" label="Course Code" placeholder="e.g. GER-A1" value={formData.course_code} onChange={handleChange} required />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Course'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/courses')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default CourseForm;
