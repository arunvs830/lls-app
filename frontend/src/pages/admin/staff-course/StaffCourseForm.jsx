import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { staffCourseApi, staffApi, courseApi, academicYearApi } from '../../../services/api';

const StaffCourseForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        staff_id: '',
        course_id: '',
        academic_year_id: '',
        assigned_date: new Date().toISOString().split('T')[0]
    });
    const [staff, setStaff] = useState([]);
    const [courses, setCourses] = useState([]);
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDropdowns();
    }, []);

    const loadDropdowns = async () => {
        try {
            const [staffData, courseData, yearData] = await Promise.all([
                staffApi.getAll(),
                courseApi.getAll(),
                academicYearApi.getAll()
            ]);
            setStaff(staffData);
            setCourses(courseData);
            setYears(yearData);
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
            await staffCourseApi.create(formData);
            navigate('/admin/staff-allocation');
        } catch (error) {
            console.error('Error creating:', error);
            alert('Failed to assign course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Assign Course to Staff</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-field-wrapper">
                    <label className="input-label">Staff Member</label>
                    <select id="staff_id" className="input-element" value={formData.staff_id} onChange={handleChange} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }} required>
                        <option value="">Select Staff...</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    </select>
                </div>

                <div className="input-field-wrapper">
                    <label className="input-label">Course</label>
                    <select id="course_id" className="input-element" value={formData.course_id} onChange={handleChange} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }} required>
                        <option value="">Select Course...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                    </select>
                </div>

                <div className="input-field-wrapper">
                    <label className="input-label">Academic Year</label>
                    <select id="academic_year_id" className="input-element" value={formData.academic_year_id} onChange={handleChange} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}>
                        <option value="">Select Year...</option>
                        {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                    </select>
                </div>

                <InputField id="assigned_date" type="date" label="Assignment Date" value={formData.assigned_date} onChange={handleChange} required />

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <Button type="submit" disabled={loading}>{loading ? 'Assigning...' : 'Assign'}</Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/staff-allocation')}>Cancel</Button>
                </div>
            </form>
        </div>
    );
};

export default StaffCourseForm;
